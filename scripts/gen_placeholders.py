import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "uploads", "products", "seed")
os.makedirs(OUT, exist_ok=True)

# Wellness-themed placeholders for Milimani Wellness Center
# name, bg color, fg color
items = [
    ("vitamin-c-1000mg", (22, 101, 52), (240, 253, 244)),
    ("multivitamin-daily", (5, 150, 105), (236, 253, 245)),
    ("omega-3-fish-oil", (30, 64, 175), (239, 246, 255)),
    ("herbal-green-tea", (21, 128, 61), (240, 253, 244)),
    ("chamomile-tea", (180, 83, 9), (255, 251, 235)),
    ("lavender-essential-oil", (109, 40, 217), (245, 243, 255)),
    ("eucalyptus-oil", (15, 118, 110), (240, 253, 250)),
    ("yoga-mat", (190, 24, 93), (253, 242, 248)),
    ("meditation-cushion", (161, 98, 7), (255, 251, 235)),
    ("resistance-bands", (67, 56, 202), (238, 242, 255)),
    ("natural-face-serum", (219, 39, 119), (253, 242, 248)),
    ("aloe-vera-gel", (22, 163, 74), (240, 253, 244)),
    ("shea-body-butter", (180, 83, 9), (254, 243, 199)),
    ("himalayan-salt-lamp", (194, 65, 12), (255, 247, 237)),
    ("insulated-water-bottle", (2, 132, 199), (240, 249, 255)),
]

def load_font(size):
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

for name, bg, fg in items:
    size = 800
    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)

    # decorative circle
    draw.ellipse([size*0.62, -size*0.15, size*1.25, size*0.48], outline=fg, width=3)

    label = name.replace("-", " ").title()
    font = load_font(48)
    words = label.split(" ")
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if len(test) > 16 and cur:
            lines.append(cur)
            cur = w
        else:
            cur = test
    if cur:
        lines.append(cur)

    total_h = len(lines) * 58
    y = size/2 - total_h/2
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        draw.text(((size - w) / 2, y), line, font=font, fill=fg)
        y += 58

    img.save(os.path.join(OUT, f"{name}.png"), "PNG")

print("done", len(items))
