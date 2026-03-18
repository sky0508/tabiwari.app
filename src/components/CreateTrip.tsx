import { useState } from "react";
import type { Trip } from "../types";
import { CURRENCIES } from "../constants";
import { getMemberColor, getInitial, genId } from "../constants";
import { S } from "../styles";

interface Props {
  onBack: () => void;
  onCreated: (trip: Trip) => void;
}

export function CreateTrip({ onBack, onCreated }: Props) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState(["", ""]);
  const [currency, setCurrency] = useState<{ code: string; symbol: string; name: string }>(CURRENCIES[0]);
  const [rate, setRate] = useState("");

  const validMembers = members.filter((m) => m.trim());
  const canCreate = name.trim() && validMembers.length >= 2 && parseFloat(rate) > 0;

  const handleCreate = () => {
    const trip: Trip = {
      id: genId(),
      name: name.trim(),
      members: validMembers,
      foreignCurrency: currency.code,
      exchangeRate: parseFloat(rate),
      expenses: [],
      createdAt: Date.now(),
    };
    onCreated(trip);
  };

  return (
    <div style={S.container}>
      <div style={S.topBar}>
        <button style={S.navBtn} onClick={onBack}>← 戻る</button>
        <div style={S.topTitle}>新しいトリップ</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={S.card}>
        <label style={S.label}>トリップ名</label>
        <input
          style={S.input}
          placeholder="例：インド旅行 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div style={S.card}>
        <label style={S.label}>メンバー</label>
        {members.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <div style={{ ...S.avatarTiny, background: getMemberColor(i), flexShrink: 0 }}>
              {m.trim() ? getInitial(m) : i + 1}
            </div>
            <input
              style={{ ...S.input, flex: 1 }}
              placeholder={`メンバー ${i + 1}`}
              value={m}
              onChange={(e) => {
                const next = [...members];
                next[i] = e.target.value;
                setMembers(next);
              }}
            />
            {members.length > 2 && (
              <button
                style={S.iconBtn}
                onClick={() => setMembers(members.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button style={S.dashedBtn} onClick={() => setMembers([...members, ""])}>
          + メンバー追加
        </button>
      </div>

      <div style={S.card}>
        <label style={S.label}>現地通貨</label>
        <select
          style={S.select}
          value={currency.code}
          onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value)!)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </option>
          ))}
        </select>
        <label style={{ ...S.label, marginTop: 14 }}>
          為替レート（1 {currency.code} = ? 円）
        </label>
        <input
          style={S.input}
          type="number"
          placeholder="例: 150"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        {parseFloat(rate) > 0 && (
          <p style={S.hint}>
            {currency.symbol}100 ≈ ¥{(100 * parseFloat(rate)).toLocaleString()}
          </p>
        )}
      </div>

      <button
        style={{ ...S.primaryBtn, opacity: canCreate ? 1 : 0.4 }}
        disabled={!canCreate}
        onClick={handleCreate}
      >
        トリップを作成 →
      </button>
    </div>
  );
}
