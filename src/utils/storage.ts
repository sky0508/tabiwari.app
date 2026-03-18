import type { Trip } from "../types";

const PREFIX = "tabiwari";

export function saveTrip(trip: Trip): void {
  localStorage.setItem(`${PREFIX}:trip:${trip.id}`, JSON.stringify(trip));
}

export function loadTrip(id: string): Trip | null {
  const raw = localStorage.getItem(`${PREFIX}:trip:${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveTripList(ids: string[]): void {
  localStorage.setItem(`${PREFIX}:trips`, JSON.stringify(ids));
}

export function loadTripList(): string[] {
  const raw = localStorage.getItem(`${PREFIX}:trips`);
  return raw ? JSON.parse(raw) : [];
}

export function deleteTrip(id: string): void {
  localStorage.removeItem(`${PREFIX}:trip:${id}`);
  const ids = loadTripList().filter((x) => x !== id);
  saveTripList(ids);
}
