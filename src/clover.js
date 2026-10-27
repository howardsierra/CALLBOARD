// Clover OOC → Revamped Image Gen, directly.
// When the user sends a message holding a Clover <ooc> image order and both
// 🍀 Clover OOC and Revamped Image Gen are on, the order is generated straight
// away (Clover's text, wrapper and command removed). A marker is written into
// the message before the AI reply is built, so the chat model knows not to
// draw it again.
//
// With Revamped Image Gen 1.1+, the order becomes an image tag in the message
// and IIG generates it like any other (placeholder, Cancel, retries, and the
// image still lands after a chat switch). Older versions get the order through
// generate() and the finished image is appended here.
//
// If IIG already turns "Image generation:" orders in the user's messages into
// images itself ("Process image tags in my messages" + its Clover rule), those
// orders are left to it, so nothing is drawn twice.

const MARK_PENDING = (id) => `<!--cb-clover:sent:${id}-->`;
const MARK_FAILED = (id) => `<!--cb-clover:failed:${id}-->`;
const MARK_DONE = (id) => `<!--cb-clover:done:${id}-->`;
const ORDER_RE = /<ooc>([\s\S]*?)<\/ooc>/gi;
const COMMAND_RE = /^\s*image[ \t]+generation[ \t]*:/i;

let ctx = () => SillyTavern.getContext();
let isOn = () => false;
const pending = new Map();   // mesId → [{ id, prompt }] being drawn through generate() (older IIG)
const handoff = new Map();   // mesId → { chatId, orders } written as tags, handed over once rendered

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
}

/** Is this <ooc> body a Clover image order? */
export function isImageOrder(body) {
    return COMMAND_RE.test(body) || /\bSCENE\s*:/.test(body) || /\battached image\b/i.test(body);
}

