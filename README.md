# 🎧 CALLBOARD

A modular SillyTavern roleplay preset, plus **CALLBOARD Suite**, an extension that gives the preset a stage manager's control board. Your host is Xavi, the stage manager: he runs the show from the wings, calls the cues and stays out of the story.

```
preset/CALLBOARD_v1_4_0.json   ← the preset (prompts + all of its regex)
index.js · style.css · src/    ← the CALLBOARD Suite extension
```

## Setup

1. **Import the preset.** In SillyTavern, choose a Chat Completion API. Then import `preset/CALLBOARD_v1_4_0.json` from the preset dropdown (**AI Response Configuration → Import preset**).
2. **Allow its regex.** Every card, chat panel, STANDBY slip and the Program is drawn by regex that ships inside the preset. You don't import a separate bundle. SillyTavern ignores a preset's regex until you allow it, so say yes when it asks. You can also allow it under **Extensions → Regex → Preset scripts**. If you skip this step, the chat shows raw lines like `T>` and `CUE>` instead of cards.
3. **Install the extension (optional, recommended).** Go to **Extensions → Install extension**, paste `https://github.com/howardsierra/callboard`, then open the board from the wand menu or with `/cb`. If you skipped step 2, the extension's Notes tab catches it and allows the regex in one click.

## Dressing the stage

| Choose | Options |
|---|---|
| **Mode** (one) | 🎭 Impersonate: Xavi writes your character too; `[MANUAL: ON]` / `[MANUAL: OFF]` pauses and resumes it · 🖊️ Story Mode: you write your character |
| **Wing** (one) | 📱 Modern · 📟 Y2K · 🥂 Roaring Twenties · 🎩 Victorian / Gilded Age · 🎀 Regency · ⚔️ Westeros · 🏰 Medieval · 🐉 Fantasy · 🏯 Wuxia / Xianxia · 🌃 Urban Fantasy · 👻 Paranormal · 🚀 Sci-Fi / Space Opera · 🌆 Cyberpunk · ☢️ Post-Apocalyptic |
| **Stackers** | 🎓 College AU (on Modern or Y2K) · 🔮 Magic With Laws (on Fantasy, Urban, Paranormal or Wuxia) · 🐺 Omegaverse (on anything) |
| **Tracker** (matches the wing) | **Modern:** Modern, College, Y2K, Twenties, Urban, Paranormal, Sci-Fi, Cyberpunk, Post-Apocalyptic · **Period:** Westeros, Medieval, Fantasy, Wuxia · **Regency:** Regency, Victorian |
| **Model layer** (one or none) | Claude · GLM · MiMo · Kimi |
| **CoT** (one or none) | Dramatic · Wholesome · Fantasy |

Everything else is optional: boards, story systems, spotlight and fame, chat panels, visuals and content modules.

## New in v1.4

- **Six new wings:** Victorian / Gilded Age, Roaring Twenties, Wuxia / Xianxia, Sci-Fi / Space Opera, Cyberpunk and Post-Apocalyptic. Each has its own speech style, technology rules and a list of things that didn't exist yet.
- **📣 Cue Calls.** You always know what's about to appear. Right before a lit module puts something on the page (a tracker card, a Twitch panel, a tabloid, a generated image, a crossroads), Xavi puts a gold **STANDBY** slip above it. The slip says what's coming and why it's firing. The **first time** each kind of element appears, the slip also has a **What it means** legend explaining how to read it: what the bar measures, what the codes are, and whether it's story or Xavi talking to you. Choose a level:
  - **Everything:** visuals plus story systems. Wagers, Living World, Promise Shelf payoffs, mystery clues, difficulty, slow burn and fame each get a spoiler-free cue that names the mechanism, never the twist.
  - **Visuals only:** cards, panels, artifacts and images. Story systems stay silent.

  After the first appearance, the tracker card only gets a cue when something moves sharply, for example "Rowan's affinity 62 → 74: you kept her secret".
- **🎟️ The Program.** A theatre-program card listing everything that's switched on: what sets each module off and what you'll see. It appears once on the first reply of a chat and again whenever you send `[PROGRAM]` or ask OOC what's lit.
- **Fixed:** Last Check rule 1 told the model to use moons and bells for every period wing, including Regency, which keeps clocks and calendars. Each wing's time and number rules are now spelled out.
- **Fixed:** the in-preset Read Me no longer sends you looking for a separate regex bundle.

## CALLBOARD Suite (the extension)

- **The Board:** every module grouped like the preset. Pick-one bands are chips, so only one in a band can be on. Each module shows its approximate token cost and has a 👁 button to read its text. The "Now showing" strip shows the current Wing, Mode, Tracker, CoT and Model layer at a glance, and a token meter split by section shows where your budget goes.
- **Notes:** a checker with one-click fixes. It catches two wings on at once, stackers without their base, a tracker that doesn't match the wing, boards on without House Rules, and preset regex that isn't allowed.
- **Loadouts:** save, apply, export and import whole boards. There are 14 starters, including Gilded Age Scandal, Speakeasy Nights, Jianghu Wanderer, Space Opera, Cyberpunk Noir and Wasteland Survival. Starters only change the modules they name.
- **Per-chat pins:** pin a loadout to a chat, and the board resets to it whenever that chat opens.
- **Wing → tracker auto-match:** if a tracker is on and you switch wings, the tracker follows.
- **Slash commands:**

| Command | Example |
|---|---|
| `/cb` | open/close the board |
| `/cb-load <loadout>` | `/cb-load gilded` |
| `/cb-pick <band> <choice\|none>` | `/cb-pick wing cyberpunk` · `/cb-pick cues visuals` |
| `/cb-on <module>` / `/cb-off <module>` | `/cb-on slowburn` · `/cb-off program` |
| `/cb-check` | returns the checker's notes as text |

Bands: `patter mood curtain mode sensory wing pacing difficulty irony tracker twitch cues model cot`.

### Extension notes

- Changes go through SillyTavern's own prompt manager, exactly like clicking the toggles yourself. As with hand toggles, use **Save preset** to write them into the preset file.
- Token counts are estimates (characters ÷ 3.6) of the raw prompt text, before macros expand.
- Prompts the board doesn't know about show up under **Unsorted**, so nothing is ever hidden. Grouping, bands, dependencies and starters are plain data in `src/map.js`.
