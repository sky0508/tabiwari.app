import type { Trip, Expense } from "../types";

export function exportCSV(trip: Trip): void {
  const meta = `# トリップ名: ${trip.name}
# メンバー: ${trip.members.join(",")}
# 通貨: ${trip.foreignCurrency}
# レート: ${trip.exchangeRate}
`;
  const header = "タイトル,カテゴリ,金額,通貨,支払者,割り勘対象,日時";
  const rows = trip.expenses.map((e) =>
    [
      e.title,
      e.category,
      e.amount,
      e.currency,
      e.payer,
      `"${e.splitAmong.join(",")}"`,
      new Date(e.timestamp).toISOString(),
    ].join(",")
  );

  const csv = meta + header + "\n" + rows.join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trip.name}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function genId(): string {
  return Math.random().toString(36).substr(2, 8);
}

export function importCSV(csvText: string): {
  trip: Partial<Trip>;
  expenses: Expense[];
} | null {
  try {
    const lines = csvText.split("\n");
    const meta: Record<string, string> = {};
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("# ")) {
        const idx = line.indexOf(": ");
        if (idx !== -1) {
          const key = line.slice(2, idx).trim();
          const value = line.slice(idx + 2).trim();
          meta[key] = value;
        }
      } else if (line.trim() && !line.startsWith("タイトル")) {
        dataLines.push(line);
      }
    }

    const expenses: Expense[] = dataLines
      .filter((l) => l.trim())
      .map((line) => {
        const cols = parseCSVLine(line);
        return {
          id: genId(),
          title: cols[0] || "",
          category: cols[1] || "other",
          amount: parseFloat(cols[2]) || 0,
          currency: cols[3] || "JPY",
          payer: cols[4] || "",
          splitAmong: cols[5] ? cols[5].split(",").map((s) => s.trim()) : [],
          timestamp: cols[6] ? new Date(cols[6]).getTime() : Date.now(),
        };
      });

    return {
      trip: {
        name: meta["トリップ名"] || "",
        members: meta["メンバー"] ? meta["メンバー"].split(",").map((s) => s.trim()) : [],
        foreignCurrency: meta["通貨"] || "USD",
        exchangeRate: parseFloat(meta["レート"]) || 0,
      },
      expenses,
    };
  } catch {
    return null;
  }
}
