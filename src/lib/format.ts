// Bengali number formatting
const EN_TO_BN: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};

export function toBn(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => EN_TO_BN[d] ?? d);
}

export function taka(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳০";
  const formatted = num.toLocaleString("en-BD", { maximumFractionDigits: 0 });
  return "৳" + toBn(formatted);
}
