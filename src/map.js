// The CALLBOARD map: how the preset's prompts are grouped on the board.
// Identifiers missing from the active preset are skipped, so older/newer
// preset versions still work. Unmapped cb_* prompts land in "Unsorted".

/**
 * Item kinds inside a section:
 *  { toggle: 'id' }                              plain on/off module
 *  { group: 'key', label, pick: [ids], none?, required?, hint? }
 *      pick-one band. `none` = label for the "off" choice (omit to forbid off).
 *      `required` = lint warns when nothing in the band is lit.
 *      `labels` = chip labels where the preset name doesn't shorten well.
 */
export const SECTIONS = [
    {
        key: 'stage', title: 'The Stage Manager', icon: '🎧',
        hint: 'Xavi, his patter, his mood, and how he signs off each message.',
        items: [
            { toggle: 'cb_xavi_core' },
            { group: 'patter', label: 'Patter', none: 'Default', pick: ['cb_xavi_chatty', 'cb_xavi_dry', 'cb_xavi_silent'] },
            { group: 'mood', label: 'Mood', none: 'Default', pick: ['cb_xavi_flirt', 'cb_xavi_savage', 'cb_xavi_pro'] },
            { group: 'curtain', label: 'Curtain', none: 'Unset', pick: ['cb_curtain_off', 'cb_curtain_line', 'cb_curtain_notes', 'cb_curtain_talkback'] },
        ],
    },
    {
        key: 'core', title: 'Core', icon: '🗝️',
        hint: 'House rules, who holds the pen, and the always-on charters.',
        items: [
            { toggle: 'cb_houserules' },
            { group: 'mode', label: 'Mode', required: true, pick: ['cb_impersonate', 'cb_story_mode'], labels: { cb_impersonate: '🎭 Impersonate', cb_story_mode: '🖊️ Story Mode' }, hint: 'Impersonate: Xavi writes your character too. Story Mode: you write yours.' },
            { toggle: 'cb_manual' },
            { toggle: 'cb_charter_lite' },
            { toggle: 'cb_alive' },
            { toggle: 'cb_world' },
            { toggle: 'cb_senses' },
            { toggle: 'cb_relationships' },
            { toggle: 'cb_consequences' },
            { toggle: 'cb_memory' },
            { toggle: 'cb_spectrum' },
            { toggle: 'cb_cast_bible' },
            { toggle: 'cb_persona_bible' },
        ],
    },
    {
        key: 'prose', title: 'Prose Charter', icon: '✒️',
        items: [
            { toggle: 'cb_prose_lite' },
            { toggle: 'cb_prose' },
            { group: 'sensory', label: 'Sensory', none: 'Off', pick: ['cb_sensory_vivid', 'cb_sensory_amplified'] },
            { toggle: 'cb_killstyle' },
            { toggle: 'cb_clothing' },
            { toggle: 'cb_antislop_names' },
            { toggle: 'cb_voices' },
            { toggle: 'cb_dialogue' },
            { toggle: 'cb_intimacy' },
        ],
    },
    {
        key: 'wings', title: 'Setting', icon: '🏛️',
        hint: 'One wing. College stacks on Modern or Y2K; Magic stacks on Fantasy, Urban, Paranormal or Wuxia; Omegaverse stacks on anything.',
        items: [
            {
                group: 'wing', label: 'Wing', none: 'None', required: true,
                pick: ['cb_wing_modern', 'cb_wing_y2k', 'cb_wing_twenties', 'cb_wing_victorian', 'cb_wing_regency', 'cb_wing_westeros', 'cb_wing_medieval', 'cb_wing_fantasy', 'cb_wing_wuxia', 'cb_wing_urban', 'cb_wing_paranormal', 'cb_wing_scifi', 'cb_wing_cyberpunk', 'cb_wing_postapoc'],
            },
            { toggle: 'cb_wing_college' },
            { toggle: 'cb_wing_fantasy_magic' },
            { toggle: 'cb_wing_omega' },
        ],
    },
    {
        key: 'systems', title: 'Story Systems', icon: '⚙️',
        items: [
            { toggle: 'cb_slowburn' },
            { group: 'pacing', label: 'Pacing', none: 'Off', pick: ['cb_pacing_chapter', 'cb_pacing_balanced', 'cb_pacing_propulsive'] },
            { group: 'difficulty', label: 'Difficulty', none: 'Off', pick: ['cb_diff_charmed', 'cb_diff_normal', 'cb_diff_merciless'] },
            { group: 'irony', label: 'Reader knows…', none: 'Off', pick: ['cb_irony_behind', 'cb_irony_ahead'], labels: { cb_irony_behind: '👁️ Less (mystery)', cb_irony_ahead: '👁️ More (dramatic irony)' } },
            { toggle: 'cb_ensemble' },
            { toggle: 'cb_living_world' },
            { toggle: 'cb_worthy_adversary' },
            { toggle: 'cb_promise_shelf' },
            { toggle: 'cb_mystery' },
            { toggle: 'cb_moments_peace' },
            { toggle: 'cb_wagers' },
            { toggle: 'cb_condition' },
            { toggle: 'cb_vignette' },
            { toggle: 'cb_vignette_multi' },
        ],
    },
    {
        key: 'spotlight', title: 'Spotlight', icon: '🌟',
        items: [
            { toggle: 'cb_fame' },
            { toggle: 'cb_fame_pop' },
            { toggle: 'cb_fame_rock' },
        ],
    },
    {
        key: 'content', title: 'Content', icon: '🔥',
        items: [
            { toggle: 'cb_smut' },
            { toggle: 'cb_chaos_nsfw' },
            { toggle: 'cb_deaddove' },
            { toggle: 'cb_trauma_guards' },
        ],
    },
    {
        key: 'state', title: 'Trackers & Boards', icon: '🎛️',
        hint: 'Everything here writes into the one shared <cb_state> block. Match the tracker to your wing.',
        items: [
            { group: 'tracker', label: 'Tracker', none: 'Off', pick: ['cb_tracker_modern', 'cb_tracker_period', 'cb_tracker_regency'] },
            { toggle: 'cb_board_cast' },
            { toggle: 'cb_board_relationship' },
            { toggle: 'cb_board_status' },
            { toggle: 'cb_board_inventory' },
            { toggle: 'cb_board_codex' },
        ],
    },
    {
        key: 'panels', title: 'Chat Panels, Apps & Press', icon: '💬',
        hint: 'Regex-drawn panels: the model writes data lines, the regex draws the window.',
        items: [
            { group: 'twitch', label: 'Twitch', none: 'Off', pick: ['cb_twitch_rx', 'cb_twitch'], labels: { cb_twitch_rx: '💜 Regex panel', cb_twitch: '💜 Freeform HTML' } },
            { toggle: 'cb_discord_rx' },
            { toggle: 'cb_x_rx' },
            { toggle: 'cb_reddit_rx' },
            { toggle: 'cb_press' },
            { toggle: 'cb_y2k_comms' },
            { toggle: 'cb_dating_rx' },
            { toggle: 'cb_browser_rx' },
            { toggle: 'cb_insta_rx' },
            { toggle: 'cb_private_rx' },
            { toggle: 'cb_creator_rx' },
        ],
    },
    {
        key: 'visuals', title: 'Visuals', icon: '🖼️',
        items: [
            { toggle: 'cb_html_master' },
            { toggle: 'cb_phones' },
            { toggle: 'cb_social' },
            { toggle: 'cb_documents' },
            { toggle: 'cb_css_mood' },
            { toggle: 'cb_colored_dialogue' },
            { toggle: 'cb_css_interactive' },
            { toggle: 'cb_js' },
            { toggle: 'cb_chapter_plates' },
            { toggle: 'cb_scene_ledger' },
            { toggle: 'cb_ext_loader' },
            { toggle: 'cb_ext_bg' },
            { toggle: 'cb_ext_bridge' },
        ],
    },
    {
        key: 'utils', title: 'Utilities', icon: '🧭',
        items: [
            { group: 'cues', label: 'Cue calls', none: 'Off', pick: ['cb_cue_full', 'cb_cue_visual'], labels: { cb_cue_full: '📣 Everything' }, hint: 'A STANDBY slip above anything about to pop up, explained the first time.' },
            { toggle: 'cb_program' },
            { group: 'model', label: 'Model layer', none: 'None', pick: ['cb_model_claude', 'cb_model_glm', 'cb_model_mimo', 'cb_model_kimi'] },
            { group: 'cot', label: 'Callboard CoT', none: 'None', pick: ['cb_callboard_cot', 'cb_cot_wholesome', 'cb_cot_fantasy'] },
            { toggle: 'cb_ooc' },
            { toggle: 'cb_momentum' },
            { toggle: 'cb_cast_echo' },
            { toggle: 'cb_persona_echo' },
            { toggle: 'cb_last_check' },
            { toggle: 'cb_standing_order' },
        ],
    },
];

