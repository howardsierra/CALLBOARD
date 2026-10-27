# 🎧 CALLBOARD

A modular SillyTavern roleplay preset, plus **CALLBOARD Suite**, an extension that gives the preset a stage manager's control board. Your host is Xavi, the stage manager: he runs the show from the wings, calls the cues and stays out of the story.

```
preset/CALLBOARD_v1_5_0.json        ← the full preset (prompts + all of its regex)
preset/CALLBOARD_Lite_v1_5_0.json   ← the Lite preset: same show, ~2.9k tokens instead of ~13.7k
index.js · style.css · src/         ← the CALLBOARD Suite extension
```

## Full or Lite?

| | Full | Lite |
|---|---|---|
| Prompt tokens with the default toggles | ~13.7k | **~2.9k** |
| Core charters + prose rules | 15 separate prompts | merged into 🫀 The Charter + ✒️ Prose That Hits |
| Wings (all 14 + stackers) | ✓ | ✓ full strength |
| Trackers, boards, chat panels, press, Y2K Comms | ✓ on by default: Twitch, Discord, X, Reddit, Press | ✓ same formats, shorter explanations, off until you want them |
| 📣 Cue Calls · 🎟️ The Program | ✓ Everything / Visuals only | ✓ one compact Lite tier |
| CoT | Dramatic · Wholesome · Fantasy | one Lite CoT (≤120 words) |
| Xavi's Patter & Mood, Pop/Rock flavors | ✓ | his flirty default only |
| Hand-written HTML/JS visuals, EXTREME images, echoes | ✓ | — |

Lite is for cheaper models, small context windows, or long chats where every message counts. Both presets carry the same regex, and the extension works with either one.

## Setup

1. **Import a preset.** In SillyTavern, choose a Chat Completion API. Then import `preset/CALLBOARD_v1_5_0.json` (or the Lite one) from the preset dropdown (**AI Response Configuration → Import preset**).
2. **Allow its regex.** Every card, chat panel, STANDBY slip and the Program is drawn by regex that ships inside the preset. You don't import a separate bundle. SillyTavern ignores a preset's regex until you allow it, so say yes when it asks. You can also allow it under **Extensions → Regex → Preset scripts**. If you skip this step, the chat shows raw lines like `T>` and `CUE>` instead of cards.
3. **Install the extension (optional, recommended).** Go to **Extensions → Install extension**, paste `https://github.com/howardsierra/callboard`, then open the board from the wand menu or with `/cb`. If you skipped step 2, the extension's Notes tab catches it and allows the regex in one click.

## Dressing the stage

| Choose | Options |
|---|---|
| **Mode** (one) | 🎭 Impersonate: Xavi writes your character too; `[MANUAL: ON]` / `[MANUAL: OFF]` pauses and resumes it · 🖊️ Story Mode: you write your character |
| **Wing** (one) | 📱 Modern · 📟 Y2K · 🥂 Roaring Twenties · 🎩 Victorian / Gilded Age · 🎀 Regency · ⚔️ Westeros · 🏰 Medieval · 🐉 Fantasy · 🏯 Wuxia / Xianxia · 🌃 Urban Fantasy · 👻 Paranormal · 🚀 Sci-Fi / Space Opera · 🌆 Cyberpunk · ☢️ Post-Apocalyptic |
| **Stackers** | 🎓 College AU (on Modern or Y2K) · 🔮 Magic With Laws (on Fantasy, Urban, Paranormal or Wuxia) · 🐺 Omegaverse (on anything) |
| **Tracker** (matches the wing) | **Modern:** Modern, College, Y2K, Twenties, Urban, Paranormal, Sci-Fi, Cyberpunk, Post-Apocalyptic · **Period:** Westeros, Medieval, Fantasy, Wuxia · **Regency:** Regency, Victorian |
| **Model layer** (one or none) | Claude · GLM · MiMo · Kimi · Gemini · ChatGPT |
| **CoT** (one or none) | Dramatic · Wholesome · Fantasy |

Everything else is optional: boards, story systems, spotlight and fame, chat panels, visuals and content modules.

## 📸 Stills Department (images with Revamped Image Gen)

