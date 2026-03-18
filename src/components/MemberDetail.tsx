import type { Trip, Settlement } from "../types";
import { CATEGORIES } from "../constants";
import { getMemberColor, getInitial, formatJPY } from "../constants";
import { S } from "../styles";

interface Props {
  trip: Trip;
  memberName: string;
  settlement: Settlement;
  onBack: () => void;
}

export function MemberDetail({ trip, memberName, settlement, onBack }: Props) {
  const data = settlement.perPerson[memberName];
  const bal = settlement.balances?.[memberName] || 0;
  const mi = trip.members.indexOf(memberName);
  const memberExp = trip.expenses.filter(
    (e) => e.payer === memberName || e.splitAmong.includes(memberName)
  );
  const myTransfers = settlement.transfers.filter(
    (t) => t.from === memberName || t.to === memberName
  );

  const foreignSymbol =
    trip.foreignCurrency
      ? (["USD","EUR","GBP","KRW","TWD","THB","AUD","SGD","CNY","PHP","VND","IDR","MYR","INR"].indexOf(trip.foreignCurrency) >= 0
        ? trip.foreignCurrency
        : "$")
      : "$";

  const toJPY = (amt: number, cur: string) =>
    cur === "JPY" ? amt : amt * (parseFloat(String(trip.exchangeRate)) || 0);

  return (
    <div style={S.container}>
      <div style={S.topBar}>
        <button style={S.navBtn} onClick={onBack}>← 戻る</button>
        <div style={S.topTitle}>メンバー詳細</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ ...S.avatarLg, background: getMemberColor(mi), margin: "0 auto 10px" }}>
          {getInitial(memberName)}
        </div>
        <h2 style={{ margin: 0, fontSize: 22, color: "#3A3228" }}>{memberName}</h2>
        <div
          style={{
            marginTop: 8,
            fontSize: 26,
            fontWeight: 800,
            color: bal > 0.5 ? "#2D7A4F" : bal < -0.5 ? "#C25E4A" : "#8B7E6A",
          }}
        >
          {bal > 0.5 ? `+${formatJPY(bal)}` : bal < -0.5 ? `-${formatJPY(-bal)}` : "± ¥0"}
        </div>
        <div style={{ fontSize: 12, color: "#8B7E6A", marginTop: 2 }}>
          {bal > 0.5 ? "受け取り" : bal < -0.5 ? "支払い" : "精算済み"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={S.statBox}>
          <div style={S.statLabel}>立替額</div>
          <div style={S.statValue}>{formatJPY(data?.paid || 0)}</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statLabel}>負担額</div>
          <div style={S.statValue}>{formatJPY(data?.owes || 0)}</div>
        </div>
      </div>

      {myTransfers.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>💸 精算アクション</h3>
          {myTransfers.map((t, i) => (
            <div key={i} style={S.transferRow}>
              <span style={{ fontWeight: 700, color: t.from === memberName ? "#C25E4A" : "#2D7A4F" }}>
                {t.from === memberName ? `→ ${t.to} に支払う` : `← ${t.from} から受け取る`}
              </span>
              <span style={{ fontWeight: 700 }}>{formatJPY(t.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <h3 style={S.cardTitle}>📊 カテゴリ別負担</h3>
        {data &&
          CATEGORIES.filter((c) => (data.categories[c.id] || 0) > 0.5).map((cat) => {
            const amt = data.categories[cat.id];
            const pct = data.owes > 0 ? (amt / data.owes) * 100 : 0;
            return (
              <div key={cat.id} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 3,
                  }}
                >
                  <span>{cat.emoji} {cat.label}</span>
                  <span style={{ fontWeight: 600 }}>{formatJPY(amt)}</span>
                </div>
                <div style={S.barBg}>
                  <div
                    style={{
                      ...S.barFill,
                      width: `${Math.max(pct, 3)}%`,
                      background: getMemberColor(mi),
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      <div style={S.card}>
        <h3 style={S.cardTitle}>📝 関連する支出</h3>
        {memberExp.map((exp) => {
          const cat = CATEGORIES.find((c) => c.id === exp.category);
          return (
            <div key={exp.id} style={S.expListItem}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12 }}>{cat?.emoji}</span>{" "}
                <span style={{ fontWeight: 600, fontSize: 14 }}>{exp.title}</span>
                <div style={{ fontSize: 11, color: "#8B7E6A", marginTop: 1 }}>
                  {exp.payer === memberName ? "立替" : "割り勘"} · {exp.splitAmong.length}人
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {exp.currency === "JPY"
                    ? formatJPY(exp.amount)
                    : foreignSymbol + exp.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                {exp.currency !== "JPY" && (
                  <div style={{ fontSize: 11, color: "#8B7E6A" }}>
                    ≈ {formatJPY(toJPY(exp.amount, exp.currency))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {memberExp.length === 0 && (
          <p style={{ color: "#8B7E6A", fontSize: 13, margin: 0 }}>関連する支出はありません</p>
        )}
      </div>
    </div>
  );
}
