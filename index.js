// CALLBOARD Suite — a stage-manager's board for the CALLBOARD preset.
// Drives the Chat Completion prompt manager directly: the same switches you'd
// flip by hand, grouped into bands, with pick-one enforcement, a linter,
// loadouts, per-chat pins and slash commands.

import {
    SECTIONS, STRUCTURAL, GROUPS, REQUIRES, ADVISORIES, WING_TRACKER, STARTERS, shortName,
} from './src/map.js';

const MODULE = 'callboard';
const PIN_KEY = 'callboard_pin';
const DEFAULTS = Object.freeze({
    autoTracker: true,
    autoApplyPinned: true,
    loadouts: {},
    collapsed: {},
});

const ctx = () => SillyTavern.getContext();
let oai = null;    // ../../../openai.js namespace (live binding to promptManager)
let regex = null;  // ../../regex/engine.js namespace, if present
let panel = null;
let tab = 'board';
let filter = '';
let refreshQueued = false;

// ───────────────────────────── settings ─────────────────────────────

function settings() {
    const all = ctx().extensionSettings;
    all[MODULE] ??= structuredClone(DEFAULTS);
    for (const [k, v] of Object.entries(DEFAULTS)) {
        if (all[MODULE][k] === undefined) all[MODULE][k] = structuredClone(v);
    }
    return all[MODULE];
}

const save = () => ctx().saveSettingsDebounced();

// ───────────────────────── prompt manager glue ─────────────────────────

const pm = () => oai?.promptManager ?? null;

function isLive() {
    const p = pm();
    return !!(p?.activeCharacter && p.getPromptById?.('cb_houserules'));
}

function entry(id) {
    const p = pm();
    if (!p?.activeCharacter) return null;
    return p.getPromptOrderEntry(p.activeCharacter, id) ?? null;
}

const prompt = (id) => pm()?.getPromptById(id) ?? null;
const has = (id) => !!(prompt(id) && entry(id));
const lit = (id) => !!entry(id)?.enabled;
const nameOf = (id, inBand = false) => shortName(prompt(id)?.name ?? id, inBand);
const tokensOf = (id) => Math.round((prompt(id)?.content ?? '').length / 3.6);

function setLit(id, on) {
    const e = entry(id);
    if (!e || !!e.enabled === on) return false;
    e.enabled = on;
    try {
        const counts = pm().tokenHandler?.getCounts();
        if (counts) counts[id] = null;
    } catch { /* counts are cosmetic */ }
    return true;
}

function commit() {
    const p = pm();
    if (!p) return;
    p.saveServiceSettings();
    p.render();
    queueRefresh();
}

/** Light one choice in a band (or none). Returns true if anything changed. */
function pick(groupKey, id) {
    const g = GROUPS[groupKey];
    if (!g) return false;
    let changed = false;
    for (const choice of g.pick) changed = setLit(choice, choice === id) || changed;
    if (groupKey === 'wing' && id && settings().autoTracker) {
        const want = WING_TRACKER[id];
        const trackerLit = GROUPS.tracker.pick.some(lit);
        if (want && trackerLit && has(want)) changed = pick('tracker', want) || changed;
    }
    return changed;
}

function applyPatch(patch) {
    let changed = false;
    for (const [g, id] of Object.entries(patch.picks ?? {})) changed = pick(g, id) || changed;
    for (const id of patch.on ?? []) changed = setLit(id, true) || changed;
    for (const id of patch.off ?? []) changed = setLit(id, false) || changed;
    if (changed) commit();
    return changed;
}

/** Every switchable CALLBOARD prompt in the active preset, in order. */
function allModules() {
    const p = pm();
    if (!p?.activeCharacter) return [];
    return p.getPromptOrderForCharacter(p.activeCharacter)
        .map(e => e.identifier)
        .filter(id => id.startsWith('cb_') && !STRUCTURAL.has(id) && prompt(id));
}

function snapshot() {
    const on = [], off = [];
    for (const id of allModules()) (lit(id) ? on : off).push(id);
    return { on, off };
}

function mappedIds() {
    const ids = new Set();
    for (const s of SECTIONS) for (const i of s.items) (i.group ? i.pick : [i.toggle]).forEach(x => ids.add(x));
    return ids;
}

// ─────────────────────────────── linter ───────────────────────────────

