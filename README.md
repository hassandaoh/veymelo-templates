# Veymelo templates

Videos made with [Veymelo](https://veymelo.com), kept as code your AI can
start from and make its own.

Each folder is one template: a complete video project that renders as it is.
Your AI copies it into your project and changes what it needs: the words and
footage first, then the colours, type and motion, then anything else.

## Use a template

Download one at [veymelo.com](https://veymelo.com/#templates) and give the
folder to your AI, or tell your AI which template to start from:

```
npx veymelo@latest template list
npx veymelo@latest template use <name>
```

A template can also come from any public GitHub folder
(`github:owner/repo/folder`) or from a folder on your computer.

## What is in a template

```
<name>/
  template.json   its name, what it is for, sizes, length, Veymelo version
  README.md       what to change and what to keep
  poster.jpg      one frame of it
  preview.mp4     a few seconds of it, small, for veymelo.com
  src/            the video's code
  assets/         the fonts, logos and media it uses
  package.json    the packages it uses
```

## Add a template

Make the video with Veymelo, then, in its project:

```
npx veymelo@latest template save <name> --out <this repository>/<name>
```

It adds the poster and a short preview (`--poster 4s`, `--preview 0-12s`), and
updates `templates.json`, the index veymelo.com and `template list` read.
Finish the README it drafts, look at the poster, then commit and push the
folder and the index: it shows on [veymelo.com](https://veymelo.com/#templates)
within a few minutes. After changing files by hand, refresh the index with
`npx veymelo@latest template index .`
