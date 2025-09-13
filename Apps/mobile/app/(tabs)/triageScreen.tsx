import React from "react";
import { SafeAreaView, Alert } from "react-native";
import TriageScreen from "../../src/ai/triage/SymptomChips";

// Replace this with your real navigation to booking flow
function routeToBooking(specialtyId: string, specialtyLabel: string) {
    Alert.alert("Booking", `Go to booking flow for ${specialtyLabel} (${specialtyId})`);
    // Example if you have navigation:
    // navigation.navigate("Booking", { specialtyId, specialtyLabel });
}

export default function TriageScreen1() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f7faf9" }}>
            <TriageScreen onBook={routeToBooking} />
        </SafeAreaView>
    );
}