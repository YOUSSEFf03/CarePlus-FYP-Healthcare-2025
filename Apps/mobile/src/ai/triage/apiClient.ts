import { Platform } from "react-native";
import { triage as localTriage } from "../../../../ai-triage/src/engine";
import type { TriageRequest, TriageResponse } from "../../../../ai-triage/src/types";

// Adjust for Android emulator
const DEFAULT_DEV_URL =
    Platform.OS === "android" ? "http://192.168.50.189:4015" : "http://localhost:4015";

const AI_BASE =
    // Prefer env if you have Expo or your RN env setup
    process.env.EXPO_PUBLIC_AI_URL ||
    process.env.AI_TRIAGE_URL ||
    DEFAULT_DEV_URL;

export async function triageAPI(payload: TriageRequest): Promise<TriageResponse> {
    try {
        const res = await fetch(`${AI_BASE}/triage/recommendations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch {
        // Fallback: on-device engine
        return localTriage(payload);
    }
}