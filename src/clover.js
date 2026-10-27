// Clover OOC → Revamped Image Gen, directly.
// When the user sends a message holding a Clover <ooc> image order and both
// 🍀 Clover OOC and Revamped Image Gen are on, the order is generated straight
// away (Clover's text, wrapper and command removed) and the finished image is
// appended to that same message. A marker is written into the message before
// the AI reply is built, so the chat model knows not to draw it again.

const MARK_PENDING = (id) => `<!--cb-clover:sent:${id}-->`;
const MARK_FAILED = (id) => `<!--cb-clover:failed:${id}-->`;
const MARK_DONE = (id) => `<!--cb-clover:done:${id}-->`;
const ORDER_RE = /<ooc>([\s\S]*?)<\/ooc>/gi;

let ctx = () => SillyTavern.getContext();
let isOn = () => false;
const pending = new Map();   // mesId → [{ id, prompt }]

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
}

/** Is this <ooc> body a Clover image order? */
export function isImageOrder(body) {
    return /^\s*image generation\s*:/i.test(body) || /\bSCENE\s*:/.test(body) || /\battached image\b/i.test(body);
}

/** Clover body → { prompt, aspect_ratio } for Revamped Image Gen. */
export function toRequest(body) {
    let text = String(body).replace(/^\s*image generation\s*:\s*/i, '');
    let aspect_ratio;
    for (const m of text.matchAll(/--ar\s*(\d+)\s*[:x]\s*(\d+)/gi)) aspect_ratio = `${m[1]}:${m[2]}`;
    text = text.replace(/--ar\s*\d+\s*[:x]\s*\d+/gi, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    return aspect_ratio ? { prompt: text, aspect_ratio } : { prompt: text };
}

/** Image orders in a message, each with a stable id. */
export function findOrders(mes) {
    const out = [];
    for (const m of String(mes ?? '').matchAll(ORDER_RE)) {
        if (isImageOrder(m[1])) out.push({ id: hash(m[1]), ...toRequest(m[1]) });
    }
    return out;
}

function iigReady() {
    const api = window.RevampedImageGen;
    const s = ctx().extensionSettings?.revamped_image_gen;
    return !!(api?.generate && s?.enabled !== false);
}

function buildTag(data, src) {
    return `<img data-iig-instruction='${esc(JSON.stringify(data))}' src="${esc(src)}">`;
}

function showStatus(mesId) {
    const list = pending.get(mesId);
    const box = document.querySelector(`#chat .mes[mesid="${mesId}"] .mes_text`);
    if (!box) return;
    box.querySelectorAll('.cb-clover-status').forEach(el => el.remove());
    for (const order of list ?? []) {
        const card = document.createElement('div');
        card.className = 'cb-clover-status';
        card.innerHTML = `<span class="cb-clover-leaf">🍀</span><span>Clover order sent to Revamped Image Gen · developing${order.prompt ? ` — <i>${esc(order.prompt.slice(0, 90))}${order.prompt.length > 90 ? '…' : ''}</i>` : ''}</span>`;
        box.append(card);
    }
}

async function replaceMarker(mesId, marker, replacement) {
    const c = ctx();
    const msg = c.chat?.[mesId];
    if (!msg || !msg.mes.includes(marker)) return false;
    msg.mes = msg.mes.replace(marker, replacement);
    if (Array.isArray(msg.swipes) && Number.isInteger(msg.swipe_id)) msg.swipes[msg.swipe_id] = msg.mes;
    await c.saveChat?.();
    c.updateMessageBlock?.(mesId, msg);
    return true;
}

async function run(mesId, order) {
    try {
        const item = await window.RevampedImageGen.generate(order.prompt, order.aspect_ratio ? { aspect_ratio: order.aspect_ratio } : {});
        const src = item?.src ?? item?.path;
        if (!src) throw new Error('no image came back');
        const data = { prompt: order.prompt, ...(order.aspect_ratio ? { aspect_ratio: order.aspect_ratio } : {}), ...(item?.data ?? {}) };
        await replaceMarker(mesId, MARK_PENDING(order.id), `${MARK_DONE(order.id)}\n${buildTag(data, src)}`);
    } catch (e) {
        await replaceMarker(mesId, MARK_PENDING(order.id), MARK_FAILED(order.id));
        toastr.error(`Revamped Image Gen couldn't draw that Clover order: ${e?.message ?? e}. Its Queue tab has details and a retry.`, 'CALLBOARD · Clover');
    } finally {
        const list = (pending.get(mesId) ?? []).filter(o => o.id !== order.id);
        if (list.length) pending.set(mesId, list); else pending.delete(mesId);
        showStatus(mesId);
    }
}

/** MESSAGE_SENT: runs before SillyTavern builds the AI reply's prompt. */
function onSent(mesId) {
    if (!isOn() || !iigReady()) return;
    const c = ctx();
    const id = Number(mesId);
    const msg = c.chat?.[id];
    if (!msg?.is_user) return;
    const orders = findOrders(msg.mes).filter(o => ![MARK_PENDING, MARK_DONE, MARK_FAILED].some(mark => msg.mes.includes(mark(o.id))));
    if (!orders.length) return;
    msg.mes = `${msg.mes}${orders.map(o => `\n${MARK_PENDING(o.id)}`).join('')}`;
    pending.set(id, orders);
    for (const order of orders) run(id, order);   // not awaited: never hold up the send
}

export function initClover(opts) {
    isOn = opts.isOn;
    const { eventSource, event_types: E } = ctx();
    eventSource.on(E.MESSAGE_SENT, onSent);
    for (const ev of [E.USER_MESSAGE_RENDERED, E.MESSAGE_UPDATED]) {
        if (ev) eventSource.on(ev, (mesId) => { if (pending.has(Number(mesId))) showStatus(Number(mesId)); });
    }
}