function regexHealth() {
    if (!regex?.getScriptsByType || !regex.SCRIPT_TYPES) return null;
    const isCb = s => String(s?.scriptName ?? '').startsWith('CB ·') && !s.disabled;
    const T = regex.SCRIPT_TYPES;
    const count = (type) => {
        try { return (regex.getScriptsByType(type) ?? []).filter(isCb).length; } catch { return 0; }
    };
    const global = count(T.GLOBAL);
    const scoped = T.SCOPED !== undefined ? count(T.SCOPED) : 0;
    const preset = T.PRESET !== undefined ? count(T.PRESET) : 0;
    let presetAllowed = true;
    if (preset && regex.isPresetScriptsAllowed) {
        presetAllowed = regex.isPresetScriptsAllowed(regex.getCurrentPresetAPI(), regex.getCurrentPresetName());
    }
    return { global, scoped, preset, presetAllowed };
}

function lint() {
    const notes = [];
    const add = (level, text, fixes = []) => notes.push({ level, text, fixes });
    const turn = (id, on) => ({ label: `${on ? 'Light' : 'Kill'} ${nameOf(id)}`, run: () => applyPatch(on ? { on: [id] } : { off: [id] }) });

    for (const [key, g] of Object.entries(GROUPS)) {
        const choices = g.pick.filter(has);
        const on = choices.filter(lit);
        if (on.length > 1) {
            add('error', `${g.label}: ${on.length} lit at once (${on.map(id => nameOf(id, true)).join(', ')}). They'll fight.`,
                on.map(id => ({ label: `Keep ${nameOf(id, true)}`, run: () => pick(key, id) && commit() })));
        } else if (g.required && choices.length && !on.length) {
            add('warn', `${g.label}: nothing lit. Pick one.`,
                key === 'wing' ? [] : choices.map(id => ({ label: nameOf(id, true), run: () => pick(key, id) && commit() })));
        }
    }

    for (const r of REQUIRES) {
        if (!has(r.id) || !lit(r.id)) continue;
        const any = r.any.filter(has);
        if (!any.length || any.some(lit)) continue;
        const fixes = r.fix === 'off' ? [] : [turn(any[0], true)];
        fixes.push(turn(r.id, false));
        add('warn', `${nameOf(r.id)} — ${r.why}`, fixes);
    }

    const wing = GROUPS.wing.pick.find(id => has(id) && lit(id));
    const tracker = GROUPS.tracker.pick.find(id => has(id) && lit(id));
    if (wing && tracker && WING_TRACKER[wing] && WING_TRACKER[wing] !== tracker && has(WING_TRACKER[wing])) {
        const want = WING_TRACKER[wing];
        add('warn', `${nameOf(wing, true)} is lit but the tracker is ${nameOf(tracker, true)}.`,
            [{ label: `Switch to ${nameOf(want, true)}`, run: () => pick('tracker', want) && commit() }]);
    }

    const stateWriters = [...GROUPS.tracker.pick, 'cb_board_cast', 'cb_board_relationship', 'cb_board_status', 'cb_board_inventory', 'cb_board_codex'];
    if (has('cb_houserules') && !lit('cb_houserules') && stateWriters.some(id => has(id) && lit(id))) {
        add('error', 'Trackers or boards are lit but House Rules is off — the <cb_state> contract lives there.', [turn('cb_houserules', true)]);
    }

    for (const a of ADVISORIES) {
        if (!a.when.every(id => has(id) && lit(id))) continue;
        if (a.unless?.some(id => has(id) && lit(id))) continue;
        add('info', a.text);
    }

    const needsRegex = allModules().some(id => lit(id) && /tracker|board|_rx$|press|y2k_comms|curtain_(line|notes|talkback)|cot|ext_/.test(id));
    const rx = regexHealth();
    if (needsRegex && rx) {
        if (rx.preset && !rx.presetAllowed) {
            add('error', `The preset carries ${rx.preset} CB regex scripts, but preset regex isn't allowed — cards, panels and the CoT foldout won't render.`,
                [{
                    label: 'Allow preset regex', run: () => {
                        regex.allowPresetScripts(regex.getCurrentPresetAPI(), regex.getCurrentPresetName());
                        save();
                        ctx().reloadCurrentChat?.();
                        queueRefresh();
                    },
                }]);
        } else if (!rx.preset && !rx.global && !rx.scoped) {
            add('error', 'No CB regex scripts found. Import CALLBOARD_regex_bundle.json (Extensions → Regex) or nothing will render.');
        }
    }
    const rank = { error: 0, warn: 1, info: 2 };
    return notes.sort((a, b) => rank[a.level] - rank[b.level]);
}

// ──────────────────────────────── loadouts ────────────────────────────────

function findLoadout(query) {
    const q = String(query ?? '').trim().toLowerCase();
    if (!q) return null;
    const saved = Object.entries(settings().loadouts).map(([name, l]) => ({ name, ...l }));
    const pool = [...saved, ...STARTERS];
    return pool.find(l => l.name.toLowerCase() === q)
        ?? pool.find(l => l.name.toLowerCase().includes(q))
        ?? null;
}

