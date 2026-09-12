"""Trace the supplied emblem geometry into two vector colors (no raster embedding)."""
from pathlib import Path
from PIL import Image
import vtracer
import re

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'public/emblem.png').convert('RGB')
navy, gold, white = (20, 44, 70), (145, 108, 49), (255, 255, 255)
pixels = []
for r, g, b in source.getdata():
    if b > r * 1.12 and r < 170:
        pixels.append(navy)
    elif r > b * 1.18 and b < 195 and r - b > 24:
        pixels.append(gold)
    else:
        pixels.append(white)
flat = Image.new('RGB', source.size)
flat.putdata(pixels)
flat.save(root / 'prototype/logo-flat.png')
target = root / 'prototype/alianza-emblema.svg'
vtracer.convert_image_to_svg_py(str(root / 'prototype/logo-flat.png'), str(target),
    colormode='color', hierarchical='cutout', mode='spline', filter_speckle=8,
    color_precision=6, layer_difference=16, corner_threshold=60,
    length_threshold=4, max_iterations=10, splice_threshold=45, path_precision=2)
svg = target.read_text()
svg = re.sub(r'<path[^>]*fill="#FFFFFF"[^>]*/>', '', svg, flags=re.I)
svg = svg.replace('width="1254" height="1254"', 'width="1254" height="1254" viewBox="0 0 1254 1254" role="img" aria-labelledby="emblem-title"')
svg = re.sub(r'(<svg[^>]*>)', r'\1<title id="emblem-title">Alianza: árbol y rosario entrelazados</title>', svg, count=1)
target.write_text(svg)
(root / 'prototype/logo-flat.png').unlink()
print(f'{target.name}: {len(svg)} bytes; vector paths: {svg.count("<path")}')
