# 🧪 CALLBOARD Lab

An experimental copy of CALLBOARD for trying ideas before they reach the real preset. Expect things to change, break, or disappear between versions.

- **Current:** `CALLBOARD_Lab_v0_4.json`, built on CALLBOARD v1.6.7 (Full). Everything in v1.6.7 is here and works the same.
- **The stable presets** in `preset/` are never changed by Lab work. What proves itself here gets moved over deliberately.
- Older Lab versions will be kept in `preset/lab/archive/`.

## How to test

1. Import `CALLBOARD_Lab_v0_4.json` like any preset. It shows up as its own preset, so your normal CALLBOARD stays as it is.
2. Set it up as you would CALLBOARD (wing, tracker, model layer…).
3. In the CALLBOARD Suite board, open **🧪 Lab**. Everything there is **off**.
4. Light **one** switch, play a few replies, and compare. Then keep it, turn it off, or try the next.

## Switches

All of them sit in the 🧪 LAB section of the prompt list, right after the prose charter, except the MiMo one, which sits with the model layers.

| Switch | What it does | Try it if… | Idea from |
|---|---|---|---|
| 🎙️ POV Fusion | Narration passes through the POV character's head: her mood and words, scenery only when it touches her | narration feels detached or robotic (Kimi K3) | Princess Honey |
| 🤖 Anti-Robot | Opinionated, everyday narration and dialogue; nobody analyses the situation like a report | narration or characters read cold and calculating | LeForkoQuantum |
| 1️⃣ Say It Once | No restating or recapping what's already clear | replies explain things twice or sum up how everyone feels | Sun Rider |
| 〰️ Flowing Actions | Related actions joined into one sentence; short sentences saved for emphasis | prose feels choppy ("He stopped. He looked. He walked.") | Sola |
| 🛋️ Bad at Comfort | People react to heavy moments like flawed people, not therapists | characters sound like counselors | Sola |
| 🔦 Spotlight | One or two NPCs speak per reply; NPCs arrive only with a reason | crowded scenes where everyone talks | Sola |
| 🪒 Plain Speech | Casual talk in plain everyday words | dialogue sounds like jargon or a thesaurus | Sola |
| 🚪 Fresh Openers | Each reply opens differently from the last | every reply starts the same way | Sola |
| 🎵 Voice Under Pressure | Anger, fear, grief, exhaustion, desire and lying bend how people talk | everyone sounds composed no matter what | Sun Rider |
| 👁️ Thoughts, Rationed | At most one or two italic thoughts, never recaps | italic thoughts pile up or repeat the scene | Sun Rider |
| 🪞 Fresh Traits | Known looks, traits and facts only come up when they matter, in fresh words | "her green eyes" and "his signature smirk" every reply (Kimi K3 recall) | microcot |
| 💍 No Fidgeting | Rings, scars, jewelry and pockets aren't fiddled with to show feeling | characters keep twisting rings or tracing scars | microcot |
| 🔁 No Echo | Your words and actions aren't quoted or recapped back at you | replies parrot what you just wrote | microcot |
| ✅ Say What Happens | No "he didn't answer / nobody moved"; narrate what does happen | narration is full of things not happening | microcot |
| 🔍 Hidden Layers | Tap-to-reveal extras inside the prose: unspoken thoughts, body tells, lore notes, translations, swallowed words | you want subtext you can peek at | Sola |
| ⚡ Kinetic Type | A few words per reply that slam, shake, glitch, pulse, glow or drift | you want sound and impact on the page | Sola |
| 📳 Push Notifications | Phone alerts drawn as a notification card | phones buzz a lot in your story | Sola |
| 🃏 MiMo 2.6 — Clean Handoff | Planning stays out of the visible reply; CALLBOARD's output order is kept | you run MiMo 2.6 and planning leaks into replies. Needs ⚙️ Model — MiMo | Sun Rider |

