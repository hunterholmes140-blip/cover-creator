// Clean number formatting for high readability across all fonts
export function toBn(n: number | string): string {
  return String(n);
}

export function taka(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳0";
  const formatted = num.toLocaleString("en-BD", { maximumFractionDigits: 0 });
  return "৳" + formatted;
}
