import type { Trip, Settlement } from "../types";
import { CATEGORIES } from "../constants";

export function computeSettlement(trip: Trip): Settlement {
  const { members, expenses, exchangeRate } = trip;
  const rate = parseFloat(String(exchangeRate)) || 0;
  if (!members?.length || !expenses?.length) {
    return { perPerson: {}, transfers: [], total: 0, balances: {} };
  }

  const toJPY = (amt: number, cur: string) =>
    cur === "JPY" ? amt : amt * rate;

  const perPerson: Settlement["perPerson"] = {};
  members.forEach((m) => {
    perPerson[m] = { paid: 0, owes: 0, categories: {} };
    CATEGORIES.forEach((c) => (perPerson[m].categories[c.id] = 0));
  });

  let total = 0;
  expenses.forEach((exp) => {
    const jpy = toJPY(exp.amount, exp.currency);
    total += jpy;
    if (perPerson[exp.payer]) perPerson[exp.payer].paid += jpy;
    const share = jpy / exp.splitAmong.length;
    exp.splitAmong.forEach((m) => {
      if (perPerson[m]) {
        perPerson[m].owes += share;
        perPerson[m].categories[exp.category] =
          (perPerson[m].categories[exp.category] || 0) + share;
      }
    });
  });

  const balances: Record<string, number> = {};
  members.forEach((m) => (balances[m] = perPerson[m].paid - perPerson[m].owes));

  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];
  members.forEach((m) => {
    if (balances[m] < -0.5) debtors.push({ name: m, amount: -balances[m] });
    else if (balances[m] > 0.5) creditors.push({ name: m, amount: balances[m] });
  });
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: Settlement["transfers"] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].amount, creditors[j].amount);
    if (amt > 0.5)
      transfers.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(amt),
      });
    debtors[i].amount -= amt;
    creditors[j].amount -= amt;
    if (debtors[i].amount < 0.5) i++;
    if (creditors[j].amount < 0.5) j++;
  }

  return { perPerson, transfers, total, balances };
}
