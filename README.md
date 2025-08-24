## Codename DARIUS

Will be published shortly over at [http://learn.galileanaramaic.com](http://learn.galileanaramaic.com).

A long, long time ago I built a learning system for Aramaic and I called it DARIUS — it had a ridiculous acronym. I'm not going to carry it over here.

However, the idea here is the same. Free Galilean Aramaic learning lessons in a format inspired by DuoLingo. 

It's all really lightweight, all of the lessons are in Markdown format. And the code is a bit of a hot mess.

Peace,  
**Steve Caruso**  
Aug 20 2025

## Features

- Markdown files for lessons in a simple format.
- Badges for score count (⭐=10, 🥉=25, 🥈=50, 🏅=75, 🕊️=100+).

## Lesson Files

Lesson files are all in Markdown and follow this format:

> \# Title of Lesson File
>
> \## Title of Unit
>
> \### lesson-type
>
> \- aramaic == english

The supported `lesson-type`s are currently `matching` for single words to single words and `sentences` for sentences that are broken up word-by-word.

If you want to ensure that there is a space that's not split across words, use an underscore `_`.

For example if you want to encode `You (m.pl.)` so that it stays as `You (m.pl.)` and doesn't get split into `You` and `(m.pl.)`, you can encode it as `You_(m.pl.)`. Works the same for Aramaic text.

### Aramaic Encoding

Aramaic is written in a modified lower-case Michigan Claremont Encoding. Consonants are encoded as:

`) b g d h w z x + y k l m n s ( p c q r $ & t`

Final forms are upper-case:

`K M N P C`

Vocalization includes the vowels:

`; a E I O U` with narrower versions of *schwa* and *patah* for narrow letters as `: A`.

*Daggesh* and *rafe* are:

`. ]` with higher versions for placement above other markings as `> }`.