/** Prompts that are structure (wrappers, readme), never shown as switches. */
export const STRUCTURAL = new Set([
    'cb_readme',
    'cb_world_open', 'cb_world_close',
    'cb_prot_open', 'cb_prot_close',
    'cb_voice_open', 'cb_voice_close',
]);

/**
 * Short labels for the board. Drops trailing "(pick one)"-style notes; inside
 * a band also drops the band prefix ("🗣️ Patter — Chatty" → "🗣️ Chatty").
 */
export function shortName(name, inBand = false) {
    let s = String(name ?? '').trim();
    while (/\([^)]*\)\s*$/.test(s)) s = s.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (inBand) s = s.replace(/^(\S+)\s+[^—]+?\s+—\s+/, '$1 ');
    return s;
}

/** Dependencies: a lit `id` wants at least one of `any` lit too. */
export const REQUIRES = [
    { id: 'cb_manual', any: ['cb_impersonate'], why: 'Manual Mode is a switch for Impersonate; it does nothing in Story Mode.', fix: 'off' },
    { id: 'cb_wing_college', any: ['cb_wing_modern', 'cb_wing_y2k'], why: 'College AU is a sub-wing of Modern (or Y2K).' },
    { id: 'cb_wing_fantasy_magic', any: ['cb_wing_fantasy', 'cb_wing_urban', 'cb_wing_paranormal', 'cb_wing_wuxia'], why: 'Magic With Laws stacks on a fantastical wing.' },
    { id: 'cb_fame_pop', any: ['cb_fame'], why: 'The Pop Star flavor rides on the Fame Engine.' },
    { id: 'cb_fame_rock', any: ['cb_fame'], why: 'The Rockstar flavor rides on the Fame Engine.' },
    { id: 'cb_css_mood', any: ['cb_html_master'], why: 'CSS Mood Effects needs the diegetic HTML master.' },
    { id: 'cb_js', any: ['cb_html_master'], why: "Xavi's Rigging needs the diegetic HTML master." },
    { id: 'cb_chapter_plates', any: ['cb_html_master'], why: 'Chapter Plates need the diegetic HTML master.' },
    { id: 'cb_scene_ledger', any: ['cb_html_master'], why: 'The Scene Ledger needs the diegetic HTML master.' },
    { id: 'cb_ext_bg', any: ['cb_ext_loader'], why: 'Background Injection reads the Pollinations loader\'s directives.' },
    { id: 'cb_ext_bridge', any: ['cb_ext_loader'], why: 'The JS Bridge reads the Pollinations loader\'s directives.' },
];

