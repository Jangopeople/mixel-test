"""
sync_to_html.py — Sync corrected test data from apps.json into index.html.

apps.json is the source of truth (all test fixes applied).
index.html embeds the same data in two JS variables the live site reads:
  const APPS = [...]             English, pretty-printed  (lines ~571–9233)
  const APPS_I18N = {...}        DE/FR/EN/IT compact      (line ~9235+)
"""
import re

with open('apps.json', 'r', encoding='utf-8') as f:
    apps = f.read()
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ── Section boundaries ─────────────────────────────────────────────────────

def apps_section(lang):
    """Return (start, end) of a language section in apps.json."""
    order = ['DE', 'FR', 'EN', 'IT']
    idx = order.index(lang)
    starts = [apps.find(f'  {L}: [') for L in order]
    s = starts[idx]
    e = starts[idx + 1] if idx + 1 < len(order) else len(apps)
    return s, e

def html_i18n_section(lang, text=None):
    """Return (start, end) of a language section inside APPS_I18N in html."""
    if text is None:
        text = html
    order = ['DE', 'FR', 'EN', 'IT']
    idx = order.index(lang)
    base = text.find('const APPS_I18N = {')
    starts = [text.find(f'  {L}: [', base) for L in order]
    s = starts[idx]
    if idx + 1 < len(order):
        e = starts[idx + 1]
    else:
        e = text.find('\n};', s)
    return s, e

def html_apps_section(text=None):
    """Return (start, end) of the const APPS block in html."""
    if text is None:
        text = html
    s = text.find('const APPS = [')
    e = text.find('const APPS_I18N')
    return s, e

# ── Field extraction from apps.json ───────────────────────────────────────

def get_field(area, test_id, field):
    """Extract raw field value string from apps.json area (handles unescaped inner quotes)."""
    idx = area.find(f'"id": "{test_id}"')
    if idx == -1:
        return None

    # Limit search to this test's block (up to next test ID)
    next_id = area.find('"id": "', idx + len(test_id) + 10)
    block = area[idx: next_id if next_id != -1 else idx + 3000]

    # Find field key
    key_pat = f'"{field}"'
    ki = block.find(key_pat)
    if ki == -1:
        return None

    # Skip to opening quote of value
    pos = ki + len(key_pat)
    while pos < len(block) and block[pos] in ' \t:\n\r':
        pos += 1
    if pos >= len(block) or block[pos] != '"':
        return None
    pos += 1  # skip opening quote

    # Read value char by char
    chars = []
    while pos < len(block):
        ch = block[pos]
        if ch == '\\':
            chars.append(ch)
            pos += 1
            if pos < len(block):
                chars.append(block[pos])
                pos += 1
        elif ch == '"':
            # End-of-string heuristic: peek at what follows
            nxt = pos + 1
            while nxt < len(block) and block[nxt] in ' \t':
                nxt += 1
            if nxt < len(block) and block[nxt] in ',:}]\n':
                break  # real end of string
            # otherwise it's an unescaped inner quote — escape it
            chars.append('\\"')
            pos += 1
        elif ch == '\n':
            chars.append('\\n')
            pos += 1
        elif ch == '\r':
            pos += 1
        else:
            chars.append(ch)
            pos += 1

    return ''.join(chars)

# ── Field replacement in index.html ───────────────────────────────────────

def set_field(area_start, area_end, test_id, field, new_value):
    """Replace a field value for a test ID within html[area_start:area_end].
    Returns (new_html, ok)."""
    global html
    area = html[area_start:area_end]

    # Support both compact "id":"X" and pretty "id": "X"
    idx = area.find(f'"id":"{test_id}"')
    compact = True
    if idx == -1:
        idx = area.find(f'"id": "{test_id}"')
        compact = False
    if idx == -1:
        return False

    # Boundary: up to next test
    next_id = area.find('"id":', idx + len(test_id) + 10)
    block_end = next_id if next_id != -1 else len(area)
    block = area[idx:block_end]

    sep = ':' if compact else ': '
    pattern = rf'"{re.escape(field)}"\s*:\s*"(?:[^"\\]|\\.)*"'
    repl = f'"{field}"{sep}"{new_value}"'
    # Use lambda to prevent re.sub from interpreting \n, \t etc. in the replacement
    new_block = re.sub(pattern, lambda _: repl, block, flags=re.DOTALL)
    if new_block == block:
        return False

    new_area = area[:idx] + new_block + area[block_end:]
    html = html[:area_start] + new_area + html[area_end:]
    return True

# ── Collect all test IDs from apps.json DE section ────────────────────────

de_s, de_e = apps_section('DE')
test_ids = re.findall(r'"id":\s*"(ACC-\d+)"', apps[de_s:de_e])
print(f'Test IDs found: {len(test_ids)}')

# ── Apply fixes ────────────────────────────────────────────────────────────

FIELDS = ['title', 'where', 'steps', 'expected']
LANGS  = ['DE', 'FR', 'EN', 'IT']

stats = {'ok': 0, 'miss': 0}

for lang in LANGS:
    a_s, a_e = apps_section(lang)
    print(f'\n{lang}:', end=' ', flush=True)

    for tid in test_ids:
        for field in FIELDS:
            val = get_field(apps[a_s:a_e], tid, field)
            if val is None:
                continue

            # Recompute bounds each time (html grows/shrinks with each replacement)
            i18n_s, i18n_e = html_i18n_section(lang)
            ok = set_field(i18n_s, i18n_e, tid, field, val)
            if ok:
                stats['ok'] += 1
            else:
                stats['miss'] += 1

            # Also apply EN to const APPS block
            if lang == 'EN':
                ap_s, ap_e = html_apps_section()
                set_field(ap_s, ap_e, tid, field, val)

    print('done')

print(f'\nTotal: {stats["ok"]} updated, {stats["miss"]} already-correct/not-found')

# ── Quick spot-check ───────────────────────────────────────────────────────
idx = html.find('"ACC-012"')
if idx == -1:
    idx = html.find('"id":"ACC-012"')
snippet = html[idx:idx+250] if idx != -1 else '(not found)'
print(f'\nACC-012 spot-check:\n{snippet}')

# ── Save ───────────────────────────────────────────────────────────────────
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('\nSaved index.html')