function saveLoadout(name) {
    name = String(name ?? '').trim();
    if (!name) return toastr.warning('Give the loadout a name.');
    settings().loadouts[name] = { ...snapshot(), savedAt: Date.now() };
    save();
    toastr.success(`Saved “${name}”.`, 'CALLBOARD');
    queueRefresh();
}

function applyLoadout(l) {
    if (!isLive()) return toastr.warning('Load the CALLBOARD preset first.', 'CALLBOARD');
    applyPatch(l);
    toastr.info(`Stage dressed: ${l.name}`, 'CALLBOARD');
}

function saveMetadata() {
    const c = ctx();
    if (c.saveMetadataDebounced) c.saveMetadataDebounced();
    else c.saveMetadata?.();
}

function pinToChat(name) {
    const c = ctx();
    if (!c.getCurrentChatId?.()) return toastr.warning('Open a chat first.');
    c.chatMetadata[PIN_KEY] = { name, ...snapshot() };
    saveMetadata();
    toastr.success(`Pinned “${name}” to this chat.`, 'CALLBOARD');
    queueRefresh();
}

function unpin() {
    const c = ctx();
    delete c.chatMetadata[PIN_KEY];
    saveMetadata();
    queueRefresh();
}

function download(filename, data) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importLoadouts(file) {
    try {
        const data = JSON.parse(await file.text());
        const list = Array.isArray(data) ? data : data.loadouts ? Object.entries(data.loadouts).map(([name, l]) => ({ name, ...l })) : [data];
        let n = 0;
        for (const l of list) {
            if (!l?.name || !Array.isArray(l.on)) continue;
            settings().loadouts[l.name] = { on: l.on, off: l.off ?? [], picks: l.picks, savedAt: Date.now() };
            n++;
        }
        save();
        toastr.success(`Imported ${n} loadout${n === 1 ? '' : 's'}.`, 'CALLBOARD');
        queueRefresh();
    } catch (err) {
        toastr.error(`Couldn't read that file: ${err.message}`, 'CALLBOARD');
    }
}

// ─────────────────────────────────── UI ───────────────────────────────────

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function matches(id) {
    if (!filter) return true;
    const p = prompt(id);
    return `${id} ${p?.name ?? ''}`.toLowerCase().includes(filter);
}

const SECTION_HUES = {
    stage: '#c9a6ff', core: '#e0b46c', prose: '#7fc8b8', wings: '#e58f74', systems: '#8fb4ff',
    spotlight: '#ff9fd0', content: '#ff6f7d', state: '#9ce07a', panels: '#b48cff', visuals: '#6fd0ff',
    utils: '#d8c9a3', unsorted: '#9a92a8',
};
const hue = (key) => SECTION_HUES[key] ?? SECTION_HUES.unsorted;

function renderToggle(id) {
    if (!has(id) || !matches(id)) return '';
    const on = lit(id);
    return `<label class="cb-row ${on ? 'is-lit' : ''}">
        <input class="cb-switch" type="checkbox" role="switch" data-cb-toggle="${esc(id)}" ${on ? 'checked' : ''}>
        <span class="cb-name">${esc(nameOf(id))}</span>
        <span class="cb-tok" title="Approximate tokens">${tokensOf(id)}</span>
        <button class="cb-peek fa-solid fa-eye" data-cb-peek="${esc(id)}" title="Read this module" aria-label="Read this module"></button>
    </label>`;
}

function renderBand(item) {
    const choices = item.pick.filter(has);
    if (!choices.length) return '';
    if (filter && !choices.some(matches) && !item.label.toLowerCase().includes(filter)) return '';
    const anyLit = choices.some(lit);
    const chips = choices.map(id => `<button class="cb-chip ${lit(id) ? 'is-lit' : ''}" data-cb-pick="${esc(item.group)}" data-cb-id="${esc(id)}" title="${esc(prompt(id)?.name)} · ~${tokensOf(id)} tokens">${esc(item.labels?.[id] ?? nameOf(id, true))}</button>`);
    if (item.none) chips.push(`<button class="cb-chip cb-chip-none ${anyLit ? '' : 'is-lit'}" data-cb-pick="${esc(item.group)}" data-cb-id="">${esc(item.none)}</button>`);
    return `<div class="cb-band">
        <div class="cb-band-label">${esc(item.label)}${item.hint ? `<span class="cb-band-hint">${esc(item.hint)}</span>` : ''}</div>
        <div class="cb-chips">${chips.join('')}</div>
    </div>`;
}

