// Minimal Isolation Forest (Liu et al. 2008). Replaces sklearn: 100 trees, subsample 256, contamination 8%.
type Node = { f: number; v: number; l: Node; r: Node } | { size: number };

const H = (n: number) => Math.log(n) + 0.5772156649;
const c = (n: number) => (n <= 1 ? 0 : n === 2 ? 1 : 2 * H(n - 1) - (2 * (n - 1)) / n);

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class IsolationForest {
  private trees: Node[] = [];
  private psi: number;
  private threshold: number;

  constructor(X: number[][], nTrees = 100, contamination = 0.08, seed = 42) {
    const rand = rng(seed);
    this.psi = Math.min(256, X.length);
    const limit = Math.ceil(Math.log2(this.psi));
    const dims = X[0].length;

    const build = (rows: number[][], depth: number): Node => {
      if (depth >= limit || rows.length <= 1) return { size: rows.length };
      const f = Math.floor(rand() * dims);
      let lo = Infinity, hi = -Infinity;
      for (const r of rows) { lo = Math.min(lo, r[f]); hi = Math.max(hi, r[f]); }
      if (lo === hi) return { size: rows.length };
      const v = lo + rand() * (hi - lo);
      return {
        f, v,
        l: build(rows.filter((r) => r[f] < v), depth + 1),
        r: build(rows.filter((r) => r[f] >= v), depth + 1),
      };
    };

    for (let t = 0; t < nTrees; t++) {
      const sample = Array.from({ length: this.psi }, () => X[Math.floor(rand() * X.length)]);
      this.trees.push(build(sample, 0));
    }
    const scores = X.map((x) => this.score(x)).sort((a, b) => a - b);
    this.threshold = scores[Math.min(scores.length - 1, Math.floor(scores.length * (1 - contamination)))];
  }

  private path(x: number[], n: Node, d: number): number {
    return "size" in n ? d + c(n.size) : this.path(x, x[n.f] < n.v ? n.l : n.r, d + 1);
  }

  /** 0..1, higher = more anomalous. */
  score(x: number[]) {
    const avg = this.trees.reduce((s, t) => s + this.path(x, t, 0), 0) / this.trees.length;
    return Math.pow(2, -avg / c(this.psi));
  }

  /** score is shifted so > 0 means flagged. */
  predict(x: number[]) {
    const s = this.score(x);
    return { flag: s > this.threshold ? 1 : 0, score: +(s - this.threshold).toFixed(4) };
  }
}
