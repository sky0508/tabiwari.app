import { useState, useEffect } from "react";
import type { Trip, Expense } from "../types";
import { CATEGORIES, CURRENCIES } from "../constants";
import { getMemberColor, formatJPY, genId } from "../constants";
import { S } from "../styles";

interface Props {
  trip: Trip;
  editExpense: Expense | null;
  onBack: () => void;
  onSave: (expense: Expense) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export function ExpenseForm({ trip, editExpense, onBack, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [payer, setPayer] = useState(trip.members[0] || "");
  const [split, setSplit] = useState<string[]>([...trip.members]);
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(todayStr());

  useEffect(() => {
    if (editExpense) {
      setTitle(editExpense.title);
      setAmount(String(editExpense.amount));
      setCurrency(editExpense.currency);
      setPayer(editExpense.payer);
      setSplit([...editExpense.splitAmong]);
      setCategory(editExpense.category);
      setDate(editExpense.date || todayStr());
    }
  }, [editExpense]);

  const foreignCurrency = CURRENCIES.find((c) => c.code === trip.foreignCurrency);
  const foreignSymbol = foreignCurrency?.symbol || "$";

  const toJPY = (amt: number, cur: string) =>
    cur === "JPY" ? amt : amt * (parseFloat(String(trip.exchangeRate)) || 0);

  const canSave =
    title.trim() && parseFloat(amount) > 0 && payer && split.length > 0;

  const handleSave = () => {
    const expense: Expense = {
      id: editExpense?.id || genId(),
      title: title.trim(),
      amount: parseFloat(amount),
      currency,
      payer,
      splitAmong: [...split],
      category,
      timestamp: editExpense?.timestamp || Date.now(),
      date,
    };
    onSave(expense);
  };

  return (
    <div style={S.container}>
      <div style={S.topBar}>
        <button style={S.navBtn} onClick={onBack}>← 戻る</button>
        <div style={S.topTitle}>{editExpense ? "編集" : "支出を追加"}</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={S.card}>
        <label style={S.label}>日付</label>
        <input
          style={S.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label style={{ ...S.label, marginTop: 16 }}>何に使った？</label>
        <input
          style={S.input}
          placeholder="例：カレー、タクシー"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={{ ...S.label, marginTop: 16 }}>カテゴリ</label>
        <div style={S.chipRow}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              style={category === c.id ? S.chipOn : S.chipOff}
              onClick={() => setCategory(c.id)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <label style={{ ...S.label, marginTop: 16 }}>金額</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...S.input, flex: 1, fontSize: 20, fontWeight: 700 }}
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div style={S.currencyToggle}>
            <button
              style={currency === "JPY" ? S.curBtnOn : S.curBtnOff}
              onClick={() => setCurrency("JPY")}
            >
              ¥
            </button>
            <button
              style={currency === trip.foreignCurrency ? S.curBtnOn : S.curBtnOff}
              onClick={() => setCurrency(trip.foreignCurrency)}
            >
              {foreignSymbol}
            </button>
          </div>
        </div>
        {currency !== "JPY" && parseFloat(amount) > 0 && (
          <p style={S.hint}>≈ {formatJPY(toJPY(parseFloat(amount), currency))}</p>
        )}

        <label style={{ ...S.label, marginTop: 16 }}>誰が支払った？</label>
        <div style={S.chipRow}>
          {trip.members.map((m, i) => (
            <button
              key={m}
              style={
                payer === m
                  ? { ...S.chipOn, borderColor: getMemberColor(i), background: getMemberColor(i) }
                  : S.chipOff
              }
              onClick={() => setPayer(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <label style={{ ...S.label, marginTop: 16 }}>誰の分？</label>
        <div style={S.chipRow}>
          <button
            style={split.length === trip.members.length ? S.chipOn : S.chipOff}
            onClick={() =>
              setSplit(split.length === trip.members.length ? [] : [...trip.members])
            }
          >
            全員
          </button>
          {trip.members.map((m, i) => (
            <button
              key={m}
              style={
                split.includes(m)
                  ? { ...S.chipOn, borderColor: getMemberColor(i), background: getMemberColor(i) }
                  : S.chipOff
              }
              onClick={() =>
                setSplit((prev) =>
                  prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                )
              }
            >
              {m}
            </button>
          ))}
        </div>
        {split.length > 0 && parseFloat(amount) > 0 && (
          <p style={S.hint}>
            1人あたり {formatJPY(toJPY(parseFloat(amount), currency) / split.length)}
          </p>
        )}
      </div>

      <button
        style={{ ...S.primaryBtn, opacity: canSave ? 1 : 0.4 }}
        disabled={!canSave}
        onClick={handleSave}
      >
        {editExpense ? "更新する" : "追加する"}
      </button>
    </div>
  );
}
