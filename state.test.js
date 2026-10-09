import test from "node:test";
import assert from "node:assert/strict";
import { fresh, tryBuild, tryClaim, produce, cap, costOf, isNear, save, load, validState, advice, rate } from "../js/state.js";
import { CITIES, SAVE_KEY } from "../js/data.js";
const mem = () => { const m = {}; return { getItem:k => m[k] ?? null, setItem:(k, v) => { m[k] = v; }, m }; };

test("exactly 20 cities", () => assert.equal(Object.keys(CITIES).length, 20));
test("build deducts cost once and raises level", () => {
  const S = fresh(), c = costOf(S, "lumber"), w = S.res.wood, f = S.res.food, g = S.res.gold;
  const r = tryBuild(S, "lumber");
  assert.ok(r.ok); assert.equal(S.b.lumber, 1);
  assert.equal(S.res.food, f - c.food); assert.equal(S.res.gold, g - c.gold); assert.equal(S.res.wood, w);
});
test("insufficient resources rejected without change", () => {
  const S = fresh(); S.res.wood = 0; const before = JSON.stringify(S);
  const r = tryBuild(S, "farm"); assert.equal(r.ok, false); assert.equal(JSON.stringify(S), before);
});
test("level limited by castle", () => {
  const S = fresh(); S.res = { food:9999, wood:9999, stone:9999, gold:9999 }; S.b.farm = 3;
  const r = tryBuild(S, "farm"); assert.equal(r.ok, false); assert.match(r.msg, /قلعه/);
});
test("production clamps to storage cap, storehouse raises it", () => {
  const S = fresh(); S.res.food = 299; produce(S); assert.equal(S.res.food, 300);
  S.b.storehouse = 1; assert.equal(cap(S), 500);
});
test("claim needs adjacency and funds", () => {
  const S = fresh();
  assert.equal(tryClaim(S, "mashhad").ok, false);
  assert.ok(isNear(S, "qom"));
  S.res = { food:500, wood:500, stone:0, gold:500 };
  assert.ok(tryClaim(S, "qom").ok); assert.ok(S.owned.includes("qom"));
  assert.equal(tryClaim(S, "qom").ok, false);
});
test("save/load roundtrip and offline catch-up is capped", () => {
  const S = fresh(1000), st = mem(); assert.ok(save(S, st, 1000));
  const { state } = load(st, 1000 + 3000 * 5000);
  assert.ok(state.res.food > S.res.food && state.res.food <= cap(state));
  assert.ok(state.res.food - S.res.food <= 100 * rate(S).food);
});
test("corrupt or tampered save is rejected", () => {
  const st = mem(); st.setItem(SAVE_KEY, "{bad"); assert.ok(load(st).warning);
  const S = fresh(); S.res.gold = -5; assert.equal(validState(S), false);
  S.res.gold = 1; S.b.farm = 99; assert.equal(validState(S), false);
});
test("advice reflects low food", () => { const S = fresh(); S.res.food = 10; assert.match(advice(S), /غذا/); });
