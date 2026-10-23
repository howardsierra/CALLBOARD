// CALLBOARD Studio — fine-tuned Pollinations images.
// The preset's regex only marks where an image goes ([data-cb-img] with the
// prompt as text); this module builds the real URL from the user's Studio
// settings and their locally stored key, so no key ever lives in a preset,
// a card, or the chat text.

const BASE = 'https://gen.pollinations.ai/image/';
const META_KEY = 'callboard_images';

export const MODELS = [
    { id: 'tongyi-mai/z-image-turbo', label: 'Z-Image Turbo (default, fast)', seed: true },
    { id: 'black-forest-labs/flux.1-schnell', label: 'FLUX.1 schnell (fast)', seed: true },
    { id: 'black-forest-labs/flux.2-klein-4b', label: 'FLUX.2 klein 4B', seed: true },
    { id: 'black-forest-labs/flux.1.1-pro', label: 'FLUX 1.1 pro', seed: true },
    { id: 'black-forest-labs/flux.2-pro', label: 'FLUX.2 pro' },
    { id: 'black-forest-labs/flux.1-kontext-pro', label: 'FLUX.1 Kontext pro (reference images)', refs: true },
    { id: 'google/gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (reference images)', refs: true },
    { id: 'openai/gpt-image-1-mini', label: 'GPT-Image 1 mini', quality: true, refs: true },
    { id: 'openai/gpt-image-2', label: 'GPT-Image 2', quality: true, refs: true },
    { id: 'bytedance/seedream-4.0', label: 'Seedream 4.0', seed: true, refs: true },
    { id: 'bytedance/seedream-4.5', label: 'Seedream 4.5', refs: true },
    { id: 'ideogram-ai/ideogram-v4-turbo', label: 'Ideogram v4 turbo (good with text)' },
    { id: 'qwen/qwen-image', label: 'Qwen-Image' },
];

export const STYLES = [
    { id: 'none', label: 'None', text: '' },
    { id: 'cinema', label: '🎬 Cinematic', text: 'cinematic film still, 35mm, shallow depth of field, natural film grain, motivated lighting' },
    { id: 'photo', label: '📷 Candid photo', text: 'candid smartphone photo, natural light, realistic skin texture, unposed' },
    { id: 'anime', label: '🌸 Anime', text: 'anime key visual, clean line art, soft cel shading, expressive eyes' },
    { id: 'manhwa', label: '📖 Manhwa', text: 'webtoon manhwa illustration, glossy digital painting, soft glow, dramatic panel framing' },
    { id: 'oil', label: '🖼️ Oil painting', text: 'oil painting, visible brushwork, rich chiaroscuro, museum lighting' },
    { id: 'watercolor', label: '💧 Watercolor', text: 'delicate watercolor illustration, soft bleeding edges, paper texture' },
    { id: 'kdrama', label: '🫰 K-drama poster', text: 'glossy K-drama promotional still, soft beauty lighting, pastel color grade' },
    { id: 'y2k', label: '📟 Y2K digicam', text: '2005 digital camera photo, direct flash, slight overexposure, date stamp' },
    { id: 'darkfantasy', label: '🐉 Dark fantasy', text: 'dark fantasy concept art, moody volumetric light, painterly detail' },
];

export const SIZES = { S: 0.6, M: 1.0, L: 1.45 };   // megapixels

export const STUDIO_DEFAULTS = Object.freeze({
    key: '',
    model: 'tongyi-mai/z-image-turbo',
    customModel: '',
    size: 'M',
    seedMode: 'stable',      // stable | fixed | random
    fixedSeed: 42,
    quality: '',
    safe: false,
    style: 'none',
    always: '',
    avoid: 'text, watermark, extra fingers, distorted face',
    useRefs: true,
    lookbook: [],            // [{ name, look, ref }]
});

let ctx = () => SillyTavern.getContext();
let getSettings = () => ({});
let save = () => {};
let onOpenStudio = () => {};
let getFallbackKey = () => '';   // a key the user put in the preset's image regex, if any
let chats = null;            // ../../../chats.js, for isExternalMediaAllowed
let observer = null;

