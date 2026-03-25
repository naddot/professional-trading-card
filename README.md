<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Professional Trading Card

A refined digital business card with interactive holographic effects and gyroscope-based motion.

## Purpose
Publish a single-page “digital business card” with interactive motion effects (mouse + optional mobile gyroscope) and sharing tools (QR + copy link).

## Project Structure
- `src/` React application code
- `public/` Vite static files
- `public/config.example.json` template for your card configuration
- `public/assets/` optional local images and the `contact.vcf` file (kept out of git by default)
- `.github/workflows/pages.yml` GitHub Pages deploy workflow (generates sensitive files from GitHub Secrets)

## Configuration (Local + GitHub Pages)
The app loads `public/config.json` at runtime.

To avoid committing personal information, the GitHub Pages workflow generates the following at build time from secrets:
- `public/config.json`
- `public/assets/contact.vcf`

For local development, create `public/config.json` manually based on `public/config.example.json`.

### Image URLs (GCS / CDN)
To use images stored in Google Cloud Storage (or any public CDN), set:
- `profile.imagePublicUrl`
- `profile.logoPublicUrl`

The app will prefer the `*PublicUrl` values when provided.

## Required GitHub Secrets (for GitHub Pages)
In your GitHub repo: Settings → Secrets and variables → Actions
- `CARD_CONFIG_JSON`: JSON contents for your `public/config.json` (stored as a single secret string)
- `CONTACT_VCF_CONTENT`: full text contents for your `public/assets/contact.vcf`

The workflow writes these files before running `npm run build`.

## Run Locally
**Prerequisites:** Node.js

PowerShell:
```powershell
npm install
npm run dev
# or
npm run build
```

Local setup (personal files):
1. Copy `public/config.example.json` to `public/config.json`
2. Update your personal details and (optionally) your public image URLs from GCS
3. Ensure `public/assets/contact.vcf` exists for the “Save Contact” button

## Deployment (GitHub Pages)
1. Create a GitHub repository and push this code.
2. Enable GitHub Pages and set the source to **GitHub Actions**.
3. Add the required secrets listed above.
4. Push to `main` (the included workflow triggers on `main`; if you use a different branch, adjust the workflow).

## Assumptions / Known Limitations
- GitHub Pages is public: visitors can download `public/config.json`, `contact.vcf`, and referenced images if they exist in the deployed site.
- This setup primarily prevents committing personal data into the git repository.

## Dependencies
- React + Vite
- Tailwind CSS
- `motion` (for holographic motion effects)
- `qrcode.react` (for QR code generation)
