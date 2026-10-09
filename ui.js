/* لایهٔ رابط: نقشه، پنل‌ها، ویلیام و رویدادها. منطق بازی فقط از state.js فراخوانی می‌شود. */
import { RES, RES_ICON, BUILDINGS, MAX_LEVEL, CITIES, ROADS, OUTLINE, CASPIAN, CAPITAL, STEPS, TERRAIN, TERRAIN_LABEL, TICK_MS, SAVE_KEY } from "./data.js";
import * as G from "./state.js";

const NS = "http://www.w3.org/2000/svg", W = 1000, H = 780;
const $ = id => document.getElementById(id);
const fa = n => Math.floor(n).toLocaleString("fa-IR");
let S, selected = null, tab = "city", vb = { x:0, y:0, w:W, h:H }, justDragged = false;
const store = (() => { try { return window.localStorage; } catch (e) { return { getItem:() => null, setItem:() => { throw e; } }; } })();

const PROJ = ([lo, la]) => [60 + (lo - 44) / 19 * 880, 40 + (39.9 - la) / 15 * 700];
const pts = a => a.map(p => PROJ(p).map(Math.round).join(",")).join(" ");
const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };

/* ---------- اعلان و تأیید ---------- */
function toast(msg, bad) {
  const t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.textContent = (bad ? "⚠ " : "✓ ") + msg;
  $("toasts").appendChild(t); setTimeout(() => t.remove(), 3500);
  while ($("toasts").children.length > 4) $("toasts").firstChild.remove();
}
function confirmBox(text, fn) {
  const d = $("dlg"); $("dlgText").textContent = text;
  if (typeof d.showModal !== "function") { if (confirm(text)) fn(); return; }
  d.onclose = () => { if (d.returnValue === "ok") fn(); d.returnValue = ""; };
  d.showModal();
}
function persist(manual) {
  const ok = G.save(S, store);
  if (!ok) toast("ذخیره‌سازی ممکن نیست (حافظهٔ مرورگر بسته یا پر است).", true); else if (manual) toast("بازی ذخیره شد.");
}

/* ---------- ویلیام ---------- */
const tutorialActive = () => S.step < STEPS.length;
function advance(ev) { const st = STEPS[S.step]; if (st && st.done === ev) { S.step++; showWill(); } }
function showWill() { S.hidden = false; renderWill(); }
function renderWill() {
  $("will").hidden = S.hidden; $("fab").hidden = !S.hidden;
  if (S.hidden) return;
  const st = STEPS[S.step];
  $("wtext").textContent = st ? st.t : G.advice(S);
  $("wNext").textContent = !st ? "بسیار خب" : st.done ? "باشه" : S.step === STEPS.length - 1 ? "متوجه شدم" : "بعدی";
}
$("wNext").onclick = () => {
  const st = STEPS[S.step];
  if (st && !st.done) { S.step++; S.hidden = S.step >= STEPS.length; } else S.hidden = true;
  renderWill(); persist();
};
$("wHide").onclick = () => { S.hidden = true; renderWill(); persist(); };
$("fab").onclick = $("mHelp").onclick = () => { showWill(); persist(); };

