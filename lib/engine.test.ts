import assert from "node:assert/strict";
import test from "node:test";
import { IsolationForest } from "./iforest.ts";

test("IsolationForest scores an outlier above inliers and flags ~8% of training data", () => {
  let s = 1;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const X = Array.from({ length: 500 }, () => [r(), r(), r()]);
  const f = new IsolationForest(X);
  assert.ok(f.score([9, 9, 9]) > f.score([0.5, 0.5, 0.5]));
  assert.equal(f.predict([9, 9, 9]).flag, 1);
  const flagged = X.filter((x) => f.predict(x).flag).length / X.length;
  assert.ok(flagged > 0.03 && flagged < 0.15, `flag rate ${flagged}`);
});