function renderSection(s, items) {
    const body = items.map(i => i.group ? renderBand(i) : renderToggle(i.toggle)).join('');
    if (!body.trim()) return '';
    const ids = items.flatMap(i => i.group ? i.pick : [i.toggle]).filter(has);
    const on = ids.filter(lit).length;
    const open = filter || !settings().collapsed[s.key];
    const pct = ids.length ? Math.round(on / ids.length * 100) : 0;
    return `<details class="cb-section" data-cb-section="${esc(s.key)}" style="--cb-accent:${hue(s.key)}" ${open ? 'open' : ''}>
        <summary>
            <span class="cb-sec-icon">${s.icon}</span>
            <span class="cb-sec-title">${esc(s.title)}</span>
            <span class="cb-sec-meter"><span style="width:${pct}%"></span></span>
            <span class="cb-count">${on}<i>/${ids.length}</i></span>
            <span class="cb-chev fa-solid fa-chevron-down"></span>
        </summary>
        ${s.hint ? `<div class="cb-hint">${esc(s.hint)}</div>` : ''}
        <div class="cb-sec-body">${body}</div>
    </details>`;
}

function renderBoard() {
    const mapped = mappedIds();
    const unsorted = allModules().filter(id => !mapped.has(id)).map(id => ({ toggle: id }));
    const sections = SECTIONS.map(s => renderSection(s, s.items));
    if (unsorted.length) sections.push(renderSection({ key: 'unsorted', title: 'Unsorted', icon: '📦', hint: 'In the preset but not on the board map yet.' }, unsorted));
    return `<div class="cb-search-wrap"><span class="fa-solid fa-magnifying-glass"></span>
            <input class="cb-search" type="search" placeholder="Find a module…" value="${esc(filter)}"></div>
        ${sections.join('') || '<div class="cb-empty"><div class="cb-empty-mark">🔦</div>Nothing by that name backstage.</div>'}`;
}

function renderNotes(notes) {
    if (!notes.length) {
        return `<div class="cb-empty cb-allclear"><div class="cb-empty-mark">🎧</div>
            <div class="cb-empty-title">All clear</div>Board's clean. Places, everyone.</div>`;
    }
    const icon = { error: 'fa-circle-exclamation', warn: 'fa-triangle-exclamation', info: 'fa-lightbulb' };
    const label = { error: 'Stop', warn: 'Standby', info: 'Note' };
    return notes.map((n, i) => `<div class="cb-note cb-${n.level}">
        <div class="cb-note-head"><span class="fa-solid ${icon[n.level]}"></span>${label[n.level]}</div>
        <div class="cb-note-text">${esc(n.text)}</div>
        ${n.fixes.length ? `<div class="cb-fixes">${n.fixes.map((f, j) => `<button class="cb-btn" data-cb-fix="${i}:${j}">${esc(f.label)}</button>`).join('')}</div>` : ''}
    </div>`).join('');
}

function splitEmoji(name) {
    const m = String(name).match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u);
    return m ? [m[1], m[2]] : ['🎟️', name];
}

