const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'src', 'main', 'resources', 'static', 'script.js'), 'utf8');
const start = src.indexOf('function extractInspectionData(text) {');
const end = src.indexOf('function loadImage(file) {');
if (start < 0 || end < 0 || end <= start) {
  throw new Error('Could not locate extractInspectionData in static/script.js');
}
const fn = src.slice(start, end);
const vm = require('vm');
const ctx = {
  console,
  window: {},
  document: { querySelector(){ return null; }, querySelectorAll(){ return []; }, addEventListener(){} },
  localStorage: { getItem(){ return null; }, setItem(){} },
  URL: { createObjectURL(){ return 'blob://x'; }, revokeObjectURL(){} },
  navigator: {},
  lucide: { createIcons(){} }
};
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fn + '; this.extractInspectionData = extractInspectionData;', ctx);
const sample = 'AQUA PURE\nM.R.P. ? 299.00\nNET WT. 500 ml\nMANUFACTURED BY: ABC FOODS PVT LTD\nADDRESS: 12 GREEN PARK, MUMBAI\nCOUNTRY OF ORIGIN: INDIA\nBEST BEFORE 12/2026';
const result = ctx.extractInspectionData(sample);
console.log(JSON.stringify({ mrp: result.mrp, quantity: result.quantity, manufacturer: result.manufacturer, expiryDate: result.expiryDate }, null, 2));