/** Clover body → { prompt, aspect_ratio } for Revamped Image Gen. */
export function toRequest(body) {
    let text = String(body).replace(/^\s*image generation\s*:\s*/i, '');
    let aspect_ratio;
    for (const m of text.matchAll(/--ar\s*(\d+)\s*[:x]\s*(\d+)/gi)) aspect_ratio = `${m[1]}:${m[2]}`;
    text = text.replace(/--ar\s*\d+\s*[:x]\s*\d+/gi, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    return aspect_ratio ? { prompt: text, aspect_ratio } : { prompt: text };
}

/** Image orders in a message, each with a stable id. `command`: starts with "Image generation:". */
export function findOrders(mes) {
    const out = [];
    for (const m of String(mes ?? '').matchAll(ORDER_RE)) {
        if (isImageOrder(m[1])) out.push({ id: hash(m[1]), command: COMMAND_RE.test(m[1]), restyle: /\battached image\b/i.test(m[1]), ...toRequest(m[1]) });
    }
    return out;
}

const iigSettings = () => ctx().extensionSettings?.revamped_image_gen;

function iigReady() {
    return !!(window.RevampedImageGen?.generate && iigSettings()?.enabled !== false);
}

/** IIG turns "Image generation:" orders in the user's own messages into images by itself. */
export function iigCapturesOrders(s = iigSettings()) {
    return !!(s?.processUserMessages && s.captureRules?.some(r => r.id === 'clover' && r.enabled));
}

/** A restyle with nobody named transforms {{char}}: ask IIG for her reference photo. */
function refNamesFor(order) {
    if (!order.restyle) return undefined;
    const c = ctx();
    const names = [c.name1, c.name2].filter(Boolean);
    const named = names.some(n => new RegExp(`(?<![\\p{L}\\p{N}_])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`, 'iu').test(order.prompt));
    return !named && c.name2 ? [c.name2] : undefined;
}

function requestData(order) {
    const ref_names = refNamesFor(order);
    return { prompt: order.prompt, ...(order.aspect_ratio ? { aspect_ratio: order.aspect_ratio } : {}), ...(ref_names ? { ref_names } : {}) };
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

function setMes(msg, text) {
    msg.mes = text;
    if (Array.isArray(msg.swipes) && Number.isInteger(msg.swipe_id)) msg.swipes[msg.swipe_id] = text;
}

async function replaceMarker(mesId, marker, replacement, { rerender = true } = {}) {
    const c = ctx();
    const msg = c.chat?.[mesId];
    if (!msg || !msg.mes.includes(marker)) return false;
    setMes(msg, msg.mes.replace(marker, replacement));
    await c.saveChat?.();
    if (rerender) c.updateMessageBlock?.(mesId, msg);
    return true;
}

/** Older IIG: generate() and append the finished image ourselves. */
async function run(mesId, order) {
    try {
        const { prompt, ...opts } = requestData(order);
        const item = await window.RevampedImageGen.generate(prompt, opts);
        const src = item?.src ?? item?.path;
        if (!src) throw new Error('no image came back');
        const data = { ...requestData(order), ...(item?.data ?? {}) };
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

/** IIG 1.1+: the tags are in the message; IIG draws them and places them, even after a chat switch. */
async function handOver(mesId) {
    const job = handoff.get(mesId);
    if (!job) return;
    handoff.delete(mesId);
    let results = [];
    try {
        results = await window.RevampedImageGen.processMessage(mesId);
    } catch (e) {
        results = [{ ok: false, error: e?.message ?? String(e) }];
    }
    const c = ctx();
    // In another chat now: IIG still files the image; the "sent" note stays true.
    if (c.getCurrentChatId?.() !== job.chatId) return;
    const msg = c.chat?.[mesId];
    if (!msg) return;
    let failed = 0;
    for (const order of job.orders) {
        const at = msg.mes.indexOf(MARK_PENDING(order.id));
        if (at < 0) continue;
        const src = msg.mes.slice(at).match(/<img\b[^>]*\bsrc="([^"]*)"/i)?.[1] ?? '';
        const ok = src && !/\[IMG:GEN\]/i.test(src) && !/error\.svg/i.test(src);
        if (!ok) failed++;
        // Comment notes don't show, so no re-render (that would strip IIG's image controls).
        await replaceMarker(mesId, MARK_PENDING(order.id), (ok ? MARK_DONE : MARK_FAILED)(order.id), { rerender: false });
    }
    if (failed) {
        const why = results.find(r => !r.ok)?.error;
        toastr.error(`Revamped Image Gen couldn't draw ${failed > 1 ? `${failed} Clover orders` : 'that Clover order'}${why ? `: ${why}` : ''}. Tap the image to retry, or see its Queue tab.`, 'CALLBOARD · Clover');
    }
}

/** MESSAGE_SENT: runs before SillyTavern builds the AI reply's prompt. */
function onSent(mesId) {
    if (!isOn() || !iigReady()) return;
    const c = ctx();
    const id = Number(mesId);
    const msg = c.chat?.[id];
    if (!msg?.is_user) return;
    const leaveToIig = iigCapturesOrders();
    const orders = findOrders(msg.mes)
        .filter(o => !(leaveToIig && o.command))
        .filter(o => ![MARK_PENDING, MARK_DONE, MARK_FAILED].some(mark => msg.mes.includes(mark(o.id))));
    if (!orders.length) return;
    if (typeof window.RevampedImageGen.processMessage === 'function') {
        setMes(msg, `${msg.mes}${orders.map(o => `\n${MARK_PENDING(o.id)}\n${buildTag(requestData(o), '[IMG:GEN]')}`).join('')}`);
        handoff.set(id, { chatId: c.getCurrentChatId?.(), orders });
        return;   // handed over once the message is on screen, so IIG's placeholder has somewhere to go
    }
    setMes(msg, `${msg.mes}${orders.map(o => `\n${MARK_PENDING(o.id)}`).join('')}`);
    pending.set(id, orders);
    for (const order of orders) run(id, order);   // not awaited: never hold up the send
}

function onRendered(mesId) {
    const id = Number(mesId);
    if (handoff.has(id)) handOver(id);   // not awaited: the AI reply starts right away
    else if (pending.has(id)) showStatus(id);
}

export function initClover(opts) {
    isOn = opts.isOn;
    const { eventSource, event_types: E } = ctx();
    eventSource.on(E.MESSAGE_SENT, onSent);
    for (const ev of [E.USER_MESSAGE_RENDERED, E.MESSAGE_UPDATED]) {
        if (ev) eventSource.on(ev, onRendered);
    }
}
