# 🎧 CALLBOARD Suite

A SillyTavern extension for the **CALLBOARD** preset. CALLBOARD has 120+ modules and a dozen "pick one" bands. Managing it from the prompt-manager list means a lot of scrolling and is easy to get wrong. The Suite gives you a stage manager's board instead.

It doesn't replace the preset or change any prompt text. It flips the same switches you would flip by hand, just faster and with fewer mistakes.

## What it does

- **The Board.** Every module, grouped the way the preset is (Stage Manager, Core, Prose, Setting, Systems, Spotlight, Content, Trackers & Boards, Chat Panels, Visuals, Utilities). Each pick-one band (Mode, Wing, Tracker, Model, CoT, Patter, Mood, Curtain, Pacing, Difficulty, Sensory, Twitch…) is a row of chips, so only one can be lit. Each module shows an approximate token cost and has an 👁 button to read its text. A search box finds any module by name, and the header shows a running total of the tokens you have lit.
- **Xavi's Notes (linter).** Catches the ways the stage breaks, each with one-click fixes:
  - two choices lit in one band (two wings, two Twitch prompts…)
  - no Mode or Wing lit at all
  - overlays without their base: College AU without Modern/Y2K, Magic With Laws without a fantastical wing, Pop/Rock without the Fame Engine, JS/CSS Mood/Chapter Plates/Scene Ledger without the HTML master, EXTREME BG/Bridge without the loader, Manual Mode in Story Mode
  - a tracker that doesn't match the wing (Regency wing + Modern tracker)
  - boards lit while House Rules (which defines `<cb_state>`) is off
  - **regex health:** the preset carries its CB regex scripts, but SillyTavern ignores preset regex until you allow it. The Suite spots that and allows it in one click. Without the regex, cards, panels and the CoT foldout don't render.
- **Loadouts.** Save the current board under a name and apply it later. You can export and import loadouts as JSON. It also ships with starter loadouts (Modern Romance, College AU, Westeros Grimdark, Regency Courtship, Cozy Fantasy, Pop Star Spotlight, Y2K Teen Drama, Urban Fantasy Mystery). Starters only change the modules they name.
- **Per-chat pins.** Pin a loadout to a chat, and opening that chat sets the stage back up automatically. Your Westeros chat and your Y2K chat stop fighting over the same toggles.
- **Wing → tracker auto-match.** If a tracker is lit and you switch wings, the tracker follows (Westeros → Period, Regency → Regency, and so on). You can turn this off.
- **Slash commands** (usable in Quick Replies and STscript):

| Command | Example |
|---|---|
| `/cb` | open/close the board |
| `/cb-load <loadout>` | `/cb-load regency` |
| `/cb-pick <band> <choice\|none>` | `/cb-pick wing westeros` · `/cb-pick cot none` |
| `/cb-on <module>` / `/cb-off <module>` | `/cb-on slowburn` · `/cb-off smut` |
| `/cb-check` | returns the linter's notes as text |

Bands: `patter mood curtain mode sensory wing pacing difficulty irony tracker twitch model cot`.

## Install

1. SillyTavern → **Extensions** → **Install extension**
2. Paste `https://github.com/howardsierra/callboard` and install.
3. Select a Chat Completion API, load the CALLBOARD preset, then open the board from the **wand menu → CALLBOARD**, from **Extensions → CALLBOARD Suite → Open the Board**, or with `/cb`.

## Notes

- Changes go through SillyTavern's own prompt manager, exactly like clicking the toggles. As with hand toggles, use **Save preset** if you want them written into the preset file.
- Token counts are estimates (characters ÷ 3.6) of the raw prompt text, before macros expand.
- Prompts the board's map doesn't know about (from a newer preset version) show up under **Unsorted**, so nothing is ever hidden.
- To change grouping, bands, dependencies or starters, edit `src/map.js`. It's plain data.