Some overlap on purpose, so they can be compared: POV Fusion, Anti-Robot, Say It Once, Fresh Traits and the Kimi switches (🧠 Remember, Don't Recite; 🎙️ Narration With a Pulse) all go after flat narration from different angles. Test them separately before stacking.

## On-screen effects

🔍 Hidden Layers, ⚡ Kinetic Type and 📳 Push Notifications come with regex that draws them, built into the Lab preset. The switches teach the model the tags; the regex is always ready, so tags you type yourself work too.

| You or the model write | You see |
|---|---|
| `<subtext thought="If he finds the letter, I'm finished.">"Everything's fine," she said.</subtext>` | the line, dotted-underlined; tap it for a ☁ *Unspoken* card |
| `<tell note="Pulse jumping at his jaw">smoothed his collar</tell>` | tap for a ✋ *Tell* card |
| `<lore entry="Salt marshes abandoned after the flood.">the Sallow Reach</lore>` | tap for a 📜 *Lore* card |
| `<translate meaning="Peace in the shadow">"Pax sub umbra"</translate>` | tap for a 🗣 *Meaning* card |
| `<retract>I missed you.</retract>` | blurred words that sharpen when tapped |
| `<heavy>`, `<stretch>`, `<tilt>`, `<crush>`, `<fracture>`, `<echo>`, `<shake>`, `<glitch>`, `<pulse>`, `<ember>`, `<drift>` | bold, spaced, tilted, squeezed, skewed, faded, shaking, glitching, beating, glowing, floating words |
| `<notification app="Messages" from="Jun" time="9:41 PM">don't open the door</notification>` | a phone notification card |

Cards open in place, so they work the same on a phone. Animations stop if your device is set to reduce motion.

## Context savers

Three prompt-only regex scripts in the Lab preset shrink what's sent to the model, without changing your chat:

- **Old tracker and board cards:** `<cb_state>` blocks older than the last few messages are left out. The newest ones stay, so numbers like affinity carry on correctly.
- **Old cue legends:** older Xavi cue lines keep their name and reason but drop the long explanation. The newest cue keeps it, so the model still knows what it has already explained.
- **Old HTML styles:** `<style>` blocks in older messages are left out. The artifacts' text stays.

They're on by default. Turn any of them off under **Extensions → Regex → Preset scripts** (look for **CB LAB · Context saver**). CALLBOARD already collapses old chat panels the same way.

## 🧪 Slots A–D: your own rewrites

Four empty prompts, off by default, for rewriting other presets' jailbreaks and prefills into writing instructions. Each sits where that kind of prompt normally goes:

| Slot | Role | Where in the prompt | Fits rewrites of |
|---|---|---|---|
| **A — Opening statement** | system | top, right after the Read Me | Deus Ex Machina's `\| Content Policy \|`, Princess Honey's `👑\| Kingdom`, LeForkoQuantum's `Core Directive`, Sola's `Optional JB`, microcot's `Main Co-writer Var` / `Main Guidelines Var` |
| **B — Narrator's vow** | assistant | top, right after Slot A | Deus Ex Machina's `\| Phi's Vow \|` (the narrator speaking in its own voice) |
| **C — Closing note** | system | right after Chat History, before the prose charter | Deus Ex Machina's `! Hard Jailbreak !`, Sola's `Policy Scan`, Princess Honey's `💉\| Pos Smasher`, microcot's `⑱ Structured Prefill` |
| **D — Prefill** | assistant | the very end, after 📌 Callboard Notice | Sun Rider's `🧟 DANGEROUS ZOMBIE GASHAT`, Princess Honey's "GMbot" prefill and `👑\|Prefill`, LeForkoQuantum's `Claude Variable Prefil`, microcot's `⑱ Prefill Part 1/2`, `⑱ Prefill Pre-train` and `㉑ NSFW 21 On / Prefill` |

Fill one, light it, and test it like any other Lab switch.

- **Slot D (prefill)** makes the prompt end on an assistant message, which the model then continues. Claude handles that well. Some other models and providers ignore it or answer oddly, so test it on your model.
- SillyTavern also has a preset-wide **Assistant Prefill** box (AI Response Configuration, shown for Claude). Princess Honey uses it for its "GMbot" line. The Lab leaves it empty.
- **📌 Callboard Notice** (the user-role slot at the very end, from CALLBOARD itself) is still there for your own note.

## Model settings worth trying

From Deus Ex Machina V3's model notes (these are connection settings, not prompts):

- **Kimi K3:** temperature 1.0, Top P 0.95, reasoning on at **low** effort.
- **GLM 5.3:** temperature 0.75, Top P 0.95, prompt post-processing "merge consecutive roles", reasoning on at low effort.

## Ideas for later versions

- microcot's **Character Secrets**: hidden motives written inside `<…>` and hidden from view by a regex. Could pair with Private Scenes.

- A self-check that lists only the lit switches, like Sola's Story Review, built into 🔔 The Last Check.
- A visible scene plan before each reply, and an open-threads footer (Deus Ex Machina V3). These overlap the CoT, 🗝️ Promise Shelf and Private Scenes, so they'd replace something rather than stack.
- Switches that adjust each other with SillyTavern 1.19's `{{#if}}` macros, for example the Kimi switches softening 🧵 Memory Like Glue automatically. Needs SillyTavern 1.19 or later.

## Sources and thanks

The Lab's switches are rewritten in CALLBOARD's own voice from ideas in these presets. All are fine to reuse and edit; Sola V4 Flame and Deus Ex Machina V3 are open practice presets from a creators' Discord.

- **Princess Honey v2.5:** POV Fusion (from "Princess Style"). Princess Honey also credits Sel, monogatar1 and Knottydog for some of its prompts.
- **LeForkoQuantum** by u/Leafcanfly, with pieces by Quantum and others: Anti-Robot.
- **Sola V4 Flame:** Flowing Actions (Anti-Staccato), Bad at Comfort (Anti-Therapy Speech), Spotlight (Anti-Orbiting), Plain Speech (Occam's Razor), Fresh Openers (Story Rhythm); Hidden Layers (Interactive Mechanics), Kinetic Type (Kinetic Tonal Emphasis) and Push Notifications, with their regex rebuilt for CALLBOARD; the context-saver idea, shared with Sun Rider and Deus Ex Machina.
- **Sun Rider v1.1:** Say It Once (from its anti-slop module), Voice Under Pressure (Onkaku), Thoughts, Rationed (Ghost Eyecon), MiMo 2.6 Clean Handoff (Final Vent).
- **Deus Ex Machina V3:** model settings notes.
- **microcot** by aimicrocot ([github.com/aimicrocot/microcot-preset](https://github.com/aimicrocot/microcot-preset)): Fresh Traits and No Fidgeting (from its Gemini/GLM/Kimi version), No Echo, Say What Happens (from "No Negatives"). microcot in turn credits Boringdommer, rarestmeow, Celia (Leafcanfly) and blader's Humanizer. Its repository has no license file, so only ideas are reused here, in CALLBOARD's own words.
