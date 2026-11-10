# 🧪 CALLBOARD Lab for Lumiverse

The [CALLBOARD Lab](../../lab/README.md) (v0.11) rebuilt for [Lumiverse](https://github.com/prolix-oc/Lumiverse). It adds extras that only Lumiverse can do, with ideas taken from the KittyLotus preset. It's experimental: expect changes between versions.

- **Current:** `CALLBOARD_Lab_Lumiverse_v0_1.json`
- **Tested** in a local Lumiverse 1.2.5:
  - import, the Board and its settings
  - the assembled prompt
  - every Lab visual on desktop and phone
  - the choice buttons, the skin, and the timed features

## Setup

1. In Lumiverse, go to **Preset** (Loom) → **⋮** → **Import Loom JSON**, then pick the file. The regex arrives in the **CALLBOARD** and **CALLBOARD Lab** folders.
2. Open **Configure Prompt Variables** → **🎛️ The Board**. Keep that block on.
3. Every Lab switch starts **off**. Light one at a time, play a few replies, and compare.

## 🎛️ The Board

The Board has everything from [CALLBOARD for Lumiverse](../README.md), plus:

| Setting | What it does |
|---|---|
| **Mode** | Adds 🧠 **Assistant**: no scene, and Xavi helps you plan. The Lumiverse extras below stay quiet while it's on. |
| **Model** | ✨ **Auto** (the default) reads the model name from your connection and picks the matching tuning: Claude, GLM, MiMo, Kimi, Gemini or ChatGPT. You can still pick one by hand. |
| **Reply length** | Any · Short (150–300 words) · Medium (300–600) · Long (600–1,000) · Epic (1,000–1,800). |
| **Plot twists** | Off · Rare · Regular · Frequent. See 🃏 below. |
| **Xavi's check-in** | A slider: every N replies, Xavi steps out for one short OOC aside. 0 = off. |
| **Thought Cabinet** | A slider: how often 💭 Thought Cabinet runs, when it's on. 1 = every reply (default 3). |
| **Language** | The language the story is written in. Tags and data lines stay in English so the regex still draws them. |
| **Console skin** | ✨ Auto (matches the wing) · Console · Minimal · Parchment · Neon. Changes apply from the next reply. |

## 🧪 Lab — Lumiverse extras

A section of its own in the block list:

| Block | What happens |
|---|---|
| 🃏 **Plot Twists** | Lumiverse rolls a real d20 every reply. On a hit (5% Rare, 15% Regular, 25% Frequent), one twist from Xavi's list lands in the story: an unexpected arrival, a secret out early, a snag in the plan, a debt called in, and so on. It happens to the world, never to your choices. |
| 📣 **Xavi's Check-in** | On the Board's schedule, Xavi adds one short `(OOC: … — X)` aside: a reaction, or a question about where you want the story to go. |
| 🧭 **Choices** (off by default) | Each reply ends with two to four options drawn as buttons. Tap one and it's sent as your next message. Buttons only work on the newest reply. Old choice lists are dropped from the prompt. |
| 🔁 **Fresh Take** | Only sent when you **regenerate or swipe**: keep what happened, but find a new angle, opening and dialogue. |
| 📏 **Reply Length**, 🌐 **Language** | Follow the Board. With the defaults, they add nothing to the prompt. |

## What's different from the SillyTavern Lab

- **Everything draws in Lumiverse.** Lumiverse isolates styled HTML, so the Lab wraps any reply that uses its visuals (Board Console, effects, letters, cabinet, Xavi's drawers, choices) in one message-wide island, and the stylesheets reach the whole reply.
- **Skins come from the Board**, not the extension's settings. The Board saves the choice to the chat each time a reply is generated, and the reply reads it from there.
- **Older consoles and curtains fold** by message depth. The extension's "fold when a new message arrives" isn't there.
- **Not included:** 📸 Stills Department and 🤫 Private Scenes, which need SillyTavern extensions.
- **Slots A–D** are here and empty, waiting for your rewrites.

## Credits

The Lumiverse extras borrow ideas from **KittyLotus** (from the Illarin library):
- dice-and-threshold rolls
- schedules based on message count
- reading the model name to adapt
- regex choice buttons
- regenerate-only prompts

None of KittyLotus's text is used; the prompts are written for CALLBOARD. Credits for the Lab's own sources (Sola, Sun Rider, Deus Ex Machina, Princess Honey, LeForkoQuantum, microcot by Stray, Moirai Clause) are in the [Lab README](../../lab/README.md#sources-and-thanks).