/* ---------- نقشه: ساخت، رنگ‌آمیزی، حرکت و بزرگ‌نمایی ---------- */
function buildMap() {
  const svg = $("map"); svg.innerHTML = "";
  el("polygon", { points:pts(CASPIAN), class:"sea" }, svg);
  el("polygon", { points:pts(OUTLINE), class:"land" }, svg);
  [["دریای خزر", [51.2, 40.4], 0], ["خلیج فارس", [53.5, 26.3], 30], ["دریای عمان", [58.5, 25.4], 30]].forEach(([n, ll, dy]) => {
    const p = PROJ(ll), t = el("text", { x:p[0], y:p[1] + dy, class:"sealbl", "text-anchor":"middle" }, svg); t.textContent = n;
  });
  ROADS.forEach(([a, b]) => { const [x1, y1] = PROJ(CITIES[a].ll), [x2, y2] = PROJ(CITIES[b].ll); el("line", { x1, y1, x2, y2, class:"road", "data-a":a, "data-b":b }, svg); });
  for (const [id, c] of Object.entries(CITIES)) {
    const [x, y] = PROJ(c.ll);
    const g = el("g", { class:"city", id:"c-" + id, tabindex:"0", role:"button", "aria-label":c.n, transform:`translate(${x} ${y})` }, svg);
    el("circle", { r:20, class:"ring" }, g); el("circle", { r:9, class:"dot" }, g);
    el("text", { y:-15, "text-anchor":"middle" }, g).textContent = c.n;
    g.addEventListener("click", () => { if (!justDragged) selectCity(id); });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCity(id); } });
  }
}
function paintMap() {
  for (const id in CITIES) {
    const g = $("c-" + id); if (!g) continue;
    g.classList.toggle("owned", S.owned.includes(id)); g.classList.toggle("cap", id === CAPITAL);
    g.classList.toggle("near", G.isNear(S, id)); g.classList.toggle("sel", id === selected);
    /* وضعیت فقط با رنگ نمایش داده نمی‌شود: برچسب متنی برای صفحه‌خوان */
    g.setAttribute("aria-label", `${CITIES[id].n} — ${id === CAPITAL ? "پایتخت تو" : S.owned.includes(id) ? "تصرف‌شده" : G.isNear(S, id) ? "قابل تصرف" : "بی‌صاحب"}`);
  }
  document.querySelectorAll(".road").forEach(r => r.classList.toggle("own", S.owned.includes(r.dataset.a) && S.owned.includes(r.dataset.b)));
}
function applyVB() {
  vb.w = Math.min(W, Math.max(250, vb.w)); vb.h = vb.w * H / W;
  vb.x = Math.min(W - vb.w, Math.max(0, vb.x)); vb.y = Math.min(H - vb.h, Math.max(0, vb.y));
  const svg = $("map"); svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.style.setProperty("--fs", (innerWidth < 900 ? 20 : 15) * Math.max(0.55, vb.w / W) + "px"); /* برچسب‌ها در هر بزرگ‌نمایی خوانا می‌مانند */
}
function zoom(f, cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2) {
  const nw = Math.min(W, Math.max(250, vb.w * f)), k = nw / vb.w;
  vb.x = cx - (cx - vb.x) * k; vb.y = cy - (cy - vb.y) * k; vb.w = nw; applyVB();
}
function goHome() { const [x, y] = PROJ(CITIES[CAPITAL].ll); vb.w = 450; vb.h = 450 * H / W; vb.x = x - vb.w / 2; vb.y = y - vb.h / 2; applyVB(); }
function bindMapInput() {
  const svg = $("map"); let d = null;
  const toSvg = e => { const r = svg.getBoundingClientRect(); return [vb.x + (e.clientX - r.left) / r.width * vb.w, vb.y + (e.clientY - r.top) / r.height * vb.h]; };
  svg.addEventListener("pointerdown", e => { d = { x:e.clientX, y:e.clientY, vx:vb.x, vy:vb.y, moved:false }; });
  svg.addEventListener("pointermove", e => {
    if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true; const k = vb.w / svg.clientWidth; vb.x = d.vx - dx * k; vb.y = d.vy - dy * k; applyVB();
  });
  const end = () => { if (d && d.moved) { justDragged = true; setTimeout(() => justDragged = false, 0); } d = null; };
  svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
  svg.addEventListener("wheel", e => { e.preventDefault(); const [cx, cy] = toSvg(e); zoom(e.deltaY < 0 ? 0.85 : 1.18, cx, cy); }, { passive:false });
  $("zIn").onclick = () => zoom(0.7); $("zOut").onclick = () => zoom(1.4);
  window.addEventListener("resize", applyVB);
}

