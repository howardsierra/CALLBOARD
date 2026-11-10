# 🎧 CALLBOARD Suite for Lumiverse

The CALLBOARD board, rebuilt as a [Lumiverse](https://github.com/prolix-oc/Lumiverse) extension. It works with both Lumiverse presets: [CALLBOARD for Lumiverse](../preset/lumiverse/README.md) and the [CALLBOARD Lab for Lumiverse](../preset/lumiverse/lab/README.md).

The same GitHub link installs the SillyTavern extension in SillyTavern and this one in Lumiverse. SillyTavern reads `manifest.json` and Lumiverse reads `spindle.json`.

## Install

1. In Lumiverse, open **Settings → Extensions → Install**, and paste `https://github.com/howardsierra/callboard`. Until this is merged into the default branch, choose the branch `claude/tender-fermat-yfudjd`.
2. Grant the **Presets** permission when asked. The board needs it to read and change the active preset.
3. Pick CALLBOARD (or the Lab) in the Preset panel. Then open **🎧 CALLBOARD** in the side drawer, or press **Ctrl+K** and type "callboard".

## What's in it

- **Now showing:** the current Wing, Mode, Tracker, Model and CoT, at a glance.
- **🎛️ Board:** every Board setting from the preset, laid out on one page:
  - pick-one bands as chips (Mode, Wing, Tracker, Model, CoT, Cue Calls and the rest)
  - sliders for the Lab's schedules
  - a text box for the language
  - **Wing → tracker auto-match:** if a tracker is on and you change the wing, the tracker follows.
- **🧩 Modules:** every block, grouped by section, with an on/off switch, an estimated token cost, and 👁 to read its text. A meter shows where your token budget goes. Dropdown blocks count only the option you picked.
- **📋 Notes:** a checker with one-click fixes. It catches:
  - stackers without their base (College AU off a modern wing, Magic With Laws off a fantastical one)
  - Kimi or MiMo tunings without their model
  - a tracker that doesn't match the wing
  - a tracker or board lit while House Rules is off
  - the Board block switched off
  - Clover without EXTREME Pollinations
  - and the same advisories as the SillyTavern Suite

  The drawer icon shows a badge while there's something to fix.
- **💾 Loadouts:**
  - the **16 starters** (Gilded Age Scandal, Cyberpunk Noir, Jianghu Wanderer and the rest), which only change the modules they name
  - save your current board, apply it, and export or import it as text

  Saved loadouts live in this browser.

## How it works

- Module switches go through Lumiverse's own preset-editor save queue, the same path as clicking them in the Preset panel.
- Board settings are saved to the preset through Lumiverse's preset API, merged with what's already there, and retried if something else saved first. Lumiverse's own editor picks them up, and a native edit afterwards doesn't overwrite them.
- If you haven't opened the Preset panel yet, the board loads the active preset from your settings and still works.
- The presets carry a small `callboard` map in their metadata saying which block is which. That's why the board keeps working after you rename blocks.
- Changes are live: there's no separate "save preset" step.
- If a chat, character or connection has a **preset profile** that pins its own variable values, those win in that chat, as they do in Lumiverse itself.

## Not included (yet)

- **🎨 Studio:** image fine-tuning for EXTREME Pollinations. Images still work, using the preset's built-in key.
- **Clover direct send** and the **Private Scenes** cue: both depend on SillyTavern extensions.
- **Slash commands:** Lumiverse doesn't have SillyTavern-style slash commands. The board opens from the drawer or Ctrl+K.

## For maintainers

`frontend.src.js` is the source. Run `node lumiverse/build.mjs` to write `frontend.js`. It copies the starters, the dependencies and the wing → tracker table out of `src/map.js`, so both extensions share one list.
