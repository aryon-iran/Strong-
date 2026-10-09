/* منطق خالص بازی (بدون DOM) — قابل آزمون با Node و قابل انتقال به سرور در مراحل بعد. */
import { RES, BUILDINGS, MAX_LEVEL, CITIES, ROADS, TERRAIN, TERRAIN_CLAIM_MULT, CAPITAL, SAVE_KEY, TICK_MS } from "./data.js";

export const BASE_CAP = 300, CAP_PER_LV = 200, MAX_OFFLINE_TICKS = 100;

export const fresh = (now = Date.now()) => ({
  v: 2, res: { food:120, wood:100, stone:40, gold:60 },
  b: { castle:1, farm:1, lumber:0, quarry:0, market:0, storehouse:0, barracks:0, tower:0 },
  owned: [CAPITAL], log: ["قلعهٔ کوچک تو در تهران بنا شد."], step: 0, hidden: false, last: now
});

export const cap = S => BASE_CAP + CAP_PER_LV * S.b.storehouse;
export const maxLevel = (S, k) => k === "castle" ? MAX_LEVEL : Math.min(MAX_LEVEL, S.b.castle + 2);
export const garrison = S => 5 + 5 * S.b.barracks;
export const defense = S => garrison(S) * 2 + S.b.tower * 8 + S.b.castle * 5;

export function rate(S) {
  const r = { food:0, wood:0, stone:0, gold:0 };
  for (const b of Object.keys(BUILDINGS)) if (BUILDINGS[b].out) r[BUILDINGS[b].out] += BUILDINGS[b].per * S.b[b];
  S.owned.forEach(id => { r[CITIES[id].sp] += 2; });
  return r;
}
/* تولید یک دور؛ هرگز از سقف انبار بالاتر نمی‌برد و موجودی بیش از سقف را کم نمی‌کند */
export function produce(S) {
  const r = rate(S), c = cap(S);
  for (const k in r) S.res[k] = Math.max(S.res[k], Math.min(c, S.res[k] + r[k]));
}
export const costOf = (S, k) => Object.fromEntries(Object.entries(BUILDINGS[k].base).map(([r, v]) => [r, Math.ceil(v * Math.pow(BUILDINGS[k].growth, S.b[k]))]));
export function claimCost(S, id) {
  const n = S.owned.length, m = TERRAIN_CLAIM_MULT[TERRAIN[id][0]];
  return { food:Math.ceil((30 + 15*n) * m), wood:Math.ceil((30 + 15*n) * m), gold:Math.ceil((40 + 20*n) * m) };
}
export const missing = (S, c) => Object.entries(c).filter(([k, v]) => S.res[k] < v).map(([k, v]) => [k, v - S.res[k]]);
export const neighbors = id => ROADS.filter(r => r.includes(id)).map(r => r[0] === id ? r[1] : r[0]);
export const isNear = (S, id) => !S.owned.includes(id) && neighbors(id).some(n => S.owned.includes(n));

export function addLog(S, t) { S.log.unshift(t); S.log.length = Math.min(S.log.length, 40); }
const lack = m => m.map(([k, v]) => `${Math.ceil(v)} ${RES[k]}`).join(" و ");

/* نتیجه: {ok, msg, event}. هزینه فقط یک بار و فقط پس از همهٔ بررسی‌ها کسر می‌شود. */
export function tryBuild(S, k) {
  const b = BUILDINGS[k]; if (!b) return { ok:false, msg:"ساختمان نامعتبر است." };
  const lv = S.b[k];
  if (lv >= MAX_LEVEL) return { ok:false, msg:`${b.name} به بالاترین سطح رسیده است.` };
  if (lv >= maxLevel(S, k)) return { ok:false, msg:`برای ارتقای بیشتر، ابتدا قلعه را ارتقا بده.` };
  const c = costOf(S, k), m = missing(S, c);
  if (m.length) return { ok:false, msg:`برای ${b.name} هنوز ${lack(m)} کم داری.` };
  for (const [r, v] of Object.entries(c)) S.res[r] -= v;
  S.b[k]++;
  const msg = lv === 0 ? `${b.name} ساخته شد.` : `${b.name} به سطح ${S.b[k]} ارتقا یافت.`;
  addLog(S, msg);
  return { ok:true, msg, event: lv === 0 ? "build:" + k : "upgrade:" + k };
}
export function tryClaim(S, id) {
  if (!CITIES[id]) return { ok:false, msg:"شهر نامعتبر است." };
  if (S.owned.includes(id)) return { ok:false, msg:"این شهر از پیش مال توست." };
  if (!isNear(S, id)) return { ok:false, msg:"این شهر با قلمرو تو راه مستقیم ندارد." };
  const c = claimCost(S, id), m = missing(S, c);
  if (m.length) return { ok:false, msg:`برای تصرف ${CITIES[id].n} هنوز ${lack(m)} کم داری.` };
  for (const [r, v] of Object.entries(c)) S.res[r] -= v;
  S.owned.push(id);
  const msg = `${CITIES[id].n} به قلمرو تو پیوست!`; addLog(S, msg);
  return { ok:true, msg, event:"claim" };
}

