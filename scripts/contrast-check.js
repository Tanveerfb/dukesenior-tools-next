const fs = require('fs');
const path = require('path');

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const int = parseInt(hex, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function srgbChannelToLinear(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b);
}

function contrastRatio(hexA, hexB) {
  const L1 = relativeLuminance(hexA);
  const L2 = relativeLuminance(hexB);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return +( (lighter + 0.05) / (darker + 0.05) ).toFixed(2);
}

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function darkenHex(hex, percent) {
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, hsl.l - percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

function lightenHex(hex, percent) {
  const hsl = hexToHsl(hex);
  hsl.l = Math.min(100, hsl.l + percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

function extractVarsFromScss(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  const re = /\$([a-zA-Z0-9_-]+)\s*:\s*(#[0-9A-Fa-f]{3,6})/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    vars[m[1]] = m[2];
  }
  return vars;
}

const projectRoot = path.resolve(__dirname, '..');
const globalScss = path.join(projectRoot, 'src', 'styles', 'global.scss');
if (!fs.existsSync(globalScss)) {
  console.error('global.scss not found at', globalScss);
  process.exit(1);
}

const vars = extractVarsFromScss(globalScss);

// Key variables we care about (fallbacks if not found)
const neutral100 = vars['neutral-100'] || '#ffffff';
const neutral900 = vars['neutral-900'] || '#111827';
const brandPrimary = vars['brand-primary'] || vars['primary'] || '#0FAF6E';
const brandPrimaryDark = vars['brand-primary-dark'] || vars['btn-primary-bg'] || brandPrimary;
const brandSecondary = vars['brand-secondary'] || '#D81B60';
const brandSecondaryDark = vars['brand-secondary-dark'] || brandSecondary;
const brandAccent = vars['brand-accent'] || '#FFD500';
const brandAccentContrast = vars['brand-accent-contrast'] || '#0F1720';

console.log('\nContrast report (WCAG ratios). Target: >= 4.5 for normal text.');
const pairs = [
  { name: 'Body text on background', a: neutral900, b: neutral100 },
  { name: 'Primary (white text) on primary-dark bg', a: '#ffffff', b: brandPrimaryDark },
  { name: 'Primary text on primary bg', a: neutral900, b: brandPrimary },
  { name: 'Secondary (white text) on secondary bg', a: '#ffffff', b: brandSecondary },
  { name: 'Secondary (white text) on secondary-dark bg', a: '#ffffff', b: brandSecondaryDark },
  { name: 'Accent contrast on accent', a: brandAccentContrast, b: brandAccent },
  { name: 'Muted text on surface', a: vars['neutral-500'] || '#6B7280', b: vars['neutral-200'] || '#F6F8FA' }
];

pairs.forEach(p => {
  const ratio = contrastRatio(p.a, p.b);
  const pass = ratio >= 4.5 ? 'PASS' : 'FAIL';
  console.log(`${p.name}: ${p.a} on ${p.b} -> ${ratio}: ${pass}`);
});

// If secondary or primary with white text fails, propose darker variants until they pass (up to 40% darken)
const desired = 4.5;
function findDarkenSuggestion(foreground, backgroundHex, maxDarken = 40) {
  if (contrastRatio(foreground, backgroundHex) >= desired) return null;
  for (let d = 2; d <= maxDarken; d += 1) {
    const cand = darkenHex(backgroundHex, d);
    const r = contrastRatio(foreground, cand);
    if (r >= desired) return { darkenBy: d, hex: cand, ratio: r };
  }
  return null;
}

const primarySuggestion = findDarkenSuggestion('#ffffff', brandPrimaryDark, 40);
const secondarySuggestion = findDarkenSuggestion('#ffffff', brandSecondary, 40);

if (primarySuggestion) {
  console.log('\nSuggested fix for primary button bg to reach AA against white text:');
  console.log(`- darken by ${primarySuggestion.darkenBy}% -> ${primarySuggestion.hex} (contrast ${primarySuggestion.ratio})`);
}
if (secondarySuggestion) {
  console.log('\nSuggested fix for secondary color to reach AA against white text:');
  console.log(`- darken by ${secondarySuggestion.darkenBy}% -> ${secondarySuggestion.hex} (contrast ${secondarySuggestion.ratio})`);
  const suggestedDark = darkenHex(secondarySuggestion.hex, 8);
  console.log(`- recommended secondary-dark: ${suggestedDark}`);
}
if (!primarySuggestion && !secondarySuggestion) {
  console.log('\nNo change needed for primary/secondary colors (meet AA for white text).');
}

// Ensure dark body text has enough contrast on primary background (some components use dark text on primary)
if (contrastRatio(neutral900, brandPrimary) < desired) {
  let suggestionLight = null;
  for (let d = 2; d <= 30; d += 1) {
    const cand = lightenHex(brandPrimary, d);
    const r = contrastRatio(neutral900, cand);
    if (r >= desired) { suggestionLight = { lightenBy: d, hex: cand, ratio: r }; break; }
  }
  if (suggestionLight) {
    console.log('\nSuggested fix for primary color to reach AA against dark body text:');
    console.log(`- lighten by ${suggestionLight.lightenBy}% -> ${suggestionLight.hex} (contrast ${suggestionLight.ratio})`);
  } else {
    console.log('\nCould not find a small lightening that brings primary to AA against dark text (consider using white text on primary surfaces or pick a different hue).');
  }
} else {
  console.log('\nPrimary background already meets AA for dark body text.');
}

console.log('\nDone. If you want, run this script after edits to re-check, or I can apply the suggested change to `src/styles/global.scss`.\n');
