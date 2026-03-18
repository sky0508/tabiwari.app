import { useRef } from "react";
import type { Trip } from "../types";
import { computeSettlement } from "../utils/settlement";
import { importCSV } from "../utils/csv";
import { saveTrip, saveTripList, loadTripList } from "../utils/storage";
import { getMemberColor, getInitial, formatJPY, genId } from "../constants";
import { S } from "../styles";

interface Props {
  trips: Record<string, Trip>;
  tripIds: string[];
  onOpenTrip: (id: string) => void;
  onCreate: () => void;
  onTripsUpdate: (ids: string[], tripsMap: Record<string, Trip>) => void;
}

export function Home({ trips, tripIds, onOpenTrip, onCreate, onTripsUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importCSV(text);
      if (!result) { alert("CSVの読み込みに失敗しました"); return; }
      const id = genId();
      const newTrip: Trip = {
        id,
        name: result.trip.name || "インポートしたトリップ",
        members: result.trip.members || [],
        foreignCurrency: result.trip.foreignCurrency || "USD",
        exchangeRate: result.trip.exchangeRate || 0,
        expenses: result.expenses,
        createdAt: Date.now(),
      };
      saveTrip(newTrip);
      const newIds = [...loadTripList(), id];
      saveTripList(newIds);
      onTripsUpdate(newIds, { ...trips, [id]: newTrip });
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  return (
    <div style={S.container}>
      <div style={S.heroSection}>
        <div style={S.heroIcon}>✈</div>
        <h1 style={S.heroTitle}>TabiWari</h1>
        <p style={S.heroSub}>旅の割り勘、みんなでスマートに</p>
      </div>

      {tripIds.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={S.sectionTitle}>マイトリップ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tripIds.map((id) => {
              const t = trips[id];
              if (!t) return null;
              const s = computeSettlement(t);
              return (
                <button key={id} style={S.tripCard} onClick={() => onOpenTrip(id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={S.tripCardName}>{t.name}</div>
                      <div style={S.tripCardMeta}>
                        {t.members.length}人 · {t.foreignCurrency}
                      </div>
                    </div>
                    <div style={S.tripCardAmount}>{formatJPY(s.total)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {t.members.map((m, i) => (
                      <div key={m} style={{ ...S.avatarTiny, background: getMemberColor(i) }}>
                        {getInitial(m)}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button style={S.createTripBtn} onClick={onCreate}>
        <span style={{ fontSize: 24 }}>+</span>
        <span>新しいトリップを作成</span>
      </button>

      <div style={{ marginTop: 12 }}>
        <button style={{ ...S.exportBtn, width: "100%", padding: "10px 0" }} onClick={() => fileRef.current?.click()}>
          📂 CSVからインポート
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleImport} />
      </div>
    </div>
  );
}
