"""Lay out native-size PNGs rendered by the pinned npm Resvg dependency."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

source = Path(sys.argv[1])
target = Path(sys.argv[2])
names = ["resume", "ats-pass", "video-interview", "salary-range", "laid-off"]
canvas = Image.new("RGB", (1000, 1100), "#e6ebf1")
draw = ImageDraw.Draw(canvas)


def font(size):
    for path in ["/System/Library/Fonts/Supplemental/Arial.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)


def label(x, y, text, color, size=13, anchor=None):
    draw.text((x, y), text, fill=color, font=font(size), anchor=anchor)


def icon(name, theme, size, x, y):
    art = Image.open(source / f"{name}-{theme}-{size}.png").convert("RGBA")
    assert art.size == (size, size), "Previews must be shown at native size"
    canvas.paste(art, (int(x - size / 2), int(y - size / 2)), art)


label(30, 22, "DEMOCRUIT / CAREER ICONS", "#243447", 14)
label(30, 47, "Pilot review · five original outline icons", "#243447", 26)
label(30, 83, "24×24 grid · 2px stroke · round caps and joins · inspect at 100%", "#516175", 14)

centers = [180 + index * 172 for index in range(5)]
for theme, top, background, foreground, muted in [
    ("light", 125, "#ffffff", "#243447", "#627185"),
    ("dark", 390, "#15202e", "#eef3fa", "#afbdd0"),
]:
    draw.rounded_rectangle((20, top, 980, top + 245), radius=12, fill=background)
    label(38, top + 18, f"{theme.upper()} / native sizes", foreground, 14)
    for name, center in zip(names, centers):
        label(center, top + 52, name, foreground, anchor="mm")
    for size, offset in [(16, 91), (24, 141), (48, 204)]:
        label(44, top + offset, f"{size}px", muted, anchor="lm")
        for name, center in zip(names, centers):
            icon(name, theme, size, center, top + offset)

label(30, 656, "Consistency / 24px, compact spacing", "#243447", 14)
for theme, left, background, foreground in [
    ("light", 20, "#ffffff", "#243447"), ("dark", 510, "#15202e", "#eef3fa")
]:
    draw.rounded_rectangle((left, 682, left + 470, 763), radius=12, fill=background)
    label(left + 18, 700, theme.upper(), foreground, 12)
    for index, name in enumerate(names):
        icon(name, theme, 24, left + 145 + index * 48, 725)

label(30, 785, "Alternatives / 48px · primary then alternative in each pair", "#243447", 14)
for theme, top, background, foreground in [
    ("light", 817, "#ffffff", "#243447"), ("dark", 948, "#15202e", "#eef3fa")
]:
    draw.rounded_rectangle((20, top, 980, top + 116), radius=12, fill=background)
    label(38, top + 18, theme.upper(), foreground, 12)
    for name, center in [("resume", 260), ("laid-off", 720)]:
        label(center, top + 23, name, foreground, anchor="mm")
        icon(name, theme, 48, center - 42, top + 70)
        icon(f"{name}-alt", theme, 48, center + 42, top + 70)

target.parent.mkdir(parents=True, exist_ok=True)
canvas.save(target)
print(f"Contact sheet: {target} (1000×1100; no icon scaling after rendering)")
