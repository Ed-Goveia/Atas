import re

rawPresencas = "Às quatorze horas e cinquenta e seis minutos do dia cinco de maio de dois mil e vinte e seis, reuniu-se a Comissão..."

# My regex from fix_regex.py
matchHoraAbertura = re.search(r'[\xC0\xE0Aa][s]?\s+(.+?)\s+do\s+dia', rawPresencas, re.IGNORECASE)

if matchHoraAbertura:
    horaAberturaExt = matchHoraAbertura.group(1).strip()
    print(f"Captured: '{horaAberturaExt}'")
    
    # Try replacing in text
    tplPresencas = rawPresencas.replace(horaAberturaExt, '{{horarioAbertura}}')
    print(f"Result: {tplPresencas}")
else:
    print("No match")