function renderLoadouts() {
    const c = ctx();
    const pin = c.chatMetadata?.[PIN_KEY];
    const saved = Object.entries(settings().loadouts).sort((a, b) => a[0].localeCompare(b[0]));
    const savedCard = ([name, l]) => {
        const [mark, label] = splitEmoji(name);
        return `<div class="cb-card">
            <div class="cb-card-mark">${mark}</div>
            <div class="cb-card-main"><div class="cb-card-title">${esc(label)}</div>
                <div class="cb-card-sub">${l.on?.length ?? 0} modules lit${l.savedAt ? ` · ${new Date(l.savedAt).toLocaleDateString()}` : ''}</div></div>
            <div class="cb-card-actions">
                <button class="cb-btn cb-btn-go" data-cb-apply="saved" data-cb-name="${esc(name)}">Apply</button>
                <button class="cb-icon fa-solid fa-thumbtack" data-cb-pin="${esc(name)}" title="Apply and pin to this chat"></button>
                <button class="cb-icon fa-solid fa-file-export" data-cb-export="${esc(name)}" title="Export"></button>
                <button class="cb-icon cb-danger fa-solid fa-trash" data-cb-delete="${esc(name)}" title="Delete"></button>
            </div>
        </div>`;
    };
    const starterCard = (st) => {
        const [mark, label] = splitEmoji(st.name);
        return `<button class="cb-starter" data-cb-apply="starter" data-cb-name="${esc(st.name)}">
            <span class="cb-starter-mark">${mark}</span>
            <span class="cb-starter-title">${esc(label)}</span>
            ${st.blurb ? `<span class="cb-starter-sub">${esc(st.blurb)}</span>` : ''}
        </button>`;
    };
    return `
        <div class="cb-sub">This chat</div>
        ${pin ? `<div class="cb-ticket">
                <div class="cb-ticket-stub">📌</div>
                <div class="cb-card-main"><div class="cb-card-title">${esc(pin.name)}</div>
                    <div class="cb-card-sub">Re-dresses the stage whenever this chat opens</div></div>
                <div class="cb-card-actions">
                    <button class="cb-btn cb-btn-go" data-cb-apply="pin">Re-apply</button>
                    <button class="cb-btn" data-cb-unpin>Unpin</button>
                </div></div>`
        : `<button class="cb-ticket cb-ticket-empty" data-cb-pin-current>
                <div class="cb-ticket-stub">📌</div>
                <div class="cb-card-main"><div class="cb-card-title">Pin the current board to this chat</div>
                    <div class="cb-card-sub">Opening this chat will set the board back to exactly this</div></div></button>`}
        <div class="cb-sub">Save the current board</div>
        <div class="cb-save-row"><input class="cb-input cb-save-name" placeholder="🎀 Name it — an emoji up front becomes its icon">
            <button class="cb-btn cb-btn-go" data-cb-save>Save</button></div>
        <div class="cb-sub">Your loadouts</div>
        ${saved.length ? saved.map(savedCard).join('') : '<div class="cb-hint">Nothing saved yet. Dress the stage, then save it above.</div>'}
        <div class="cb-io">
            <button class="cb-btn" data-cb-export-all><span class="fa-solid fa-file-export"></span> Export all</button>
            <label class="cb-btn"><span class="fa-solid fa-file-import"></span> Import<input type="file" accept=".json,application/json" data-cb-import hidden></label>
        </div>
        <div class="cb-sub">Starters <span class="cb-sub-note">only change the modules they name</span></div>
        <div class="cb-starters">${STARTERS.map(starterCard).join('')}</div>`;
}

/** The "now showing" strip: the choices that define the show, at a glance. */
function renderMarquee() {
    const litIn = (key) => GROUPS[key]?.pick.find(id => has(id) && lit(id));
    const label = (key, id) => GROUPS[key].labels?.[id] ?? nameOf(id, true);
    const cue = (key, section, fallback) => {
        const id = litIn(key);
        return `<button class="cb-cue ${id ? '' : 'is-dark'}" data-cb-jump="${section}" style="--cb-accent:${hue(section)}">
            <span class="cb-cue-k">${esc(GROUPS[key]?.label ?? key)}</span>
            <span class="cb-cue-v">${esc(id ? label(key, id) : fallback)}</span></button>`;
    };
    const overlays = ['cb_wing_college', 'cb_wing_fantasy_magic', 'cb_wing_omega'].filter(id => has(id) && lit(id));
    const wing = litIn('wing');
    const wingText = [wing ? label('wing', wing) : '—', ...overlays.map(id => nameOf(id).replace(/^\S+\s*/, '+ '))].join(' ');
    return `<button class="cb-cue ${wing ? '' : 'is-dark'}" data-cb-jump="wings" style="--cb-accent:${hue('wings')}">
            <span class="cb-cue-k">Wing</span><span class="cb-cue-v">${esc(wingText)}</span></button>
        ${cue('mode', 'core', '—')}
        ${cue('tracker', 'state', 'No tracker')}
        ${cue('cot', 'utils', 'No CoT')}
        ${cue('model', 'utils', 'No model layer')}`;
}

function renderMeter() {
    const parts = [];
    let total = 0;
    const mapped = mappedIds();
    const sectionOf = new Map();
    for (const s of SECTIONS) for (const i of s.items) (i.group ? i.pick : [i.toggle]).forEach(id => sectionOf.set(id, s));
    const sums = {};
    for (const id of allModules()) {
        if (!lit(id)) continue;
        const key = mapped.has(id) ? sectionOf.get(id).key : 'unsorted';
        sums[key] = (sums[key] ?? 0) + tokensOf(id);
        total += tokensOf(id);
    }
    for (const s of [...SECTIONS, { key: 'unsorted', title: 'Unsorted' }]) {
        if (!sums[s.key]) continue;
        parts.push(`<span style="flex:${sums[s.key]};background:${hue(s.key)}" title="${esc(s.title)} · ~${sums[s.key].toLocaleString()} tokens"></span>`);
    }
    return { total, bar: parts.join('') };
}

let lastNotes = [];