An image module built on the **[Revamped Image Gen](https://github.com/howardsierra/revampedimagegen)** extension: real reference photos, Nano Banana / GPT Image and other providers, a queue, a gallery, and a full-screen viewer. Install that extension, then light **📸 Stills Department** (it's a pick-one with the EXTREME Pollinations loader).

- **The extension owns the mechanics.** Its injected "[Image generation is available.]" block supplies the tag format, the per-reply limit, the names that have reference photos, and your example prompts; the Stills Department tells the model to follow it exactly (with the default tag format as a fallback if you turn those instructions off).
- **CALLBOARD adds the direction:**
  - when to shoot (reveals, entrances, outfits, performances, peaks, aftermaths, or whenever you ask)
  - first names for everyone in frame, so reference photos match
  - continuity: current outfits, hair, injuries, time and weather
  - a default style for each of the 14 wings (period oil portrait for Regency, xianxia key art for Wuxia, neon noir for Cyberpunk, glossy concept photos with K-pop Idol…)
  - aspect ratios by shot type
  - in-story photos (Instagram, private photos, photocards) generated as the actual photo, right after their panel
  - a 🖼️ cue slip before each image when Cue Calls is lit
- The extension's Notes tab flags it if Revamped Image Gen isn't installed or enabled, or if its AI instructions are off.

## New in v1.5: apps

Five new regex-drawn panels for modern wings, all off until you switch them on, in both Full and Lite:

| Panel | Tag · prefix | What you see |
|---|---|---|
| 💘 Dating App | `[[DATING]]` · `DT>` | Profile with photos, prompt answers and detail chips, an "It's a Match!" banner, and the first chat |
| 🌐 Web Browser | `[[BROWSER]]` / `[[INCOGNITO]]` · `BR>` | Tabs and address bar, searches with revealing autocomplete, results, an open page, and **browsing history**; a dark window for incognito |
| 📸 Instagram | `[[INSTA]]` · `IG>` | Profile header, feed posts (carousel, likes, caption, comments) and stories |
| 🔒 Private Photos | `[[PRIVATE]]` · `PX>` | A private thread between partners: photos are frosted tiles you **tap to reveal**, with view-once/replay and "took a screenshot!" alerts |
| 💎 Creator Page | `[[CREATOR]]` · `CR>` | A subscription page: free posts, 🔒 locked posts you can tap to peek, tips, fan DMs, pay-per-view messages and an earnings line |
| 🫧 Fan Platform | `[[BUBBLE]]` / `[[LIVE]]` · `FP>` | An idol's paid fan chat (selfies, voice memos with transcript, a D+ subscription counter, your private replies) or a fan livestream (● LIVE header, captions of what they say, scrolling chat, heart and gift alerts). Pairs with 🫰 K-pop Idol |

Everyone in a dating profile, private photo or creator page is an adult. Each prompt states which eras it fits: Y2K gets desktop dating sites, IE and grainy picture messages, and none of these appear in period wings. Cue Calls explain each panel the first time it shows up. The extension has a matching 📲 Extremely Online starter.

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
- **🎨 Studio (Pollinations images):** fine-tune every image the EXTREME tier draws.
  - **Key:** the Studio uses the Pollinations key in your image regex if it has one. A key pasted into the Studio overrides it, and is saved only in your SillyTavern settings on your device.
  - **Camera:** model (Z-Image Turbo, FLUX, Kontext, Gemini, GPT-Image, Seedream, Ideogram, Qwen, or any id), true aspect ratios at S/M/L size, seeds (stable per image so re-renders don't cost Pollen again, one fixed seed for a consistent look, or random), quality levels where the model has them, and the optional safety filter.
  - **Look:** style presets (cinematic, candid photo, anime, manhwa, oil, watercolor, K-drama poster, Y2K digicam, dark fantasy), plus "always add" and "avoid" text.
  - **Lookbook:** save each character's appearance (and an optional reference image URL). Whenever a prompt names them, their look is woven in so faces stay consistent.
  - **On every image in chat:** 🎲 reroll, ✏️ fine-tune that one image in the Studio, ⤢ view large, 📋 copy the final prompt.
  - Respects SillyTavern's **Forbid External Media** setting: blocked images stay as a description card and nothing is requested.
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