/** Soft pairings: worth a note, not an error. */
export const ADVISORIES = [
    { when: ['cb_y2k_comms'], unless: ['cb_wing_y2k'], text: 'Y2K Comms is lit without the Y2K wing — AIM and flip phones in a modern story?' },
    { when: ['cb_insta_rx'], unless: ['cb_wing_modern', 'cb_wing_urban', 'cb_wing_paranormal', 'cb_wing_cyberpunk', 'cb_wing_scifi'], text: 'Instagram is lit on a wing where it doesn\'t exist yet (or anymore).' },
    { when: ['cb_dating_rx'], unless: ['cb_wing_modern', 'cb_wing_y2k', 'cb_wing_urban', 'cb_wing_paranormal', 'cb_wing_cyberpunk', 'cb_wing_scifi'], text: 'The Dating App is lit on a wing without dating apps.' },
    { when: ['cb_deaddove', 'cb_trauma_guards'], text: 'Dead Dove and Trauma Guards are both lit — the Guards win where they overlap.' },
    { when: ['cb_cot_fantasy'], unless: ['cb_wing_fantasy', 'cb_wing_westeros', 'cb_wing_medieval', 'cb_wing_wuxia', 'cb_wing_urban', 'cb_wing_paranormal'], text: 'The Fantasy CoT is lit on a non-fantasy wing.' },
];

