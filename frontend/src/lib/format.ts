export const fullName = (p?: { first_name?: string; last_name?: string }) =>
    p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() : "";

export const dateOnly = (iso?: string) => (iso ? iso.slice(0, 10) : "");

export const todayStr = () => {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
};

/** "2026-10-08" is a real calendar date? */
export const isValidDate = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

export const isValidTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** date string -> ISO date-time the Go backend (time.Time) accepts */
export const toISO = (date: string) => `${date}T00:00:00Z`;

export const isEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);

export const money = (n?: number) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "-");

export const apptKey = (a: { appointment_date: string; appointment_time: string }) =>
    `${dateOnly(a.appointment_date)} ${a.appointment_time || ""}`;
