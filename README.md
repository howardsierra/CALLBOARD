# 🎧 CALLBOARD

A modular SillyTavern roleplay preset, plus **CALLBOARD Suite**, an extension that gives the preset a stage manager's control board. Your host is Xavi, the stage manager: he runs the show from the wings, calls the cues and stays out of the story.

```
preset/CALLBOARD_v1_6_4.json        ← the full preset (prompts + all of its regex)
preset/CALLBOARD_Lite_v1_6_4.json   ← the Lite preset: same show, ~3k tokens instead of ~14.2k
preset/archive/                     ← every earlier version (v1.3.0.1 original, v1.4.0, v1.5.0, v1.6.0, v1.6.1, v1.6.2)
index.js · style.css · src/         ← the CALLBOARD Suite extension
```

## Full or Lite?

| | Full | Lite |
|---|---|---|
| Prompt tokens with the default toggles | ~14.2k | **~3k** |
| Core charters + prose rules | 15 separate prompts | merged into 🫀 The Charter + ✒️ Prose That Hits |
| Wings (all 14 + stackers) | ✓ | ✓ full strength |
| Trackers, boards, chat panels, press, Y2K Comms | ✓ on by default: Twitch, Discord, X, Reddit, Press | ✓ same formats, shorter explanations, off until you want them |
| 📣 Cue Calls · 🎟️ The Program | ✓ Everything / Visuals only | ✓ one compact Lite tier |
| CoT | Dramatic · Wholesome · Fantasy | one Lite CoT (≤120 words) |
| Xavi's Patter & Mood, Pop/Rock flavors | ✓ | his flirty default only |
| Hand-written HTML/JS visuals, EXTREME images, echoes | ✓ | — |

Lite is for cheaper models, small context windows, or long chats where every message counts. Both presets carry the same regex, and the extension works with either one.

## Setup

1. **Import a preset.** In SillyTavern, choose a Chat Completion API. Then import `preset/CALLBOARD_v1_6_4.json` (or the Lite one) from the preset dropdown (**AI Response Configuration → Import preset**).
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

## New in v1.6

**v1.6.4:**
- **🍀 Clover orders are drawn by Revamped Image Gen itself** (version 1.1 or later). The order becomes an image tag in your message, so you get its placeholder, Cancel, retries and Edit, and the image still lands if you switch chats while it develops. With an older Revamped Image Gen, CALLBOARD draws it the v1.6.3 way.
- **Mix your own image formats freely.** You can turn on **Process image tags in my messages** in Revamped Image Gen (Settings → Behaviour) and use `[IMG: …]`, `<image>…</image>` or full image tags in your own messages too. If its **Clover `<ooc>`** capture rule is also on, Revamped Image Gen draws `Image generation:` orders and CALLBOARD steps aside, so every order is still drawn exactly once.
- **Restyles use the right photo:** a Restyle order that names nobody asks Revamped Image Gen for the character's reference photo.

**v1.6.3:**
- **🍀 Clover orders go straight to Revamped Image Gen.** With CALLBOARD Suite and Revamped Image Gen installed, a pasted Clover order is sent to the image generator the moment you send your message: Clover's own text, minus the `<ooc>` wrapper, the `Image generation:` command and `--ar` (which becomes the aspect ratio). The image appears under your message, and the chat model is told it's already drawn, so you get exactly one image per order.

