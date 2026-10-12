export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

/** Turn any RTK Query / fetch error into a readable message. */
export function errMsg(e: any, fallback = "Something went wrong"): string {
    if (!e) return fallback;
    if (e.status === "FETCH_ERROR") {
        return `Cannot reach the server at ${API_URL}. Is the backend running and is EXPO_PUBLIC_API_URL correct?`;
    }
    if (e.status === "PARSING_ERROR") return "Unexpected response from server";
    const d = e.data;
    if (d) {
        if (typeof d === "string") return d;
        if (d.message && d.error && d.error !== d.message) return `${d.message}: ${d.error}`;
        if (d.message) return d.message;
        if (d.error) return d.error;
    }
    if (e.message) return e.message;
    return fallback;
}
