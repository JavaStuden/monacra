# Noto Sans Arabic — self-hosted Google Fonts assets

Retrieved: 2026-10-25 (Asia/Shanghai user task date).

Family: Noto Sans Arabic. Normal style, variable weight range requested: 400–700; normal width (100%).
Only Arabic and Latin subsets are shipped. Math, symbols and Latin Extended subsets were not downloaded.

## Official sources

- Specimen: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
- Google Fonts metadata: https://github.com/google/fonts/blob/main/ofl/notosansarabic/METADATA.pb
- CSS API: https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400..700&display=swap
- License source: https://raw.githubusercontent.com/google/fonts/main/ofl/notosansarabic/OFL.txt
- License: SIL Open Font License 1.1; the unmodified license is included as OFL-NotoSansArabic.txt.

The WOFF2 files below are the unchanged files returned by the official Google Fonts CSS API. No third-party font CDN or conversion was used.

## Files

### arabic

- File: `noto-sans-arabic-arabic-v33.woff2`
- Bytes: 165960
- SHA-256: `ce85091f020920b65762b387b194ef59457ea5b25b760f2dcc35240a94bb8669`
- Source: https://fonts.gstatic.com/s/notosansarabic/v33/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4r4xA.woff2
- Unicode range: `U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1`

### latin

- File: `noto-sans-arabic-latin-v33.woff2`
- Bytes: 31416
- SHA-256: `fed070abc960c5f214fcb02b7b178cdab751ef7facd79a899f571bc21d38b8f8`
- Source: https://fonts.gstatic.com/s/notosansarabic/v33/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj41v4o.woff2
- Unicode range: `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`

## Integration contract

Use one @font-face per subset with the same family name, normal style, `font-weight: 400 700`, `font-display: swap`, the original unicode-range above, and a local `url(assets/fonts/<file>) format("woff2")`. The site does not need to request Google Fonts at runtime.
Use 500 for body/metadata, 600 for controls and product names, and 700 for headings. Keep the approved Monarca SVG wordmark unchanged.
Preload only the Arabic WOFF2 if desired. Verify the served MIME type is font/woff2.
