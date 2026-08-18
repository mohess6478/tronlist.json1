#!/usr/bin/env python3
"""
generate_assets.py

- Reads token metadata JSON (e.g., metadata-TPHjxcwu.json)
- Produces:
  - assets/metadata-<address>.json (canonicalized)
  - assets/add-token-link.txt (the watchAsset link / page URL)
  - assets/qr-<address>.png and assets/qr-<address>.svg

Usage:
  python scripts/generate_assets.py --metadata metadata-TPHjxcwu.json \
      --repo mohess6478/tronlist.json1 \
      --ref fc3570dcf9e81c40b4c453885582a043b68ec4fd \
      --pages-base https://mohess6478.github.io/tronlist.json1
"""
import os
import sys
import argparse
import json
import urllib.parse

def load_metadata(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_file(path, data, mode='w'):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, mode, encoding='utf-8') as f:
        if isinstance(data, bytes):
            f.write(data)
        else:
            f.write(data)

def generate_qr_using_qrcode(data, png_path, svg_path):
    try:
        import qrcode
        from qrcode.image.svg import SvgImage
    except Exception as e:
        print("qrcode library not installed. Install with: pip install qrcode[pil]")
        raise

    # PNG
    img = qrcode.make(data)
    img.save(png_path)
    print(f"Saved PNG QR to {png_path}")

    # SVG
    factory = SvgImage
    qr = qrcode.make(data, image_factory=factory)
    qr.save(svg_path)
    print(f"Saved SVG QR to {svg_path}")

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--metadata', required=True, help='Path to metadata JSON')
    p.add_argument('--repo', required=True, help='owner/repo (e.g., user/repo)')
    p.add_argument('--ref', required=False, default='main', help='Git ref or commit SHA to build raw URLs (default: main)')
    p.add_argument('--pages-base', required=False, default=None, help='GitHub Pages base URL (optional). If provided, watch link will target this base.')
    p.add_argument('--outdir', required=False, default='assets', help='Output directory in repo')
    args = p.parse_args()

    metadata = load_metadata(args.metadata)
    token_address = metadata.get('tokenAddress') or metadata.get('address') or 'unknown'
    filename_suffix = token_address
    outdir = args.outdir.rstrip('/')

    # Raw metadata URL (raw.githubusercontent)
    raw_metadata_url = f"https://raw.githubusercontent.com/{args.repo}/{args.ref}/{os.path.basename(args.metadata)}"

    # Build watch URL: prefer GitHub Pages if pages-base provided else use raw add-token.html URL
    if args.pages_base:
        watch_url = f"{args.pages_base}/add-token.html?metadata_url={urllib.parse.quote(raw_metadata_url, safe='')}"
    else:
        # fallback to raw HTML page (works if opened in browser)
        watch_url = f"https://raw.githubusercontent.com/{args.repo}/{args.ref}/add-token.html?metadata_url={urllib.parse.quote(raw_metadata_url, safe='')}"

    # Write canonicalized metadata to assets
    canonical_path = f"{outdir}/metadata-{filename_suffix}.json"
    write_file(canonical_path, json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote canonical metadata to {canonical_path}")

    # Write watch link
    link_path = f"{outdir}/add-token-link-{filename_suffix}.txt"
    write_file(link_path, watch_url + "\n")
    print(f"Wrote watch link to {link_path}")

    # Generate QR codes
    png_path = f"{outdir}/qr-{filename_suffix}.png"
    svg_path = f"{outdir}/qr-{filename_suffix}.svg"
    try:
        generate_qr_using_qrcode(watch_url, png_path, svg_path)
    except Exception as e:
        print("Failed to generate QR via qrcode library.")
        # fallback: produce a tiny SVG wrapper that references an external QR generator (requires network)
        fallback_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <image href="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={urllib.parse.quote(watch_url, safe='')}" width="300" height="300" />
  Sorry, your browser does not support inline images.
</svg>
'''
        write_file(svg_path, fallback_svg)
        print(f"Wrote fallback SVG to {svg_path}")

    print("Done.")
    print("Watch URL:", watch_url)


if __name__ == '__main__':
    main()
