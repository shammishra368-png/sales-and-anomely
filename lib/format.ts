export const inr = (n: number, d = 0) =>
  `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export const impact = (n: number) => (n === 0 ? "-" : `${n < 0 ? "-" : "+"}${inr(n)}`);