/* ---------- پنل‌ها ---------- */
const costHTML = c => Object.entries(c).map(([k, v]) => `<span class="${S.res[k] >= v ? "" : "no"}">${RES_ICON[k]} ${fa(v)}${S.res[k] >= v ? "" : " (کم‌بود)"}</span>`).join(" · ");
function renderRes() {
  const r = G.rate(S), c = G.cap(S);
  $("res").innerHTML = Object.keys(RES).map(k => `<div class="chip" title="${RES[k]} — سقف انبار: ${fa(c)}"><span>${RES_ICON[k]} ${RES[k]}</span><b>${fa(S.res[k])}</b><i>+${fa(r[k])}</i></div>`).join("");
}
function renderPane() {
  const p = $("pane"); document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
  if (tab === "build") {
    p.innerHTML = `<h2>قلعهٔ تو</h2><p class="muted">دفاع: <b>${fa(G.defense(S))}</b> · پادگان: ${fa(G.garrison(S))} سرباز · سقف انبار: ${fa(G.cap(S))}</p>` +
      Object.entries(BUILDINGS).map(([k, b]) => {
        const lv = S.b[k], max = lv >= MAX_LEVEL, gated = !max && lv >= G.maxLevel(S, k), c = G.costOf(S, k), can = !max && !gated && !G.missing(S, c).length;
        return `<div class="card"><h3><span>${b.icon} ${b.name}</span><span>سطح ${fa(lv)} از ${fa(MAX_LEVEL)}</span></h3><div class="muted">${b.desc}${b.out ? ` اکنون: +${fa(b.per * lv)} ${RES[b.out]} در هر دور.` : ""}</div>
        <div class="bar"><i style="width:${lv / MAX_LEVEL * 100}%"></i></div>
        <div class="cost">${max ? "حداکثر سطح" : gated ? "نیازمند: ارتقای قلعه" : "هزینه: " + costHTML(c)}</div>
        <button class="btn" data-build="${k}" ${can ? "" : "disabled"}>${lv === 0 ? "ساخت" : "ارتقا"}</button></div>`;
      }).join("");
  } else if (tab === "log") {
    p.innerHTML = `<h2>گزارش‌ها</h2><ul class="log">${S.log.map(t => `<li>${t}</li>`).join("")}</ul>`;
  } else if (!selected) {
    p.innerHTML = `<h2>شهری انتخاب نشده</h2><p class="muted">روی یکی از شهرهای نقشه بزن. قلمرو تو: ${fa(S.owned.length)} از ${fa(20)} شهر.</p>`;
  } else {
    const c = CITIES[selected], own = S.owned.includes(selected), near = G.isNear(S, selected), cc = G.claimCost(S, selected), [tr, val] = TERRAIN[selected];
    const status = selected === CAPITAL ? `<span class="tag cap">پایتخت و قلعهٔ تو</span>` : own ? `<span class="tag ok">تصرف‌شده توسط تو</span>` : near ? `<span class="tag">بی‌صاحب — قابل تصرف</span>` : `<span class="tag">بی‌صاحب — دور از قلمرو</span>`;
    const can = near && !G.missing(S, cc).length;
    p.innerHTML = `<h2>${c.n}</h2>${status}<p>${c.d}</p>
    <div class="card"><div class="muted">زمین: ${TERRAIN_LABEL[tr]} · ارزش راهبردی: ${fa(val)} از ${fa(3)}</div>
    <div class="muted">منبع تخصصی: ${RES_ICON[c.sp]} ${RES[c.sp]} (+۲ در هر دور برای مالک)</div>
    <div class="muted">راه مستقیم به: ${G.neighbors(selected).map(n => CITIES[n].n).join("، ")}</div></div>
    ${own ? "" : `<div class="cost">هزینهٔ تصرف (با اثر زمین ${TERRAIN_LABEL[tr]}): ${costHTML(cc)}</div><button class="btn" data-claim="${selected}" ${can ? "" : "disabled"}>تصرف شهر</button>${near ? "" : `<p class="muted">باید با شهری از قلمرو تو راه مستقیم داشته باشد.</p>`}`}`;
  }
}
function renderAll() { renderRes(); renderPane(); paintMap(); renderWill(); }
function act(r) { toast(r.msg, !r.ok); if (r.ok) { advance(r.event); persist(); } renderAll(); }
function selectCity(id) { selected = id; tab = "city"; advance("select"); renderAll(); }

/* ---------- راه‌اندازی ---------- */
export function init() {
  const res = G.load(store); S = res.state; if (res.warning) toast(res.warning, true);
  buildMap(); bindMapInput(); applyVB();
  document.querySelector(".tabs").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) { tab = b.dataset.tab; renderPane(); } });
  $("pane").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.build) act(G.tryBuild(S, b.dataset.build)); else if (b.dataset.claim) act(G.tryClaim(S, b.dataset.claim));
  });
  $("mSave").onclick = () => persist(true);
  $("mHome").onclick = () => { selected = CAPITAL; goHome(); renderAll(); };
  $("mReset").onclick = () => confirmBox("همهٔ پیشرفت پاک شود و بازی از اول شروع شود؟", () => {
    try { store.removeItem(SAVE_KEY); } catch (e) { console.error(e); }
    S = G.fresh(); selected = null; tab = "city"; showWill(); persist(); renderAll(); toast("بازی از نو آغاز شد.");
  });
  window.addEventListener("error", e => { console.error(e.error || e.message); toast("خطایی رخ داد؛ جزئیات در کنسول است.", true); });
  window.addEventListener("beforeunload", () => G.save(S, store));
  document.addEventListener("visibilitychange", () => { if (document.hidden) G.save(S, store); });
  setInterval(() => { G.produce(S); renderRes(); if (tab === "build") renderPane(); if (!S.hidden && !tutorialActive()) renderWill(); }, TICK_MS);
  setInterval(() => G.save(S, store), 15000);
  renderAll();
}
