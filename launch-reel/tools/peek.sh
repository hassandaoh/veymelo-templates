#!/bin/sh
# tools/peek.sh <id> <seconds> <count>: look at one result alone at its own size
id="$1"; dur="${2:-3s}"; n="${3:-4}"
size=$(node -e "const a={'16:9':'1920x1080','9:16':'1080x1920','1:1':'1080x1080'};const s=require('fs').readFileSync('src/elements/results/registry.ts','utf8');const m=s.match(new RegExp('\\\\b'+process.argv[1]+\": \\\\{[^}]*aspect: '([^']+)'\"));console.log(a[m[1]])" "$id")
printf "/** tools/peek.sh writes one result id here to look at it alone; empty shows the gallery. */\nexport const PEEK: string = '%s';\n" "$id" > src/elements/results/peek.ts
npx -y veymelo@latest look results --duration "$dur" --count "$n" --size "$size" --out "renders/peek-$id.png" >/dev/null 2>&1
printf "/** tools/peek.sh writes one result id here to look at it alone; empty shows the gallery. */\nexport const PEEK: string = '';\n" > src/elements/results/peek.ts
echo "renders/peek-$id.png ($size)"
