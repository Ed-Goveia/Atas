import re

with open('src/lib/ataParser.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace the horaAberturaExt block
new_block = [
    '\n',
    '  // Extract opening time from presencas.\n',
    '  // Handles both written-out ("quatorze horas") and numeric ("14h", "14:00") patterns.\n',
    '  // Strategy: capture everything between "Às/As" and "do dia" (same as encerramento approach).\n',
    "  let horaAberturaExt = 'XXX';\n",
    "  const matchHoraAbertura = rawPresencas.match(/[\\xC0\\xE0Aa][s]?\\s+(.+?)\\s+do\\s+dia/i);\n",
    '  if (matchHoraAbertura) {\n',
    "    horaAberturaExt = matchHoraAbertura[1].replace(/<[^>]+>/g, '').trim();\n",
    '  }\n',
    '\n',
]

start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if 'Extract opening time' in line:
        start_idx = i
    if start_idx is not None and i > start_idx and line.strip() == '':
        end_idx = i + 1
        break

if start_idx is not None and end_idx is not None:
    print(f'Replacing lines {start_idx+1} to {end_idx}')
    lines = lines[:start_idx] + new_block + lines[end_idx:]
    with open('src/lib/ataParser.ts', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('DONE')
else:
    print(f'Block not found: start={start_idx}, end={end_idx}')
    for i, l in enumerate(lines[104:115], 105):
        print(f'{i}: {repr(l)}')