/* توصیهٔ ویلیام بر پایهٔ وضعیت واقعی بازی */
export function advice(S) {
  const c = cap(S), r = rate(S);
  if (S.res.food < 40) return `غذا رو به پایان است (${Math.floor(S.res.food)}). مزرعه را ارتقا بده؛ اکنون فقط ${r.food} غذا در هر دور می‌آید.`;
  const full = Object.keys(RES).find(k => S.res[k] >= c * 0.95);
  if (full) return `انبار ${RES[full]} تقریباً پر است. خرج کن یا «انبار» را ارتقا بده تا تولید هدر نرود.`;
  const cands = Object.keys(BUILDINGS).filter(k => S.b[k] < Math.min(MAX_LEVEL, maxLevel(S, k)));
  const ok = cands.filter(k => !missing(S, costOf(S, k)).length);
  if (ok.length) return `می‌توانی همین حالا «${BUILDINGS[ok[0]].name}» را ${S.b[ok[0]] ? "ارتقا بدهی" : "بسازی"}.`;
  if (!cands.length) return "برای ارتقای بیشتر، قلعه را بالا ببر.";
  const k = cands.sort((a, b) => Object.values(costOf(S, a)).reduce((x, y) => x + y) - Object.values(costOf(S, b)).reduce((x, y) => x + y))[0];
  return `ارزان‌ترین گام بعدی «${BUILDINGS[k].name}» است؛ کم داری: ${lack(missing(S, costOf(S, k)))}.`;
}

/* ===== ذخیره‌سازی (فقط نمونهٔ اولیه؛ بعداً با API سرور جایگزین می‌شود) ===== */
export function validState(o) {
  return !!o && o.v === 2 && o.res && o.b && Array.isArray(o.owned) && Array.isArray(o.log)
    && Object.keys(RES).every(k => Number.isFinite(o.res[k]) && o.res[k] >= 0)
    && Object.keys(BUILDINGS).every(k => Number.isInteger(o.b[k]) && o.b[k] >= 0 && o.b[k] <= MAX_LEVEL)
    && o.owned.every(id => CITIES[id]) && o.owned.includes(CAPITAL);
}
export function save(S, store, now = Date.now()) {
  try { S.last = now; store.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; }
}
/* خروجی: {state, warning}. زمان از ساعت کلاینت می‌آید و فقط برای نمونهٔ اولیهٔ تک‌نفره قابل‌قبول است. */
export function load(store, now = Date.now()) {
  let raw; try { raw = store.getItem(SAVE_KEY); } catch (e) { return { state:fresh(now), warning:"حافظهٔ مرورگر در دسترس نیست." }; }
  if (!raw) return { state:fresh(now) };
  try {
    const o = JSON.parse(raw);
    if (!validState(o)) throw new Error("invalid");
    const S = Object.assign(fresh(now), o);
    const ticks = Math.max(0, Math.min(MAX_OFFLINE_TICKS, Math.floor((now - (Number(o.last) || now)) / TICK_MS)));
    for (let i = 0; i < ticks; i++) produce(S);
    if (ticks) addLog(S, `در غیاب تو، ${ticks} دورِ تولید گذشت.`);
    return { state:S };
  } catch (e) { return { state:fresh(now), warning:"ذخیرهٔ قبلی خراب بود؛ بازی تازه شروع شد." }; }
}
