"""Native 16/24/48px contact sheets, with the approved pilot as a reference."""
import json
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

source, target = map(Path, sys.argv[1:3])
sheet = json.loads((source / "sheet.json").read_text())
names = sheet["names"]
columns = 6 if sheet["category"] in ["all", "similarity"] else 4
groups = sheet.get("groups")
labels = {}
if groups:
    names = []
    for label, members in groups:
        labels[len(names) // columns] = label
        names.extend(members)
        names.extend([None] * ((-len(names)) % columns))
cell_width, cell_height = 180, 134
rows = math.ceil(len(names) / columns)
width = columns * cell_width + 40
panel_height = 142 + rows * cell_height
canvas = Image.new("RGB", (width, 96 + 2 * (panel_height + 20)), "#e6ebf1")
draw = ImageDraw.Draw(canvas)


def font(size):
    for path in ["/System/Library/Fonts/Supplemental/Arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)


def text(x, y, value, color, size=12, anchor=None):
    draw.text((x, y), value, fill=color, font=font(size), anchor=anchor)


def icon(name, theme, size, x, y):
    image = Image.open(source / f"{name}-{theme}-{size}.png").convert("RGBA")
    assert image.size == (size, size)
    canvas.paste(image, (int(x - size / 2), int(y - size / 2)), image)


text(24, 20, f"DEMOCRUIT / {sheet['category'].upper()} / {sum(name is not None for name in names)} ENTRIES", "#243447", 19)
text(24, 52, "24×24 grid · 2px stroke · native 16 / 24 / 48px · inspect at 100%", "#516175", 13)

for theme, background, foreground, muted, index in [
    ("light", "#ffffff", "#243447", "#627185", 0),
    ("dark", "#15202e", "#eef3fa", "#afbdd0", 1),
]:
    top = 86 + index * (panel_height + 20)
    draw.rounded_rectangle((12, top, width - 12, top + panel_height), radius=12, fill=background)
    text(28, top + 14, f"{theme.upper()} · pilot reference at 24px", foreground, 13)
    for i, name in enumerate(sheet["pilotNames"]):
        center = 98 + i * ((width - 140) / 5)
        icon(name, theme, 24, center, top + 58)
        text(center, top + 82, name, muted, 10, anchor="mm")
    draw.line((28, top + 105, width - 28, top + 105), fill=muted, width=1)
    for i, name in enumerate(names):
        left = 20 + (i % columns) * cell_width
        y = top + 124 + (i // columns) * cell_height
        if name is None:
            continue
        if i % columns == 0 and i // columns in labels:
            text(left, y - 16, labels[i // columns], muted, 10)
        text(left + 90, y, name, foreground, 12, anchor="mm")
        for size, x in [(16, left + 38), (24, left + 82), (48, left + 137)]:
            icon(name, theme, size, x, y + 48)
            text(x, y + 88, str(size), muted, 10, anchor="mm")

target.parent.mkdir(parents=True, exist_ok=True)
canvas.save(target)
print(f"Contact sheet: {target} ({canvas.width}×{canvas.height})")