/** Which tracker each wing wants. */
export const WING_TRACKER = {
    cb_wing_modern: 'cb_tracker_modern',
    cb_wing_y2k: 'cb_tracker_modern',
    cb_wing_urban: 'cb_tracker_modern',
    cb_wing_paranormal: 'cb_tracker_modern',
    cb_wing_twenties: 'cb_tracker_modern',
    cb_wing_scifi: 'cb_tracker_modern',
    cb_wing_cyberpunk: 'cb_tracker_modern',
    cb_wing_postapoc: 'cb_tracker_modern',
    cb_wing_wuxia: 'cb_tracker_period',
    cb_wing_victorian: 'cb_tracker_regency',
    cb_wing_westeros: 'cb_tracker_period',
    cb_wing_medieval: 'cb_tracker_period',
    cb_wing_fantasy: 'cb_tracker_period',
    cb_wing_regency: 'cb_tracker_regency',
};

/**
 * Starter loadouts. These are patches: `picks` sets a band, `on`/`off`
 * flip single modules, everything else is left as it is.
 */
export const STARTERS = [
    {
        name: '📱 Modern Romance',
        blurb: 'Slow burn, cast board, balanced pacing',
        picks: { wing: 'cb_wing_modern', tracker: 'cb_tracker_modern', pacing: 'cb_pacing_balanced', cot: 'cb_callboard_cot' },
        on: ['cb_slowburn', 'cb_board_cast'],
        off: ['cb_wing_college', 'cb_wing_fantasy_magic', 'cb_fame', 'cb_fame_pop', 'cb_fame_rock'],
    },
    {
        name: '🎓 College AU',
        blurb: 'Campus life, Discord, relationship web',
        picks: { wing: 'cb_wing_modern', tracker: 'cb_tracker_modern', cot: 'cb_callboard_cot' },
        on: ['cb_wing_college', 'cb_discord_rx', 'cb_board_relationship'],
        off: ['cb_wing_fantasy_magic'],
    },
    {
        name: '⚔️ Westeros Grimdark',
        blurb: 'Merciless, living world, codex',
        picks: { wing: 'cb_wing_westeros', tracker: 'cb_tracker_period', difficulty: 'cb_diff_merciless', cot: 'cb_cot_fantasy', twitch: null },
        on: ['cb_worthy_adversary', 'cb_living_world', 'cb_board_cast', 'cb_board_codex'],
        off: ['cb_wing_college', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx', 'cb_fame', 'cb_fame_pop', 'cb_fame_rock'],
    },
    {
        name: '🎀 Regency Courtship',
        blurb: 'Chapter pacing, reputation, slow burn',
        picks: { wing: 'cb_wing_regency', tracker: 'cb_tracker_regency', pacing: 'cb_pacing_chapter', cot: 'cb_callboard_cot', twitch: null },
        on: ['cb_slowburn', 'cb_board_relationship'],
        off: ['cb_wing_college', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx', 'cb_fame', 'cb_fame_pop', 'cb_fame_rock'],
    },
    {
        name: '🐉 Cozy Fantasy',
        blurb: 'Charmed, magic with laws, inventory',
        picks: { wing: 'cb_wing_fantasy', tracker: 'cb_tracker_period', difficulty: 'cb_diff_charmed', cot: 'cb_cot_wholesome', twitch: null },
        on: ['cb_wing_fantasy_magic', 'cb_moments_peace', 'cb_board_inventory'],
        off: ['cb_wing_college', 'cb_deaddove', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx'],
    },
    {
        name: '🎤 Pop Star Spotlight',
        blurb: 'Fame engine, press, Twitch, X',
        picks: { wing: 'cb_wing_modern', tracker: 'cb_tracker_modern', twitch: 'cb_twitch_rx' },
        on: ['cb_fame', 'cb_fame_pop', 'cb_press', 'cb_x_rx'],
        off: ['cb_wing_fantasy_magic'],
    },
    {
        name: '📟 Y2K Teen Drama',
        blurb: 'AIM, flip phones, MySpace',
        picks: { wing: 'cb_wing_y2k', tracker: 'cb_tracker_modern', twitch: null },
        on: ['cb_y2k_comms'],
        off: ['cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx', 'cb_wing_fantasy_magic'],
    },
    {
        name: '🌃 Urban Fantasy Mystery',
        blurb: 'Mystery, clue log, reader behind',
        picks: { wing: 'cb_wing_urban', tracker: 'cb_tracker_modern', irony: 'cb_irony_behind' },
        on: ['cb_mystery', 'cb_wing_fantasy_magic', 'cb_board_codex'],
        off: ['cb_wing_college'],
    },
    {
        name: '📲 Extremely Online',
        blurb: 'Dating app, Instagram, browser, private photos',
        picks: { wing: 'cb_wing_modern', tracker: 'cb_tracker_modern' },
        on: ['cb_dating_rx', 'cb_insta_rx', 'cb_browser_rx', 'cb_private_rx', 'cb_board_relationship'],
        off: ['cb_wing_fantasy_magic', 'cb_y2k_comms'],
    },
    {
        name: '🎩 Gilded Age Scandal',
        blurb: 'Reputation, high society, slow burn',
        picks: { wing: 'cb_wing_victorian', tracker: 'cb_tracker_regency', pacing: 'cb_pacing_chapter', twitch: null },
        on: ['cb_slowburn', 'cb_board_relationship', 'cb_living_world'],
        off: ['cb_wing_college', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx', 'cb_fame', 'cb_fame_pop', 'cb_fame_rock'],
    },
    {
        name: '🥂 Speakeasy Nights',
        blurb: 'Prohibition, the mob, worthy adversary',
        picks: { wing: 'cb_wing_twenties', tracker: 'cb_tracker_modern', twitch: null },
        on: ['cb_worthy_adversary', 'cb_living_world', 'cb_board_cast'],
        off: ['cb_wing_college', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx'],
    },
    {
        name: '🏯 Jianghu Wanderer',
        blurb: 'Sects, grudges, cultivation with costs',
        picks: { wing: 'cb_wing_wuxia', tracker: 'cb_tracker_period', cot: 'cb_cot_fantasy', twitch: null },
        on: ['cb_wing_fantasy_magic', 'cb_worthy_adversary', 'cb_board_codex'],
        off: ['cb_wing_college', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx', 'cb_fame', 'cb_fame_pop', 'cb_fame_rock'],
    },
    {
        name: '🚀 Space Opera',
        blurb: 'Crew, empires, distance that bites',
        picks: { wing: 'cb_wing_scifi', tracker: 'cb_tracker_modern', twitch: null },
        on: ['cb_living_world', 'cb_ensemble', 'cb_board_cast'],
        off: ['cb_wing_college', 'cb_wing_fantasy_magic', 'cb_y2k_comms'],
    },
    {
        name: '🌆 Cyberpunk Noir',
        blurb: 'Chrome, debt, mystery in the rain',
        picks: { wing: 'cb_wing_cyberpunk', tracker: 'cb_tracker_modern', difficulty: 'cb_diff_merciless' },
        on: ['cb_mystery', 'cb_board_status', 'cb_board_codex'],
        off: ['cb_wing_college', 'cb_wing_fantasy_magic', 'cb_y2k_comms'],
    },
    {
        name: '☢️ Wasteland Survival',
        blurb: 'Scarcity, status and inventory boards',
        picks: { wing: 'cb_wing_postapoc', tracker: 'cb_tracker_modern', difficulty: 'cb_diff_merciless', twitch: null },
        on: ['cb_board_status', 'cb_board_inventory', 'cb_worthy_adversary'],
        off: ['cb_wing_college', 'cb_wing_fantasy_magic', 'cb_y2k_comms', 'cb_discord_rx', 'cb_x_rx', 'cb_reddit_rx', 'cb_fame', 'cb_fame_pop', 'cb_fame_rock'],
    },
];

/** Every band, keyed, for lookups. */
export const GROUPS = Object.fromEntries(
    SECTIONS.flatMap(s => s.items.filter(i => i.group).map(i => [i.group, i])),
);
