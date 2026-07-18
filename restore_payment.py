import json

log_path = "/Users/nanangmrk/.gemini/antigravity-ide/brain/32273857-15f8-4350-92ee-d317f0447e82/.system_generated/logs/transcript_full.jsonl"
with open(log_path, 'r') as f:
    lines = f.readlines()

output = ""
for line in reversed(lines):
    data = json.loads(line)
    if data.get('type') == 'TOOL_RESPONSE' and 'PaymentTab.tsx' in data.get('content', ''):
        content = data.get('content', '')
        if "Showing lines 1 to 800" in content:
            # extract the code
            parts = content.split("The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.\n")
            if len(parts) > 1:
                code_lines = parts[1].split("\nThe above content does NOT show")[0].split('\n')
                cleaned = []
                for cl in code_lines:
                    if cl and ': ' in cl:
                        cleaned.append(cl.split(': ', 1)[1])
                    else:
                        cleaned.append(cl)
                output = '\n'.join(cleaned)
                break

if output:
    with open('src/pages/projects/tabs/PaymentTab.tsx', 'w') as f:
        f.write(output)
        print("Restored up to line 800")
else:
    print("Not found")

