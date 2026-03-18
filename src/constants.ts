export const CATEGORIES = [
  { id: "food", emoji: "🍽", label: "食事" },
  { id: "transport", emoji: "🚕", label: "交通" },
  { id: "hotel", emoji: "🏨", label: "宿泊" },
  { id: "activity", emoji: "🎫", label: "観光" },
  { id: "shopping", emoji: "🛍", label: "買い物" },
  { id: "other", emoji: "🎉", label: "その他" },
] as const;

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "米ドル" },
  { code: "EUR", symbol: "€", name: "ユーロ" },
  { code: "GBP", symbol: "£", name: "英ポンド" },
  { code: "KRW", symbol: "₩", name: "韓国ウォン" },
  { code: "TWD", symbol: "NT$", name: "台湾ドル" },
  { code: "THB", symbol: "฿", name: "タイバーツ" },
  { code: "AUD", symbol: "A$", name: "豪ドル" },
  { code: "SGD", symbol: "S$", name: "シンガポールドル" },
  { code: "CNY", symbol: "¥", name: "人民元" },
  { code: "PHP", symbol: "₱", name: "フィリピンペソ" },
  { code: "VND", symbol: "₫", name: "ベトナムドン" },
  { code: "IDR", symbol: "Rp", name: "インドネシアルピア" },
  { code: "MYR", symbol: "RM", name: "マレーシアリンギット" },
  { code: "INR", symbol: "₹", name: "インドルピー" },
];

export const MEMBER_COLORS = [
  "#E07A5F", "#3D85C6", "#81B29A", "#F2CC8F",
  "#9B72AA", "#E8927C", "#5FA8D3", "#B5C99A",
  "#CE796B", "#7EB6D5", "#6D9DC5", "#D4A373",
];

export function getMemberColor(idx: number): string {
  return MEMBER_COLORS[idx % MEMBER_COLORS.length];
}

export function getInitial(name: string): string {
  return (name || "?").charAt(0).toUpperCase();
}

export function formatJPY(n: number): string {
  return "¥" + Math.round(n).toLocaleString();
}

export function genId(): string {
  return Math.random().toString(36).substr(2, 8);
}