function render() {
    if (!panel || panel.hidden) return;
    const body = panel.querySelector('.cb-body');
    const scroll = body.scrollTop;
    const hadFocus = document.activeElement?.classList.contains('cb-search');

    const presetName = ctx().getPresetManager?.('openai')?.getSelectedPresetName?.() ?? '';
    panel.querySelector('.cb-preset').textContent = presetName || 'no preset';

    const live = isLive();
    panel.classList.toggle('is-dark', !live);
    if (!live) {
        panel.querySelector('.cb-marquee').innerHTML = '';
        panel.querySelector('.cb-meter').innerHTML = '';
        panel.querySelector('.cb-total').textContent = '';
        body.innerHTML = `<div class="cb-empty"><div class="cb-empty-mark">🎧</div>
            <div class="cb-empty-title">House lights are up</div>
            Switch to a Chat Completion API and load the CALLBOARD preset. Then I'm all yours, director.</div>`;
        return;
    }

    lastNotes = lint();
    const { total, bar } = renderMeter();
    panel.querySelector('.cb-marquee').innerHTML = renderMarquee();
    panel.querySelector('.cb-meter').innerHTML = bar;
    panel.querySelector('.cb-total').innerHTML = `<b>~${total.toLocaleString()}</b> tokens lit`;
    const bad = lastNotes.filter(n => n.level !== 'info').length;
    const badge = panel.querySelector('.cb-badge');
    badge.textContent = bad || '';
    badge.classList.toggle('is-error', lastNotes.some(n => n.level === 'error'));
    panel.querySelectorAll('[data-cb-tab]').forEach(b => b.classList.toggle('is-active', b.dataset.cbTab === tab));

    body.innerHTML = tab === 'notes' ? renderNotes(lastNotes) : tab === 'loadouts' ? renderLoadouts() : renderBoard();
    body.scrollTop = scroll;
    if (hadFocus) {
        const s = body.querySelector('.cb-search');
        s?.focus();
        s?.setSelectionRange(s.value.length, s.value.length);
    }
}

function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => { refreshQueued = false; render(); });
}