export function studio() {
    const s = getSettings();
    s.studio ??= structuredClone(STUDIO_DEFAULTS);
    for (const [k, v] of Object.entries(STUDIO_DEFAULTS)) {
        if (s.studio[k] === undefined) s.studio[k] = structuredClone(v);
    }
    return s.studio;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0) % 2147483646 + 1;
}

const modelId = () => (studio().model === 'custom' ? studio().customModel.trim() : studio().model) || STUDIO_DEFAULTS.model;
const modelInfo = (id = modelId()) => MODELS.find(m => m.id === id) ?? {};

/** Pixel size for an aspect ratio at the chosen size tier, in multiples of 32. */
export function dims(ar) {
    const [w, h] = String(ar || '1:1').split(':').map(Number);
    const ratio = w > 0 && h > 0 ? w / h : 1;
    const area = (SIZES[studio().size] ?? 1) * 1_000_000;
    const r32 = (n) => Math.max(256, Math.round(n / 32) * 32);
    const W = r32(Math.sqrt(area * ratio));
    return { width: W, height: r32(W / ratio) };
}

/** The prompt actually sent: lookbook looks woven in, then style, extras and avoid list. */
export function finalPrompt(raw) {
    const s = studio();
    let prompt = String(raw ?? '').trim();
    const refs = [];
    for (const entry of s.lookbook) {
        const name = entry.name?.trim();
        if (!name || !entry.look?.trim()) continue;
        const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (!re.test(prompt)) continue;
        prompt = prompt.replace(re, (m) => `${m} (${entry.look.trim()})`);
        if (entry.ref?.trim()) refs.push(entry.ref.trim());
    }
    const style = STYLES.find(x => x.id === s.style)?.text;
    const parts = [prompt, style, s.always.trim()].filter(Boolean);
    if (s.avoid.trim()) parts.push(`without ${s.avoid.trim()}`);
    return { text: parts.join(', '), refs };
}

function imageState(promptKey) {
    const meta = ctx().chatMetadata;
    if (!meta) return {};
    meta[META_KEY] ??= {};
    return meta[META_KEY][promptKey] ?? {};
}

function setImageState(promptKey, patch) {
    const c = ctx();
    if (!c.chatMetadata) return;
    c.chatMetadata[META_KEY] ??= {};
    const next = { ...(c.chatMetadata[META_KEY][promptKey] ?? {}), ...patch };
    for (const k of Object.keys(next)) if (next[k] === undefined || next[k] === '') delete next[k];
    if (Object.keys(next).length) c.chatMetadata[META_KEY][promptKey] = next;
    else delete c.chatMetadata[META_KEY][promptKey];
    if (c.saveMetadataDebounced) c.saveMetadataDebounced(); else c.saveMetadata?.();
}

/** Build the URL. `state` may carry a per-image prompt override and reroll count. */
export function buildUrl(rawPrompt, ar, state = {}, { withKey = true } = {}) {
    const s = studio();
    const { text, refs } = finalPrompt(state.prompt ?? rawPrompt);
    const { width, height } = dims(ar);
    const id = modelId();
    const p = new URLSearchParams({ model: id, width, height });
    if (s.seedMode === 'fixed') p.set('seed', String(Number(s.fixedSeed) || 0));
    else if (s.seedMode === 'random') p.set('seed', '-1');
    else p.set('seed', String(hash(`${rawPrompt}#${state.roll ?? 0}`)));
    if (s.quality && modelInfo(id).quality !== false) p.set('quality', s.quality);
    if (s.safe) p.set('safe', 'true');
    if (s.useRefs && refs.length) p.set('image', refs.join('|'));
    const key = s.key.trim() || state.key || getFallbackKey();
    if (withKey && key) p.set('key', key);
    return { url: BASE + encodeURIComponent(text) + '?' + p.toString(), text, width, height };
}

function mediaAllowed() {
    try { return chats?.isExternalMediaAllowed ? chats.isExternalMediaAllowed() : true; } catch { return true; }
}

// ───────────────────────────── chat images ─────────────────────────────

