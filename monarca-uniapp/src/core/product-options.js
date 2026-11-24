export const defaultColorOptions = [
  {
    "key": "black",
    "nameAr": "أسود",
    "nameEn": "Black",
    "hex": "#2f2c2a"
  },
  {
    "key": "brown",
    "nameAr": "بني",
    "nameEn": "Brown",
    "hex": "#9b6b43"
  },
  {
    "key": "cream",
    "nameAr": "عاجي",
    "nameEn": "Ivory",
    "hex": "#e7ddc9"
  },
  {
    "key": "olive",
    "nameAr": "زيتي",
    "nameEn": "Olive",
    "hex": "#666a4f"
  },
  {
    "key": "taupe",
    "nameAr": "رمادي دافئ",
    "nameEn": "Warm taupe",
    "hex": "#9b8e7b"
  },
  {
    "key": "gold",
    "nameAr": "ذهبي",
    "nameEn": "Gold",
    "hex": "#c3a365"
  },
  {
    "key": "red",
    "nameAr": "أحمر",
    "nameEn": "Red",
    "hex": "#c5353d"
  },
  {
    "key": "white",
    "nameAr": "أبيض",
    "nameEn": "White",
    "hex": "#ffffff"
  },
  {
    "key": "beige",
    "nameAr": "بيج",
    "nameEn": "Beige",
    "hex": "#d8c3a5"
  },
  {
    "key": "gray",
    "nameAr": "رمادي",
    "nameEn": "Gray",
    "hex": "#8b8b8b"
  },
  {
    "key": "navy",
    "nameAr": "كحلي",
    "nameEn": "Navy",
    "hex": "#25364f"
  },
  {
    "key": "blue",
    "nameAr": "أزرق",
    "nameEn": "Blue",
    "hex": "#3569b0"
  },
  {
    "key": "green",
    "nameAr": "أخضر",
    "nameEn": "Green",
    "hex": "#36744c"
  },
  {
    "key": "pink",
    "nameAr": "وردي",
    "nameEn": "Pink",
    "hex": "#e7a3b1"
  },
  {
    "key": "purple",
    "nameAr": "بنفسجي",
    "nameEn": "Purple",
    "hex": "#805b97"
  },
  {
    "key": "orange",
    "nameAr": "برتقالي",
    "nameEn": "Orange",
    "hex": "#dc843b"
  },
  {
    "key": "yellow",
    "nameAr": "أصفر",
    "nameEn": "Yellow",
    "hex": "#e7c94f"
  },
  {
    "key": "burgundy",
    "nameAr": "خمري",
    "nameEn": "Burgundy",
    "hex": "#773143"
  },
  {
    "key": "silver",
    "nameAr": "فضي",
    "nameEn": "Silver",
    "hex": "#b7bac0"
  },
  {
    "key": "denim",
    "nameAr": "جينز أزرق",
    "nameEn": "Denim blue",
    "hex": "#52748c"
  }
];
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
export function safeColorOptions(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).filter(o => o && typeof o.key === 'string' && !forbidden.has(o.key)
    && /^[\p{L}\p{M}\p{N} _-]{1,24}$/u.test(o.key) && /^#[0-9a-f]{6}$/i.test(o.hex || '')
    && ['nameAr', 'nameEn'].every(k => typeof o[k] === 'string' && o[k].trim() && o[k].length <= 40 && !/[<>&"'\x00-\x1f]/.test(o[k])))
    .map(o => ({ key: o.key, nameAr: o.nameAr, nameEn: o.nameEn, hex: o.hex }));
}
