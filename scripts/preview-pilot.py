"""Lay out native-size PNGs rendered by the pinned npm Resvg dependency."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

source = Path(sys.argv[1])
target = Path(sys.argv[2])
names = ["resume", "ats-pass", "video-interview", "salary-range", "laid-off"]
strokes = ["1.5", "2"]
sizes = [16, 24, 32, 48]
canvas = Image.new("RGB", (1180, 1320), "#e6ebf1")
draw = ImageDraw.Draw(canvas)


def font(size):
    for path in ["/System/Library/Fonts/Supplemental/Arial.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)


def label(x, y, text, color, size=13, anchor=None):
    draw.text((x, y), text, fill=color, font=font(size), anchor=anchor)


def icon(name, theme, stroke, size, x, y):
    art = Image.open(source / f"{name}-{theme}-{stroke}-{size}.png").convert("RGBA")
    assert art.size == (size, size), "Previews must be shown at native size"
    canvas.paste(art, (int(x - size / 2), int(y - size / 2)), art)


label(30, 22, "DEMOCRUIT / CAREER ICONS", "#243447", 14)
label(30, 47, "Pilot review · five original outline icons", "#243447", 26)
label(30, 83, "24×24 grid · strokes 1.5 and 2 side by side · inspect at 100%", "#516175", 14)

group = 168
centers = [150 + index * group for index in range(5)]
cursor = 112
for theme, background, foreground, muted in [
    ("light", "#ffffff", "#243447", "#627185"),
    ("dark", "#15202e", "#eef3fa", "#afbdd0"),
]:
    panel_height = 78 + sum(size + 22 for size in sizes)
    draw.rounded_rectangle((20, cursor, 1160, cursor + panel_height), radius=12, fill=background)
    label(38, cursor + 16, f"{theme.upper()} / native sizes", foreground, 14)
    for name, center in zip(names, centers):
        label(center, cursor + 46, name, foreground, anchor="mm")
        label(center - 28, cursor + 66, "1.5", muted, 12, anchor="mm")
        label(center + 28, cursor + 66, "2", muted, 12, anchor="mm")
    row = cursor + 96
    for size in sizes:
        label(44, row, f"{size}px", muted, anchor="lm")
        for name, center in zip(names, centers):
            icon(name, theme, "1.5", size, center - 28, row)
            icon(name, theme, "2", size, center + 28, row)
        row += size + 22
    cursor += panel_height + 16

label(30, cursor, "Consistency / 24px at stroke 1.5", "#243447", 14)
cursor += 24
for theme, left, background, foreground in [
    ("light", 20, "#ffffff", "#243447"), ("dark", 600, "#15202e", "#eef3fa")
]:
    draw.rounded_rectangle((left, cursor, left + 560, cursor + 78), radius=12, fill=background)
    label(left + 18, cursor + 14, theme.upper(), foreground, 12)
    for index, name in enumerate(names):
        icon(name, theme, "1.5", 24, left + 150 + index * 78, cursor + 46)
cursor += 102

label(30, cursor, "Alternatives / 48px at stroke 1.5 · primary then alternative", "#243447", 14)
cursor += 24
for theme, background, foreground in [
    ("light", "#ffffff", "#243447"), ("dark", "#15202e", "#eef3fa")
]:
    draw.rounded_rectangle((20, cursor, 1160, cursor + 108), radius=12, fill=background)
    label(38, cursor + 16, theme.upper(), foreground, 12)
    for name, center in [("resume", 320), ("laid-off", 820)]:
        label(center, cursor + 22, name, foreground, anchor="mm")
        icon(name, theme, "1.5", 48, center - 40, cursor + 68)
        icon(f"{name}-alt", theme, "1.5", 48, center + 40, cursor + 68)
    cursor += 124

target.parent.mkdir(parents=True, exist_ok=True)
canvas.save(target)
print(f"Contact sheet: {target} ({canvas.size[0]}×{canvas.size[1]}; no icon scaling after rendering)")