function jumpTo(key) {
    tab = 'board';
    filter = '';
    if (settings().collapsed[key]) {
        settings().collapsed[key] = false;
        save();
    }
    render();
    const el = panel.querySelector(`[data-cb-section="${key}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.remove('is-flash');
    void el.offsetWidth;
    el.classList.add('is-flash');
}

async function peek(id) {
    const p = prompt(id);
    if (!p) return;
    const c = ctx();
    const html = `<div class="cb-peek-pop"><div class="cb-peek-title">${esc(p.name)}</div>
        <div class="cb-peek-meta">${esc(id)} · ~${tokensOf(id)} tokens · ${lit(id) ? 'lit' : 'dark'}</div>
        <pre class="cb-peek-text">${esc(p.content)}</pre></div>`;
    if (c.callGenericPopup) await c.callGenericPopup(html, c.POPUP_TYPE?.TEXT ?? 1, '', { wide: true, large: true, allowVerticalScrolling: true });
}

function onClick(ev) {
    const t = ev.target.closest('button, [data-cb-tab]');
    if (!t || !panel.contains(t)) return;
    const d = t.dataset;

    if ('cbClose' in d) return togglePanel(false);
    if (d.cbTab) { tab = d.cbTab; return render(); }
    if (d.cbJump) return jumpTo(d.cbJump);
    if (d.cbPeek) { ev.preventDefault(); return peek(d.cbPeek); }
    if (d.cbPick !== undefined) {
        const id = d.cbId || null;
        const g = GROUPS[d.cbPick];
        if (!g.none && !id) return;
        // Clicking a lit chip in an optional band turns the band off.
        const target = id && lit(id) && g.none ? null : id;
        if (pick(d.cbPick, target)) commit();
        return;
    }
    if (d.cbFix) {
        const [i, j] = d.cbFix.split(':').map(Number);
        lastNotes[i]?.fixes[j]?.run();
        return queueRefresh();
    }
    if (d.cbApply) {
        if (d.cbApply === 'pin') {
            const pin = ctx().chatMetadata?.[PIN_KEY];
            return pin && applyLoadout(pin);
        }
        const l = d.cbApply === 'starter'
            ? STARTERS.find(s => s.name === d.cbName)
            : { name: d.cbName, ...settings().loadouts[d.cbName] };
        return l && applyLoadout(l);
    }
    if (d.cbPin) {
        applyLoadout({ name: d.cbPin, ...settings().loadouts[d.cbPin] });
        return pinToChat(d.cbPin);
    }
    if ('cbPinCurrent' in d) return pinToChat('Pinned board');
    if ('cbUnpin' in d) return unpin();
    if ('cbSave' in d) return saveLoadout(panel.querySelector('.cb-save-name')?.value);
    if (d.cbExport) return download(`callboard-${d.cbExport}.json`, { name: d.cbExport, ...settings().loadouts[d.cbExport] });
    if ('cbExportAll' in d) return download('callboard-loadouts.json', { loadouts: settings().loadouts });
    if (d.cbDelete) {
        delete settings().loadouts[d.cbDelete];
        save();
        return queueRefresh();
    }
}

function onChange(ev) {
    const t = ev.target;
    if (t.dataset.cbToggle) {
        if (setLit(t.dataset.cbToggle, t.checked)) commit();
    } else if ('cbImport' in t.dataset && t.files?.[0]) {
        importLoadouts(t.files[0]);
        t.value = '';
    }
}

function buildPanel() {
    panel = document.createElement('div');
    panel.id = 'cb_board';
    panel.hidden = true;
    panel.tabIndex = -1;
    panel.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') togglePanel(false); });
    panel.innerHTML = `
        <div class="cb-head">
            <div class="cb-bulbs" aria-hidden="true"></div>
            <div class="cb-head-row">
                <div class="cb-title-wrap">
                    <div class="cb-eyebrow">Stage manager's console</div>
                    <div class="cb-title">CALLBOARD</div>
                    <div class="cb-preset"></div>
                </div>
                <button class="cb-close fa-solid fa-xmark" data-cb-close title="Close" aria-label="Close"></button>
            </div>
            <div class="cb-marquee"></div>
            <div class="cb-meter-row"><div class="cb-meter"></div><div class="cb-total"></div></div>
        </div>
        <div class="cb-tabs" role="tablist">
            <button data-cb-tab="board" role="tab"><span class="fa-solid fa-sliders"></span>Board</button>
            <button data-cb-tab="notes" role="tab"><span class="fa-solid fa-clipboard-list"></span>Notes<span class="cb-badge"></span></button>
            <button data-cb-tab="loadouts" role="tab"><span class="fa-solid fa-box-archive"></span>Loadouts</button>
        </div>
        <div class="cb-body"></div>`;
    document.body.append(panel);
    panel.addEventListener('click', onClick);
    panel.addEventListener('change', onChange);
    panel.addEventListener('input', (ev) => {
        if (!ev.target.classList.contains('cb-search')) return;
        filter = ev.target.value.trim().toLowerCase();
        render();
    });
    panel.addEventListener('toggle', (ev) => {
        const key = ev.target.dataset?.cbSection;
        if (!key || filter || !!settings().collapsed[key] === !ev.target.open) return;
        settings().collapsed[key] = !ev.target.open;
        save();
    }, true);
}

function togglePanel(force) {
    if (!panel) buildPanel();
    panel.hidden = force === undefined ? !panel.hidden : !force;
    if (!panel.hidden) panel.focus({ preventScroll: true });
    render();
}

function buildLaunchers() {
    const menu = document.getElementById('extensionsMenu');
    if (menu) {
        const item = document.createElement('div');
        item.className = 'list-group-item flex-container flexGap5 interactable';
        item.tabIndex = 0;
        item.innerHTML = '<div class="fa-solid fa-headset extensionsMenuExtensionButton"></div>CALLBOARD';
        item.addEventListener('click', () => togglePanel(true));
        menu.append(item);
    }

    const host = document.getElementById('extensions_settings2') ?? document.getElementById('extensions_settings');
    if (!host) return;
    const s = settings();
    const box = document.createElement('div');
    box.className = 'cb-settings';
    box.innerHTML = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🎧 CALLBOARD Suite</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="menu_button" data-cb-open>Open the Board</div>
                <label class="checkbox_label"><input type="checkbox" data-cb-opt="autoTracker" ${s.autoTracker ? 'checked' : ''}>
                    Switching wings switches the tracker to match (if one is lit)</label>
                <label class="checkbox_label"><input type="checkbox" data-cb-opt="autoApplyPinned" ${s.autoApplyPinned ? 'checked' : ''}>
                    Re-dress the stage from a chat's pinned loadout when it opens</label>
                <small>Slash commands: /cb · /cb-load · /cb-pick · /cb-on · /cb-off · /cb-check</small>
            </div>
        </div>`;
    box.querySelector('[data-cb-open]').addEventListener('click', () => togglePanel(true));
    box.addEventListener('change', (ev) => {
        const key = ev.target.dataset.cbOpt;
        if (!key) return;
        settings()[key] = ev.target.checked;
        save();
    });
    host.append(box);
}

// ─────────────────────────────── slash commands ───────────────────────────────

/** Find a module by identifier or by a fragment of its name. */
function resolveModule(q, pool = allModules()) {
    q = String(q ?? '').trim().toLowerCase();
    if (!q) return null;
    return pool.find(id => id === q || id === `cb_${q}`)
        ?? pool.find(id => id.includes(q))
        ?? pool.find(id => (prompt(id)?.name ?? '').toLowerCase().includes(q))
        ?? null;
}

function registerCommands() {
    const c = ctx();
    const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = c;
    if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps) return;

    const arg = (description, isRequired = true) => SlashCommandArgument.fromProps({ description, typeList: [ARGUMENT_TYPE.STRING], isRequired });
    const live = () => {
        if (isLive()) return true;
        toastr.warning('Load the CALLBOARD preset first.', 'CALLBOARD');
        return false;
    };
    const add = (props) => SlashCommandParser.addCommandObject(SlashCommand.fromProps(props));

    add({
        name: 'cb',
        helpString: 'Open or close the CALLBOARD board.',
        callback: () => { togglePanel(); return ''; },
    });
    add({
        name: 'cb-load',
        helpString: 'Apply a CALLBOARD loadout (yours or a starter) by name. <code>/cb-load regency</code>',
        unnamedArgumentList: [arg('loadout name')],
        callback: (_a, name) => {
            if (!live()) return '';
            const l = findLoadout(name);
            if (!l) toastr.warning(`No loadout called “${name}”.`, 'CALLBOARD');
            else applyLoadout(l);
            return l?.name ?? '';
        },
    });
    add({
        name: 'cb-pick',
        helpString: 'Pick one in a band: <code>/cb-pick wing regency</code>, <code>/cb-pick cot none</code>. Bands: ' + Object.keys(GROUPS).join(', '),
        unnamedArgumentList: [arg('band and choice')],
        callback: (_a, text) => {
            if (!live()) return '';
            const [band, ...rest] = String(text ?? '').trim().split(/\s+/);
            const g = GROUPS[band?.toLowerCase()];
            if (!g) { toastr.warning(`Unknown band “${band}”.`, 'CALLBOARD'); return ''; }
            const choice = rest.join(' ');
            const id = /^(none|off)$/i.test(choice) ? null : resolveModule(choice, g.pick.filter(has));
            if (id === null && !/^(none|off)$/i.test(choice)) { toastr.warning(`No “${choice}” in ${g.label}.`, 'CALLBOARD'); return ''; }
            if (!id && !g.none) { toastr.warning(`${g.label} can't be empty.`, 'CALLBOARD'); return ''; }
            if (pick(g.group, id)) commit();
            return id ?? '';
        },
    });
    for (const on of [true, false]) {
        add({
            name: on ? 'cb-on' : 'cb-off',
            helpString: `Turn a CALLBOARD module ${on ? 'on' : 'off'} by id or name. <code>/cb-${on ? 'on' : 'off'} slowburn</code>`,
            unnamedArgumentList: [arg('module')],
            callback: (_a, q) => {
                if (!live()) return '';
                const id = resolveModule(q);
                if (!id) { toastr.warning(`No module matching “${q}”.`, 'CALLBOARD'); return ''; }
                if (setLit(id, on)) commit();
                toastr.info(`${nameOf(id)} — ${on ? 'lit' : 'dark'}`, 'CALLBOARD');
                return id;
            },
        });
    }
    add({
        name: 'cb-check',
        helpString: 'Run Xavi\'s board check and return the notes as text.',
        callback: () => {
            if (!live()) return '';
            const notes = lint();
            const text = notes.length ? notes.map(n => `[${n.level}] ${n.text}`).join('\n') : 'Board is clean.';
            (notes.some(n => n.level === 'error') ? toastr.error : notes.length ? toastr.warning : toastr.success)(text, 'CALLBOARD');
            return text;
        },
    });
}

// ──────────────────────────────── boot ────────────────────────────────

function onChatChanged() {
    queueRefresh();
    const pin = ctx().chatMetadata?.[PIN_KEY];
    if (!pin || !settings().autoApplyPinned || !isLive()) return;
    if (applyPatch(pin)) toastr.info(`Stage dressed for this chat: ${pin.name}`, 'CALLBOARD');
}

async function init() {
    try {
        oai = await import('../../../openai.js');
    } catch (err) {
        console.error('[CALLBOARD] Could not reach the prompt manager', err);
    }
    try {
        regex = await import('../../regex/engine.js');
    } catch { /* regex health check is optional */ }

    settings();
    buildLaunchers();
    registerCommands();

    const { eventSource, event_types: E } = ctx();
    for (const ev of [E.OAI_PRESET_CHANGED_AFTER, E.SETTINGS_UPDATED, E.MAIN_API_CHANGED, E.CHATCOMPLETION_SOURCE_CHANGED]) {
        if (ev) eventSource.on(ev, queueRefresh);
    }
    eventSource.on(E.CHAT_CHANGED, onChatChanged);
}

jQuery(init);
