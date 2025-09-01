<p align="center">
<img src="img/jonah.png" style="max-width:150px; border-radius:150px;"><br>
<em>(This is Jonah. :-) )</em>
</p>

## Codename DARIUS

This is a supplement to [Elementary Galilean Aramaic](http://galileanaramaic.com) and it's currently live at [http://learn.galileanaramaic.com](http://learn.galileanaramaic.com). :-)

A long, long time ago I built a learning system for Aramaic and I called it DARIUS — it had a ridiculous acronym that I have decided to purposefully forget.

However, odd monickers aside, the idea here is the same: Free Galilean Aramaic learning lessons in a format inspired by DuoLingo. 

It's all really lightweight, all of the lessons are in Markdown format. And the code isn't too much of a hot mess.

Peace,  
**Steve Caruso**  
Aug 20 2025 _(updadted Sep 1 2025)_

## Features

- 0️⃣ - Zero dependencies.†
- 🍦 - Vanilla Javascript.
- 📄 - Markdown files for lessons in a simple format.
- ✒️ - Galilean typesetting system.
- 💽 - No accounts. All data is kept in `localStorage`.
- 🎯 - QR code to transfer data between devices.
- ⭐ - Badges for score count (⭐=10, 🥉=25, 🥈=50, 🏅=75, 🕊️=100+).
- 📆 - Daily learning streak.
- ⏰ - Daily reminders you can set and remove.
- 🌙 - Dark mode (based on OS request).
- 🔊 - Audio support.

† = QR Codes are handled by *QR Code Generator* by Dan Jackson, 2020 and is included in `/js`.

## Pages

- `index.html` 
    - The front page of the system. 
    - Reads designated files from `/lessons` to populate the list, 
    - Holds the QR code for transferring data, 
    - Keeps track of the streak, and 
    - Allows the user to set or remove a daily `Notification` reminder.
- `lesson.html`
    - Arguments: `?lesson=[name]&section=[num]` 
    - Runs the selected lesson (found in `/lessons/[name]`) and exercise (`[num]` by index).
- `overview.html`
    - Arguments: `?lesson=[name]&section=[num]` 
    - Can be accessed by clicking the `ⓘ` next to any lesson.
    - Displays an overview of the selected lesson `[name]` and exercise `[num]`. 
    - Shows which audio files are available.

## Lesson Files

Lesson files live in `/lessons` and are all in Markdown, following this format:

> \# Title of Lesson File
>
> \## Title of Unit
>
> \### lesson-type
>
> \- aramaic == english

Lines that do not start with `#` or `-` are comments so you can leave extensive notes (especially useful for rare languages like Galilean).

The supported `lesson-type`s are currently `matching` for single words to single words and `sentences` for sentences that are broken up word-by-word.

If you want to ensure that there is a non-breaking space (i.e. a space that doesn't split a string into multiple words) use an underscore `_`.

For example if you want to encode `You (m.pl.)` so that it doesn't get split into `You` and `(m.pl.)`, you can encode it as `You_(m.pl.)`. This works the same for Aramaic text.

### Aramaic Encoding

Aramaic is written in a modified lower-case Michigan Claremont Encoding. Consonants are encoded as:

`) b g d h w z x + y k l m n s ( p c q r $ & t`

Final forms are upper-case:

`K M N P C`

Vocalization includes the vowels:

`; a E I O U` with narrower versions of *schwa* and *patah* for narrow letters as `: A`.

*Daggesh* and *rafe* are:

`. ]` with higher versions for placement above other markings as `> }`.

## Sound Files

Sound files live in `/sounds` and are assumed to be `.mp3` format.

They will be automatically pulled and played based upon the Galilean transliteration in the lesson, so for example: `$:laM laK` or `$:laM_laK` in a lesson will look for `/sounds/$:laM laK.mp3`.

As of right now, the sound checker will look for the file that shares the *precise* name with the transliteration. However, ***Sometimes*** the same word can be encoded two ways due to slightly different diacritical marks.

For example: Both `laK` and `lAK` work and one may want to use one or the other depending on context.

For now, one can either:

1. Have both a `laK.mp3` and a `lAK.mp3` in the `/sounds` folder; or
2. Check the `overview.html`'s entry for the lesson prior to publication and shore up the transliterations to match sound file names.

## New Features To-Do

- [x] Daily reminder `Notification`.
- [x] Audio support.
- [x] Dark mode.
- [ ] Mute switch for audio.
- [ ] Use of `ServiceWorker` to ensure that notifications always happen regardless of if it's open in a browser tab.