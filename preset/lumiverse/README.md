# 🎧 CALLBOARD for Lumiverse

CALLBOARD rebuilt as a native [Lumiverse](https://github.com/prolix-oc/Lumiverse) preset. It has the same Xavi, the same wings, trackers, boards, chat panels and press, and the same regex. Lumiverse handles the parts that the CALLBOARD Suite extension handles in SillyTavern.

- **Current:** `CALLBOARD_Lumiverse_v1_0.json`, built from CALLBOARD v1.6.8 (Full).
- **Tested** in a local Lumiverse 1.2.5: import, the Board dropdowns, the assembled prompt, and how replies render on desktop and phone.

## Setup

1. In Lumiverse, open **Preset** (Loom) → **⋮** → **Import Loom JSON**, and pick `CALLBOARD_Lumiverse_v1_0.json`. The 180 regex scripts come with it, in a **CALLBOARD** folder. There's nothing to allow.
2. Click **Configure Prompt Variables** above the block list and open **🎛️ The Board**.
3. Set your loadout, then **Save**.

## 🎛️ The Board

All of CALLBOARD's pick-one choices are dropdowns in one place, so two wings or two CoTs can never be lit at once:

| Dropdown | Choices |
|---|---|
| Mode | 🎭 Impersonate · 🖊️ Story Mode |
| Wing | 📱 Modern · 📟 Y2K · 🥂 Roaring Twenties · 🎩 Victorian · 🎀 Regency · ⚔️ Westeros · 🏰 Medieval · 🐉 Fantasy · 🏯 Wuxia · 🌃 Urban Fantasy · 👻 Paranormal · 🚀 Sci-Fi · 🌆 Cyberpunk · ☢️ Post-Apocalyptic |
| Tracker | Modern · Period · Regency + Reputation · Off |
| Model | Claude · GLM · MiMo · Kimi · Gemini · ChatGPT · None |
| CoT | Dramatic · Wholesome · Fantasy · None |
| Cue calls | Everything · Visuals only · Off |
| Pacing | Chapter · Balanced · Propulsive · Off |
| Difficulty | Charmed · Fair · Merciless · Off |
| Reader knows | Less (mystery) · More (dramatic irony) · Off |
| Sensory | Vivid · Amplified · Off |
| Xavi's Patter | Chatty · Dry · Silent · Default |
| Xavi's Mood | Flirty · Savage · All Business · Default |
| Curtain | None · One Line · Director's Notes · Talkback |

Keep **🎛️ The Board** block switched on. If it's off, every band goes quiet.

**💜 Twitch Chat** has its own dropdown on its own block, with the other chat panels. The freeform version is sent as a user-role task and the regex panel as a system rule, and the dropdown switches the block's role to match.

Everything else is an on/off block in the list, grouped the way the CALLBOARD board groups it:
- 🎧 The Stage Manager
- 🗝️ Core
- 📚 Story Context
- ✒️ Prose Charter
- 🏛️ Setting (College AU, Magic With Laws and Omegaverse stack on the wing)
- ⚙️ Story Systems
- 🌟 Spotlight
- 🔥 Content
- 🖼️ Visuals, HTML & Chat Panels
- 🎛️ Trackers & Boards
- 🌐 EXTREME Images
- 🧭 Utilities
- ⚙️ Model & CoT (the Kimi K3 tunings sit under the Model dropdown)

## What's different from SillyTavern

- **No extension needed.** The Board replaces the CALLBOARD Suite's board. Its warnings don't come along, so mind the pairings yourself: the Kimi K3 tunings need Model → Kimi, College AU needs a modern wing, Magic With Laws a fantastical one, and the Fame flavors need the Fame Engine.
- **The CoT shows in Lumiverse's own "Thinking" foldout.** Lumiverse pulls `<think>` out of the reply itself.
- **Not included:** 📸 Stills Department and 🤫 Private Scenes, which need SillyTavern extensions (Revamped Image Gen and Private Scenes). 🌐 EXTREME Pollinations draws images instead, with the preset's built-in key, and 🍀 Clover OOC orders go through it.
- **Lab:** the CALLBOARD Lab has its own Lumiverse build, with extras like real dice, model auto-detect and choice buttons. See [lab/](lab/README.md).
- **Same formats:** the data lines and regex output match v1.6.8, so the cards and panels look the same in both apps.

## Updates

The Lumiverse version is built from the SillyTavern preset, so future CALLBOARD fixes carry over to it. Block ids stay the same between versions, so your Board choices survive an update.