**v1.6.2:**
- **🍀 Clover OOC:** paste prompts from the [Clover OOC](https://github.com/aceeenvw/clover-ooc) library (by **aceenvw**) straight into the chat, and they become images. See [Clover OOC prompts](#-clover-ooc-prompts) below.

**v1.6.1:**
- **🖥️ Pure HTML** now uses photos: with the 📸 Stills Department on, image tags go wherever a real photo would be (inside a text thread, a feed post, a corkboard, a police file) or between artifacts.
- **More artifacts per reply:** usually 3–6, up to 8 on busy beats (was 1–4).
- **Raise the photo limit** in Revamped Image Gen: set **Max images per reply** in its Settings → AI instructions. CALLBOARD's Notes tab reminds you when it's low.

**v1.6.0:**
- **📸 Stills Department:** images through the Revamped Image Gen extension, with reference photos (below). It's a pick-one with the EXTREME Pollinations loader.
- **🫰 K-pop Idol** flavor for the Fame Engine, and the **🫧 Fan Platform** panel (an idol's paid chat and livestreams).
- **🖥️ Pure HTML** mode: every reply told through in-world objects, with no prose.
- **⚙️ Gemini** and **⚙️ ChatGPT** model layers.
- **📌 Callboard Notice:** an empty user-role slot at the very end of the prompt, for your own text. Post-History Instructions sits in its standard spot after Chat History.
- **HTML modules:** a layout rule so phones and documents can't squash into a sliver. Length limits are loosened, so a long thread, feed or document can run in full when it *is* the scene.
- **Sturdier panels:**
  - a stray trailing `|` no longer breaks a line, in any panel
  - optional last fields can be left out
  - Instagram usernames drop a stray `@`

## 🍀 Clover OOC prompts

[Clover OOC](https://github.com/aceeenvw/clover-ooc) by **aceenvw** is a library of image-generation prompts for roleplay: a catalogue of directed shots, scenes, restyles, poses, outfits, hair, makeup, wardrobe pieces, camera terms and effects. Its prompts are `<ooc>Image generation: …</ooc>` blocks you paste into the chat, and its guide says your preset must teach the model to treat those blocks as image orders. **🍀 Clover OOC** does that.

1. Light an image engine (**📸 Stills Department** with Revamped Image Gen, or EXTREME Pollinations) and **🍀 Clover OOC**.
2. Copy a Clover prompt **unchanged**, including the `<ooc>` tags, and send it on its own or at the end of your message.
   - **With CALLBOARD Suite + Revamped Image Gen installed** (the default): the order goes **straight to Revamped Image Gen** as you send it. Its placeholder shows while the image develops (Cancel and retry work as usual), and the finished image appears under your message, even if you've switched chats meanwhile. The chat model sees that it was sent and doesn't draw it again: a block sent on its own gets at most a line from Xavi, and an appended block lets the story continue. If the direct send fails, the chat model draws it instead. To turn direct sending off, untick it in Extensions → CALLBOARD Suite.
   - **Without them:** the chat model fills the order itself, as described below.
   - **On its own:** the reply is just the image.
   - **Appended to an in-character message:** the story continues, and the image lands at the beat it shows.

How each kind of Clover entry is used:
- **Catalogue briefs** ("think like a director…") are applied to the **current moment** of your story.
- **`SCENE:`** prompts are staged with your characters cast by first name instead of "a figure".
- **Fragments** (`pose:`, `clothes:`, `hairstyle:`, `makeup:`, effects, camera) are kept word for word and assigned to named characters. `clothes:` dresses them for that image only.
- **`--ar X:Y`** sets the aspect ratio.
- **Sent straight to Revamped Image Gen,** the prompt is Clover's text exactly as written, so its reference photos only kick in for names that appear in it. Add a name inside the block (for example a first line `Ciara:`) when you want her reference used. A Restyle that names nobody gets the character's photo automatically.
- **Using other image formats in your own messages too?** Turn on **Process image tags in my messages** in Revamped Image Gen. Either extension may then draw a Clover order, never both: with Revamped Image Gen's **Clover `<ooc>`** capture rule on, it takes the `Image generation:` orders and CALLBOARD handles the rest.
- **Restyle** prompts transform a named character's **reference photo**. Revamped Image Gen sends the photos in its Refs tab, not images attached to a chat message, so name the character ("Ciara") and make sure she has a reference.

Characters never react to the order, and it's never quoted back. Clover's prompts belong to aceenvw: see their [license](https://github.com/aceeenvw/clover-ooc#-license). CALLBOARD only teaches your model to read them.

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
