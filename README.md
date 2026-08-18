# tronlist.json1 — Token automation for TRON (USDT example)

This repository now contains an automation to produce a "one-click" watchAsset flow for TronLink by publishing:

- add-token.html — a lightweight page that reads a token metadata JSON and presents an "Add token" UX (open in the in-app browser of TronLink).
- metadata-TPHjxcwu.json — token metadata for Tether USD (USDT) on TRON Mainnet.
- A GitHub Action + Python script that generates:
  - assets/metadata-<address>.json (canonical copy)
  - assets/add-token-link-<address>.txt (the watchAsset link)
  - assets/qr-<address>.png and assets/qr-<address>.svg (QR code pointing to the add-token page with metadata)

Status badge:
![Generate token QR workflow](https://github.com/mohess6478/tronlist.json1/actions/workflows/generate-qr.yml/badge.svg)

Quick links:
- Metadata (raw): https://raw.githubusercontent.com/mohess6478/tronlist.json1/fc3570dcf9e81c40b4c453885582a043b68ec4fd/metadata-TPHjxcwu.json
- Add token page (GitHub Pages): https://mohess6478.github.io/tronlist.json1/add-token.html?metadata_url=https://raw.githubusercontent.com/mohess6478/tronlist.json1/fc3570dcf9e81c40b4c453885582a043b68ec4fd/metadata-TPHjxcwu.json
- Fallback QR (if PNG not generated yet): assets/qr-TPHjxcwu.svg

How it works (overview)
1. Edit or add a metadata-<address>.json file containing:
   - name, symbol, decimals, logoURI, tokenAddress, network
2. The workflow `.github/workflows/generate-qr.yml` triggers on push to metadata-*.json or manually (workflow_dispatch).
3. The workflow runs `scripts/generate_assets.py` which:
   - canonicalizes and copies the metadata into `assets/`
   - builds a watch URL (prefers GitHub Pages base)
   - generates QR codes (PNG + SVG) and writes them into `assets/`
   - commits `assets/` back to the repository (if changes)
4. Users open the generated add-token page from TronLink's in-app browser or scan the QR code with their device. The page displays token details and provides an "open" button. (If TronLink supports specific deep links, that's wallet-specific; the page is designed to be opened inside TronLink's browser for the user to accept/import.)

One-click instructions for end users
1. Open TronLink wallet app.
2. Use TronLink's internal browser and open the "Add token page" URL:
   - https://mohess6478.github.io/tronlist.json1/add-token.html?metadata_url=https://raw.githubusercontent.com/mohess6478/tronlist.json1/fc3570dcf9e81c40b4c453885582a043b68ec4fd/metadata-TPHjxcwu.json
3. The page will display token details. Follow the wallet's prompts to add the token.

Developer notes and customization
- The script uses the commit SHA to build raw.githubusercontent links so the generated links are stable and reproducible.
- If you prefer a different GitHub Pages domain or branch, provide `--pages-base` or adjust the action to pass the correct base.
- The QR generator uses the Python `qrcode` library and falls back to an external QR API for the SVG if the library is unavailable.

Local developer usage
1. Install dependencies:
   pip install qrcode[pil]
2. Run the script:
   python scripts/generate_assets.py --metadata metadata-TPHjxcwu.json --repo mohess6478/tronlist.json1 --ref fc3570dcf9e81c40b4c453885582a043b68ec4fd --pages-base https://mohess6478.github.io/tronlist.json1

Security / notes
- The GitHub Action commits the generated `assets/` directory back to the repository. It uses the workflow's checkout action and push with the default GITHUB_TOKEN. If you prefer not to auto-commit, remove the commit/push step.
- The add-token.html file intentionally fetches metadata via the raw file URL. If you prefer to embed metadata inline (for privacy or to avoid raw.githubusercontent), change the workflow/script to embed metadata into the HTML at generation time.

Contact / troubleshooting
- If the token doesn't appear in TronLink after following the above steps, ensure:
  - You're on TRON Mainnet in the wallet.
  - The token address is correct: TPHjxcwuDiAJtnySMo99ou7Rbqo8cqVhsh
  - The wallet's in-app browser is used (some wallets only allow imports when the page is opened inside the wallet).

---

Files added by the automation:
- metadata-TPHjxcwu.json
- add-token.html
- scripts/generate_assets.py
- .github/workflows/generate-qr.yml
- assets/qr-TPHjxcwu.svg

If you want, I can:
- Convert the auto-commit step to create a pull request instead of pushing directly.
- Generate an actual PNG QR here and include it (I can embed a base64 PNG into a file if you prefer).
- Update the workflow to publish to GitHub Pages automatically (requires Pages to be enabled).
