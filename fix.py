import re

with open('src/pages/projects/tabs/PaymentTab.tsx', 'r') as f:
    lines = f.readlines()

out = []
for line in lines:
    match = re.match(r'^\d+:\s(.*)', line)
    if match:
        out.append(match.group(1))
    else:
        out.append(line.rstrip('\n'))

with open('src/pages/projects/tabs/PaymentTab.tsx', 'w') as f:
    f.write('\n'.join(out))
