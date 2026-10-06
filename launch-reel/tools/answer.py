#!/usr/bin/env python3
"""tools/answer.py <notebook.md> <answer> [<answer> ...]: fill the empty → lines in order, then print `veymelo next`."""
import sys, subprocess
p, answers = sys.argv[1], sys.argv[2:]
lines = open(p).read().split('\n')
for i, l in enumerate(lines):
    if l.strip() == '→' and answers:
        lines[i] = l.rstrip() + ' ' + answers.pop(0)
open(p, 'w').write('\n'.join(lines))
print(subprocess.run(['npx', '-y', 'veymelo@latest', 'next'], capture_output=True, text=True).stdout)