/** Find image placeholders (and legacy direct Pollinations <img>s) and render them. */
export function hydrate(root = document.getElementById('chat')) {
    if (!root) return;
    for (const el of root.querySelectorAll('.mes_text [data-cb-img]:not([data-cb-done])')) {
        const prompt = el.querySelector('[data-cb-prompt]')?.textContent.replace(/^🖼️\s*/, '').trim() ?? '';
        const ar = /^\d+:\d+$/.test(el.dataset.cbAr || '') ? el.dataset.cbAr : '1:1';
        mount(el, prompt, ar);
    }
    for (const img of root.querySelectorAll('.mes_text img[src^="https://gen.pollinations.ai/image/"]:not([data-cb-shot])')) {
        if (img.closest('[data-cb-img]')) continue;
        let prompt = '';
        let key = '';
        try {
            const u = new URL(img.src);
            prompt = decodeURIComponent(u.pathname.replace(/^\/image\//, ''));
            key = u.searchParams.get('key') ?? '';
        } catch { continue; }
        const m = (img.getAttribute('style') || '').match(/aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/);
        const holder = document.createElement('div');
        holder.style.cssText = 'clear:both;margin:12px auto;max-width:75%;';
        if (key) holder.dataset.cbKey = key;   // the regex's own key: used when the Studio has none
        (img.parentElement?.childElementCount === 1 ? img.parentElement : img).replaceWith(holder);
        mount(holder, prompt, m ? `${m[1]}:${m[2]}` : '1:1');
    }
}

function mount(el, prompt, ar) {
    el.dataset.cbDone = '1';
    el.dataset.cbPromptRaw = prompt;
    el.dataset.cbAr = ar;
    const [w, h] = ar.split(':');
    if (!mediaAllowed()) {
        el.innerHTML = `<div class="cb-shot cb-shot-blocked" style="aspect-ratio:${w} / ${h}"><span>🖼️ ${esc(prompt)}</span>
            <small>SillyTavern is blocking external media for this chat. Allow it (User Settings → Forbid External Media, or the chat's media toggle) to see images.</small></div>`;
        return;
    }
    const state = { ...imageState(hash(prompt)), key: el.dataset.cbKey };
    const { url } = buildUrl(prompt, ar, state);
    el.innerHTML = `<figure class="cb-shot" style="aspect-ratio:${w} / ${h}">
        <img data-cb-shot src="${esc(url)}" alt="${esc(state.prompt ?? prompt)}" loading="lazy">
        <div class="cb-shot-wait">developing…</div>
        <figcaption class="cb-shot-bar">
            <button data-cb-shot-act="roll" title="Reroll (new seed)">🎲</button>
            <button data-cb-shot-act="edit" title="Fine-tune in the Studio">✏️</button>
            <button data-cb-shot-act="zoom" title="View large">⤢</button>
            <button data-cb-shot-act="copy" title="Copy prompt">📋</button>
            ${state.prompt ? '<span class="cb-shot-tag" title="This image uses a Studio-edited prompt">edited</span>' : ''}
        </figcaption>
    </figure>`;
    const img = el.querySelector('img');
    const wait = el.querySelector('.cb-shot-wait');
    img.addEventListener('load', () => wait.remove(), { once: true });
    img.addEventListener('error', () => {
        wait.textContent = (studio().key.trim() || el.dataset.cbKey || getFallbackKey())
            ? 'Pollinations refused this one (budget, model, or size). Try another model in the Studio.'
            : 'No Pollinations key yet — add one in CALLBOARD → Studio.';
        wait.classList.add('is-error');
    }, { once: true });
}

/** Re-render every image (after a Studio change). */
export function rehydrate() {
    const chat = document.getElementById('chat');
    if (!chat) return;
    for (const el of chat.querySelectorAll('[data-cb-done]')) {
        mount(el, el.dataset.cbPromptRaw, el.dataset.cbAr);
    }
}

async function onShotClick(ev) {
    const btn = ev.target.closest('[data-cb-shot-act]');
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    const holder = btn.closest('[data-cb-done]');
    const prompt = holder.dataset.cbPromptRaw;
    const ar = holder.dataset.cbAr;
    const key = hash(prompt);
    const state = imageState(key);
    switch (btn.dataset.cbShotAct) {
        case 'roll':
            if (studio().seedMode === 'stable') setImageState(key, { roll: (state.roll ?? 0) + 1 });
            mount(holder, prompt, ar);
            if (studio().seedMode !== 'stable') {
                const img = holder.querySelector('img');
                img.src = img.src + (img.src.includes('&_r=') ? '' : `&_r=${Date.now()}`);
            }
            break;
        case 'edit':
            onOpenStudio({ prompt: state.prompt ?? prompt, original: prompt, ar });
            break;
        case 'zoom': {
            const src = holder.querySelector('img')?.src;
            if (src) await ctx().callGenericPopup(`<img src="${esc(src)}" style="max-width:100%;max-height:78vh;border-radius:12px;">`, ctx().POPUP_TYPE?.TEXT ?? 1, '', { wide: true, large: true });
            break;
        }
        case 'copy':
            await navigator.clipboard?.writeText(finalPrompt(state.prompt ?? prompt).text);
            toastr.success('Prompt copied.', 'CALLBOARD Studio');
            break;
    }
}

// ───────────────────────────── Studio tab ─────────────────────────────

let draft = { prompt: '', ar: '2:3', original: null };
let shot = null;

export function openFor(target) {
    draft = { prompt: target.prompt, ar: target.ar, original: target.original };
    shot = null;
}

export function renderStudio() {
    const s = studio();
    const m = modelInfo();
    const chips = (name, list, current) => list.map(([v, l]) => `<button class="cb-chip ${String(current) === String(v) ? 'is-lit' : ''}" data-st-set="${name}" data-st-val="${esc(v)}">${esc(l)}</button>`).join('');
    const preview = draft.prompt.trim() ? buildUrl(draft.original ?? draft.prompt, draft.ar, { prompt: draft.prompt }) : null;
    return `
    <div class="cb-section" style="--cb-accent:#ffb36b"><div class="cb-st-block">
        <div class="cb-sub">🔑 Pollinations key</div>
        <div class="cb-save-row"><input class="cb-input" type="password" autocomplete="off" data-st-input="key" placeholder="sk_… (stays on this device)" value="${esc(s.key)}">
            <a class="cb-btn" href="https://enter.pollinations.ai/keys" target="_blank" rel="noopener">Get a key</a></div>
        <div class="cb-hint">Saved only in your SillyTavern settings here. Never paste it into a preset, card, regex, or chat. Give it a budget cap on Pollinations.</div>
    </div></div>

    <div class="cb-section" style="--cb-accent:#8fb4ff"><div class="cb-st-block">
        <div class="cb-sub">🎛️ Camera</div>
        <div class="cb-band-label">Model</div>
        <select class="cb-input" data-st-input="model">
            ${MODELS.map(x => `<option value="${esc(x.id)}" ${s.model === x.id ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}
            <option value="custom" ${s.model === 'custom' ? 'selected' : ''}>Other model id…</option>
        </select>
        ${s.model === 'custom' ? `<input class="cb-input" style="margin-top:6px" data-st-input="customModel" placeholder="e.g. qwen/qwen-image-3" value="${esc(s.customModel)}">` : ''}
        <div class="cb-hint" style="padding:4px 0 0">${m.seed ? '🎲 honors seeds' : 'ignores seeds (every render may differ)'}${m.refs ? ' · 📇 can use lookbook reference images' : ''}${m.quality ? ' · has quality levels' : ''}. Prices differ by model.</div>
        <div class="cb-band-label" style="margin-top:10px">Size</div>
        <div class="cb-chips">${chips('size', [['S', 'S · fast'], ['M', 'M'], ['L', 'L · detailed']], s.size)}</div>
        <div class="cb-band-label" style="margin-top:10px">Seed</div>
        <div class="cb-chips">${chips('seedMode', [['stable', 'Stable per image'], ['fixed', 'Same seed always'], ['random', 'Random']], s.seedMode)}</div>
        ${s.seedMode === 'fixed' ? `<input class="cb-input" style="margin-top:6px;max-width:160px" type="number" min="0" data-st-input="fixedSeed" value="${esc(s.fixedSeed)}">` : ''}
        <div class="cb-hint" style="padding:4px 0 0">${s.seedMode === 'random' ? 'Random redraws every time the chat re-renders, and every redraw costs Pollen.' : s.seedMode === 'fixed' ? 'One seed for every image: the most consistent look across a chat.' : 'Each image keeps its own seed, so re-renders reuse it; 🎲 on an image rolls a new one.'}</div>
        ${m.quality ? `<div class="cb-band-label" style="margin-top:10px">Quality</div><div class="cb-chips">${chips('quality', [['', 'Default'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['hd', 'HD']], s.quality)}</div>` : ''}
        <label class="cb-row" style="margin:8px 0 0;padding:6px 0"><input class="cb-switch" type="checkbox" data-st-input="safe" ${s.safe ? 'checked' : ''}><span class="cb-name">Pollinations safety filter</span></label>
    </div></div>

    <div class="cb-section" style="--cb-accent:#ff9fd0"><div class="cb-st-block">
        <div class="cb-sub">🎨 Look</div>
        <div class="cb-chips">${chips('style', STYLES.map(x => [x.id, x.label]), s.style)}</div>
        <div class="cb-band-label" style="margin-top:10px">Always add</div>
        <textarea class="cb-input" rows="2" data-st-input="always" placeholder="e.g. warm autumn palette, soft rim light">${esc(s.always)}</textarea>
        <div class="cb-band-label" style="margin-top:8px">Avoid</div>
        <textarea class="cb-input" rows="2" data-st-input="avoid" placeholder="e.g. text, watermark">${esc(s.avoid)}</textarea>
        <div class="cb-hint" style="padding:4px 0 0">Pollinations has no negative-prompt setting, so "avoid" is added as "without …". Most models listen; some don't.</div>
    </div></div>

    <div class="cb-section" style="--cb-accent:#9ce07a"><div class="cb-st-block">
        <div class="cb-sub">📇 Lookbook</div>
        <div class="cb-hint" style="padding:0 0 6px">When a prompt names someone below, their look is woven in, so faces stay consistent.</div>
        ${s.lookbook.map((e, i) => `<div class="cb-look">
            <div class="cb-save-row"><input class="cb-input" data-st-look="${i}" data-st-field="name" placeholder="Name as it appears in prompts" value="${esc(e.name)}">
                <button class="cb-icon cb-danger fa-solid fa-trash" data-st-look-del="${i}" title="Remove"></button></div>
            <textarea class="cb-input" rows="2" data-st-look="${i}" data-st-field="look" placeholder="Their look: hair, eyes, build, signature outfit">${esc(e.look)}</textarea>
            <input class="cb-input" data-st-look="${i}" data-st-field="ref" placeholder="Reference image URL (optional, for models that take one)" value="${esc(e.ref)}">
        </div>`).join('')}
        <div class="cb-save-row"><button class="cb-btn" data-st-look-add>+ Add someone</button>
            <label class="cb-row" style="margin:0;padding:0 4px;flex:1"><input class="cb-switch" type="checkbox" data-st-input="useRefs" ${s.useRefs ? 'checked' : ''}><span class="cb-name">Send reference images</span></label></div>
    </div></div>

    <div class="cb-section" style="--cb-accent:#c9a6ff"><div class="cb-st-block">
        <div class="cb-sub">🧪 ${draft.original ? 'Fine-tune this image' : 'Test shot'}</div>
        <textarea class="cb-input" rows="3" data-st-draft="prompt" placeholder="Describe the shot…">${esc(draft.prompt)}</textarea>
        <div class="cb-chips" style="margin-top:6px">${chips('ar', [['2:3', 'Portrait 2:3'], ['1:1', 'Square 1:1'], ['16:9', 'Wide 16:9']], draft.ar)}</div>
        <div class="cb-save-row" style="margin-top:8px">
            <button class="cb-btn cb-btn-go" data-st-shoot>📸 Shoot</button>
            ${draft.original ? '<button class="cb-btn cb-btn-go" data-st-apply>Apply to that image</button><button class="cb-btn" data-st-reset>Reset that image</button>' : ''}
        </div>
        ${preview ? `<details class="cb-st-final"><summary>Final prompt · ${preview.width}×${preview.height}</summary><div>${esc(preview.text)}</div></details>` : ''}
        ${shot ? `<figure class="cb-shot" style="aspect-ratio:${draft.ar.replace(':', ' / ')};margin-top:8px"><img src="${esc(shot)}" alt="Test shot"><div class="cb-shot-wait">developing…</div></figure>` : ''}
    </div></div>`;
}

/** Handles Studio interactions; returns true if it consumed the event. */
export function onStudioClick(ev, rerender) {
    const t = ev.target.closest('button');
    if (!t) return false;
    const d = t.dataset;
    const s = studio();
    if (d.stSet) {
        if (d.stSet === 'ar') draft.ar = d.stVal;
        else s[d.stSet] = d.stVal;
        save();
        if (d.stSet !== 'ar') rehydrate();
        rerender();
        return true;
    }
    if ('stLookAdd' in d) { s.lookbook.push({ name: '', look: '', ref: '' }); save(); rerender(); return true; }
    if (d.stLookDel) { s.lookbook.splice(Number(d.stLookDel), 1); save(); rehydrate(); rerender(); return true; }
    if ('stShoot' in d) {
        if (!draft.prompt.trim()) { toastr.warning('Write a prompt first.', 'CALLBOARD Studio'); return true; }
        shot = buildUrl(draft.original ?? draft.prompt, draft.ar, { prompt: draft.prompt, roll: Date.now() }).url;
        rerender();
        const fig = document.querySelector('#cb_board .cb-st-block figure.cb-shot');
        const img = fig?.querySelector('img');
        img?.addEventListener('load', () => fig.querySelector('.cb-shot-wait')?.remove(), { once: true });
        img?.addEventListener('error', () => { const w = fig.querySelector('.cb-shot-wait'); if (w) { w.textContent = s.key.trim() ? 'Pollinations refused this one. Try another model or size.' : 'Add your Pollinations key above first.'; w.classList.add('is-error'); } }, { once: true });
        return true;
    }
    if ('stApply' in d && draft.original) {
        setImageState(hash(draft.original), { prompt: draft.prompt.trim() === draft.original ? undefined : draft.prompt.trim() });
        rehydrate();
        toastr.success('Applied to that image.', 'CALLBOARD Studio');
        return true;
    }
    if ('stReset' in d && draft.original) {
        setImageState(hash(draft.original), { prompt: undefined, roll: undefined });
        draft.prompt = draft.original;
        rehydrate();
        rerender();
        return true;
    }
    return false;
}

/** Text inputs save without re-rendering (keeps focus); selects/switches re-render. */
export function onStudioInput(ev, rerender) {
    const t = ev.target;
    const s = studio();
    if (t.dataset.stInput) {
        const k = t.dataset.stInput;
        s[k] = t.type === 'checkbox' ? t.checked : (k === 'fixedSeed' ? Number(t.value) || 0 : t.value);
        save();
        if (ev.type === 'change') { rehydrate(); if (t.tagName === 'SELECT' || t.type === 'checkbox') rerender(); }
        return true;
    }
    if (t.dataset.stLook !== undefined) {
        s.lookbook[Number(t.dataset.stLook)][t.dataset.stField] = t.value;
        save();
        if (ev.type === 'change') rehydrate();
        return true;
    }
    if (t.dataset.stDraft) {
        draft.prompt = t.value;
        return true;
    }
    return false;
}

export async function initStudio(opts) {
    ({ getSettings, save, onOpenStudio } = opts);
    if (opts.getFallbackKey) getFallbackKey = opts.getFallbackKey;
    try { chats = await import('../../../../chats.js'); } catch { chats = null; }
    studio();
    const chat = document.getElementById('chat');
    if (chat) {
        chat.addEventListener('click', onShotClick, true);
        observer = new MutationObserver(() => hydrate(chat));
        observer.observe(chat, { childList: true, subtree: true });
        hydrate(chat);
    }
    const { eventSource, event_types: E } = ctx();
    eventSource.on(E.CHAT_CHANGED, () => setTimeout(() => hydrate(), 50));
}
