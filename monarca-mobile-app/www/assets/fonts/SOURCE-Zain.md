# Zain — self-hosted Google Fonts assets

Retrieved: 2026-10-26 (Asia/Shanghai task date).

Family: Zain, by Boutros Fonts. Shipped styles: normal Regular 400 and Bold 700; Arabic and Latin subsets only. Google Fonts metadata lists normal weights 200, 300, 400, 700, 800 and 900, so there is no native 500 or 600 weight. Italics and unused weights were not downloaded.

## Official sources and license

- User-selected specimen: <https://fonts.google.com/specimen/Zain?query=zain>. Confirmed HTTP 200 and page title `Zain - Google Fonts`.
- Google Fonts metadata: <https://raw.githubusercontent.com/google/fonts/main/ofl/zain/METADATA.pb>
- Google Fonts CSS API: <https://fonts.googleapis.com/css2?family=Zain:wght@400;700&display=swap>
- Upstream repository recorded in Google Fonts metadata: <https://github.com/googlefonts/zain>, commit `7c4a81812cee52243a8b52cc362650042b831d28`.
- License source: <https://raw.githubusercontent.com/google/fonts/main/ofl/zain/OFL.txt>
- License: SIL Open Font License 1.1, copyright 2024 The Zain Project Authors. The unmodified copyright notice and complete license are included as `OFL-Zain.txt`. The license allows embedding and redistribution with the license retained; font files must not be sold on their own.

The four WOFF2 files are the unmodified files returned by the official Google Fonts CSS API for a modern Chromium user agent. They were downloaded directly from `fonts.gstatic.com`; no conversion, subsetting, renaming of the font family, or third-party font CDN was used. The local filenames identify subset, weight and Google Fonts version.

## Files and integrity

| Local file | Weight | Subset | Bytes | SHA-256 |
|---|---:|---|---:|---|
| `zain-arabic-400-v4.woff2` | 400 | Arabic | 29,908 | `c88c951eaccee149f1c77627871c072abd928db76e1867213ed58c8d4e197ea7` |
| `zain-latin-400-v4.woff2` | 400 | Latin | 20,852 | `639db307264be456e9cd2bec14141fca234a2d41f8384de25591759cce1e4839` |
| `zain-arabic-700-v4.woff2` | 700 | Arabic | 29,616 | `223acac06d8d59c10a2bbd71a42cf7d70917875122b88f2ca7395773fe42ba54` |
| `zain-latin-700-v4.woff2` | 700 | Latin | 21,156 | `ffb9144e4a5424f00c55a3146d384ed5d81e71593d0d2c24cd4c8eb41aa5f510` |

Total font payload: **101,532 bytes (99.15 KiB)**. License: 4,474 bytes; SHA-256 `ccbcfbce2bc74fe58aa2d4fa0cf32c8f7facd95decc2a8f72cd49653a0d039da`.

Original download URLs, in the same order:

1. <https://fonts.gstatic.com/s/zain/v4/syk8-y9lm7soMNDNkBKW.woff2>
2. <https://fonts.gstatic.com/s/zain/v4/syk8-y9lm7soMNXNkA.woff2>
3. <https://fonts.gstatic.com/s/zain/v4/sykz-y9lm7soOG7ohSi3--rE.woff2>
4. <https://fonts.gstatic.com/s/zain/v4/sykz-y9lm7soOG7ohS23-w.woff2>

Validation read the WOFF2 headers, decompressed the Brotli table stream, checked the complete table byte counts, and inspected the OpenType `name`, `OS/2`, `head`, `hhea` and `maxp` tables. All four have `wOF2` signatures and matching declared/actual file lengths. Every family name is `Zain`; regular files identify `Zain Regular` / `Zain-Regular`, weight class 400, and bold files identify `Zain Bold` / `Zain-Bold`, weight class 700. Arabic subsets have 305 glyphs; Latin subsets have 224 glyphs. All use 800 units per em, ascender 869, descender -459 and line gap 0. These are static fonts.

## Integration contract

Use the local files below with `font-display: swap`. Keep native weights 400 and 700 in the UI; map existing intermediate UI weights deliberately rather than assuming that this is a variable font. Preserve the approved Monarca SVG wordmark. The site needs no runtime request to Google Fonts. Serve files with MIME `font/woff2`; preload at most the primary-language regular subset if useful.

The paths below are relative to the document. Adjust them only if the CSS file has a different base URL.

```css
/* Arabic regular */
@font-face {
  font-family: 'Zain';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('assets/fonts/zain-arabic-400-v4.woff2') format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1;
}
/* Latin regular */
@font-face {
  font-family: 'Zain';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('assets/fonts/zain-latin-400-v4.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* Arabic bold */
@font-face {
  font-family: 'Zain';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('assets/fonts/zain-arabic-700-v4.woff2') format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1;
}
/* Latin bold */
@font-face {
  font-family: 'Zain';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('assets/fonts/zain-latin-700-v4.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

## Suggested UI sizes for integration review

These are role-based recommendations derived from the font metrics, not claims of browser visual validation. Check the final Arabic and English UI at 320px and 390px widths.

| Size | Suggested role | Weight | Starting line-height |
|---|---|---:|---:|
| 15px | Metadata, secondary labels, bottom navigation when space is constrained | 400; 700 for selected labels only | 1.6 (24px) |
| 16px | Default body, forms, product names and ordinary controls | 400; 700 for primary actions | 1.65 (26.4px) |
| 18px | Section headings, prominent prices and important controls | 700 | 1.6 (28.8px) |

The font's ascender plus descender span is 1.66em; avoid fixed-height text boxes and overflow clipping, especially with Arabic marks. Arabic should keep normal letter spacing. Use explicit line-height on controls and size controls by padding/min-height so the new font metrics do not crop text. Keep body text at 16px or above where space permits.
