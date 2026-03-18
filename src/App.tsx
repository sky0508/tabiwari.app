import { useState, useMemo } from "react";
import type { Trip, Expense } from "./types";
import { computeSettlement } from "./utils/settlement";
import { saveTrip, loadTrip, saveTripList, loadTripList } from "./utils/storage";
import { Home } from "./components/Home";
import { CreateTrip } from "./components/CreateTrip";
import { Dashboard } from "./components/Dashboard";
import { ExpenseForm } from "./components/ExpenseForm";
import { MemberDetail } from "./components/MemberDetail";

type Screen = "home" | "create" | "dashboard" | "expense" | "member";

function loadAllTrips(): { ids: string[]; tripsMap: Record<string, Trip> } {
  const ids = loadTripList();
  const tripsMap: Record<string, Trip> = {};
  for (const id of ids) {
    const t = loadTrip(id);
    if (t) tripsMap[id] = t;
  }
  return { ids, tripsMap };
}

export default function App() {
  const initial = useMemo(() => loadAllTrips(), []);
  const [tripIds, setTripIds] = useState<string[]>(initial.ids);
  const [tripsMap, setTripsMap] = useState<Record<string, Trip>>(initial.tripsMap);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [focusMember, setFocusMember] = useState<string | null>(null);

  const trip = currentId ? tripsMap[currentId] : null;
  const settlement = useMemo(() => (trip ? computeSettlement(trip) : null), [trip]);

  const updateTrip = (updater: (t: Trip) => Trip) => {
    if (!currentId) return;
    setTripsMap((prev) => {
      const updated = updater(prev[currentId]);
      saveTrip(updated);
      return { ...prev, [currentId]: updated };
    });
  };

  const handleTripCreated = (newTrip: Trip) => {
    saveTrip(newTrip);
    const newIds = [...tripIds, newTrip.id];
    saveTripList(newIds);
    setTripIds(newIds);
    setTripsMap((prev) => ({ ...prev, [newTrip.id]: newTrip }));
    setCurrentId(newTrip.id);
    setScreen("dashboard");
  };

  const handleSaveExpense = (expense: Expense) => {
    updateTrip((t) => ({
      ...t,
      expenses: editExpense
        ? t.expenses.map((e) => (e.id === editExpense.id ? expense : e))
        : [...t.expenses, expense],
    }));
    setEditExpense(null);
    setScreen("dashboard");
  };

  const handleDeleteExpense = (id: string) => {
    updateTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== id) }));
  };

  if (screen === "home") {
    return (
      <Home
        trips={tripsMap}
        tripIds={tripIds}
        onOpenTrip={(id) => { setCurrentId(id); setScreen("dashboard"); }}
        onCreate={() => setScreen("create")}
        onTripsUpdate={(ids, map) => { setTripIds(ids); setTripsMap(map); }}
      />
    );
  }

  if (screen === "create") {
    return (
      <CreateTrip
        onBack={() => setScreen("home")}
        onCreated={handleTripCreated}
      />
    );
  }

  if (!trip || !settlement) {
    setScreen("home");
    return null;
  }

  if (screen === "expense") {
    return (
      <ExpenseForm
        trip={trip}
        editExpense={editExpense}
        onBack={() => { setEditExpense(null); setScreen("dashboard"); }}
        onSave={handleSaveExpense}
      />
    );
  }

  if (screen === "member" && focusMember) {
    return (
      <MemberDetail
        trip={trip}
        memberName={focusMember}
        settlement={settlement}
        onBack={() => { setFocusMember(null); setScreen("dashboard"); }}
      />
    );
  }

  return (
    <Dashboard
      trip={trip}
      settlement={settlement}
      onBack={() => { setCurrentId(null); setScreen("home"); }}
      onAddExpense={() => { setEditExpense(null); setScreen("expense"); }}
      onEditExpense={(exp) => { setEditExpense(exp); setScreen("expense"); }}
      onDeleteExpense={handleDeleteExpense}
      onOpenMember={(name) => { setFocusMember(name); setScreen("member"); }}
    />
  );
}
