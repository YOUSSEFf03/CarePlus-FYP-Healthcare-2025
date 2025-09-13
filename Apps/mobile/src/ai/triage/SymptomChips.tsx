// Apps/mobile/src/ai/triage/SymptomChips.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert,
    SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import CustomText from "@/components/CustomText";
import Button from "@/components/Button";
import { colors, spacing, radius, shadow } from "@/styles/tokens";
import { SYMPTOMS } from "../../../../ai-triage/src/ontology";
import { triageAPI } from "./apiClient";
import type { SymptomInput, TriageResponse } from "../../../../ai-triage/src/types";
import { useUser } from "../../store/UserContext";

type PatientCtx = { age: number; sex: "male" | "female" | "unknown" };

type Message =
    | { id: string; role: "user"; text: string }
    | { id: string; role: "ai"; text?: string; loading?: boolean; result?: TriageResponse };

type Props = { onBook?: (specialtyId: string, specialtyLabel: string) => void };

function Chip({
    label, selected, onPress, removable,
}: { label: string; selected?: boolean; onPress?: () => void; removable?: boolean }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={{
                paddingVertical: spacing[6],
                paddingHorizontal: spacing[12],
                borderWidth: selected ? 0 : 1,
                borderColor: selected ? "transparent" : colors.neutral300,
                backgroundColor: selected ? colors.primary : colors.white,
                borderRadius: radius.r8,                // <- r8 everywhere
                marginRight: spacing[8],
                marginBottom: spacing[8],
                ...shadow(0),
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <CustomText
                variant="text-body-sm-sb"
                style={{ color: selected ? colors.white : colors.black }}
            >
                {label}
            </CustomText>
            {removable && (
                <CustomText
                    variant="text-body-sm-m"
                    style={{ marginLeft: spacing[6], color: selected ? colors.secondary05 : colors.neutral700 }}
                >
                    ×
                </CustomText>
            )}
        </TouchableOpacity>
    );
}

function Bubble({ role, children }: { role: "ai" | "user"; children: React.ReactNode }) {
    const isUser = role === "user";
    return (
        <View
            style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                backgroundColor: isUser ? colors.primary : colors.white,
                borderWidth: isUser ? 0 : 1,
                borderColor: colors.neutral200,
                padding: spacing[12],
                maxWidth: "86%",
                borderRadius: radius.r8,
                marginVertical: spacing[6],
                ...shadow(0),
            }}
        >
            <CustomText
                variant="text-body-md-r"
                style={{ color: isUser ? colors.white : colors.black, lineHeight: 20 }}
            >
                {children}
            </CustomText>
        </View>
    );
}

function TypingDots() {
    const [dots, setDots] = useState(".");
    useEffect(() => {
        const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 420);
        return () => clearInterval(id);
    }, []);
    return <CustomText variant="text-body-md-m">Analyzing{dots}</CustomText>;
}

export default function TriageScreen({ onBook }: Props) {
    const { user } = useUser();
    const ctx: PatientCtx = user ? { age: user.age, sex: user.sex } : { age: 30, sex: "unknown" };

    // chat
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "intro",
            role: "ai",
            text:
                "Hi! I’m FYP Health AI. Describe your symptoms and I’ll suggest the right doctor specialty. (This isn’t a diagnosis.)",
        },
    ]);
    const listRef = useRef<FlatList>(null);
    const [submitting, setSubmitting] = useState(false);

    // input & chips tray
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<SymptomInput[]>([]);
    const [focused, setFocused] = useState(false);

    // suggestions (top-12 or filtered)
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return SYMPTOMS.slice(0, 12);
        return SYMPTOMS.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 12);
    }, [query]);

    function toggle(sym: { id: string; label: string }) {
        setSelected((prev) => {
            const exists = prev.find((s) => s.id === sym.id);
            return exists ? prev.filter((s) => s.id !== sym.id) : [...prev, { id: sym.id, label: sym.label }];
        });
    }

    useEffect(() => {
        listRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    async function submit() {
        if (!selected.length || submitting) return;
        setSubmitting(true);

        const userText = `Symptoms: ${selected.map((s) => s.label).join(", ")}`;
        setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", text: userText }]);

        const loadingId = `${Date.now()}-ai-loading`;
        setMessages((prev) => [...prev, { id: loadingId, role: "ai", loading: true }]);

        try {
            const res = await triageAPI({ context: ctx, symptoms: selected });

            if (res.advice.level === "er") {
                Alert.alert(
                    "Urgent advice",
                    "Your answers suggest you may need urgent evaluation. If symptoms are severe or worsening, seek emergency care immediately."
                );
            }

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === loadingId ? ({ id: `${Date.now()}-ai`, role: "ai", result: res } as Message) : m
                )
            );
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === loadingId
                        ? { id: `${Date.now()}-ai`, role: "ai", text: "I couldn’t analyze right now. Please try again." }
                        : m
                )
            );
        } finally {
            setSubmitting(false);
        }
    }

    function clearAll() {
        setSelected([]);
        setQuery("");
    }

    function renderMessage({ item }: { item: Message }) {
        if (item.role === "ai" && item.loading) {
            return (
                <Bubble role="ai">
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[8] }}>
                        <ActivityIndicator />
                        <TypingDots />
                    </View>
                </Bubble>
            );
        }
        if (item.role === "ai" && item.result) {
            const res = item.result;
            const top = res.specialties[0];
            return (
                <Bubble role="ai">
                    <View style={{ gap: spacing[6] }}>
                        <CustomText variant="text-body-md-sb">
                            Advice: {res.advice.level.toUpperCase()}
                        </CustomText>
                        {res.advice.rationale.map((r, i) => (
                            <CustomText key={i} variant="text-body-md-r">• {r}</CustomText>
                        ))}

                        <View style={{ marginTop: spacing[6] }}>
                            <CustomText variant="text-body-md-sb" style={{ marginBottom: spacing[6] }}>
                                Suggested specialties
                            </CustomText>
                            {res.specialties.slice(0, 5).map((s) => (
                                <CustomText key={s.specialtyId} variant="text-body-md-r">
                                    {s.label} — {Math.round(s.score * 100)}%
                                </CustomText>
                            ))}

                            {top && top.specialtyId !== "gp" && (
                                <Button
                                    text={`Book ${top.label}`}
                                    variant="primary"
                                    onPress={() => onBook?.(top.specialtyId, top.label)}
                                    style={{ marginTop: spacing[12] }}
                                />
                            )}
                        </View>
                    </View>
                </Bubble>
            );
        }
        return <Bubble role={item.role}>{item.text}</Bubble>;
    }

    const showTray = focused || !!query || selected.length > 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral202 }}>
            {/* Header with AI name (top-left) */}
            <View style={{ paddingHorizontal: spacing[16], paddingTop: spacing[12], paddingBottom: spacing[8] }}>
                <CustomText variant="text-heading-H3" style={{ color: colors.primary }}>
                    FYP Health AI
                </CustomText>
                <CustomText variant="text-body-sm-r" style={{ color: colors.neutral700 }}>
                    Find the right specialist fast
                </CustomText>
            </View>

            {/* Chat list */}
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={renderMessage}
                contentContainerStyle={{ paddingHorizontal: spacing[16], paddingBottom: spacing[16], paddingTop: spacing[4] }}
                style={{ flex: 1 }}
            />

            {/* Composer + Chips tray (tray ABOVE input) */}
            <KeyboardAvoidingView
                style={{ width: "100%" }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            >
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderTopWidth: 1,
                        borderTopColor: colors.neutral200,
                        paddingTop: spacing[10],
                        paddingBottom: spacing[16],
                        paddingHorizontal: spacing[12],
                    }}
                >
                    {/* Chips tray */}
                    {showTray && (
                        <View
                            style={{
                                marginBottom: spacing[8],
                                backgroundColor: colors.neutral201,
                                borderRadius: radius.r8,
                                paddingVertical: spacing[8],
                                paddingHorizontal: spacing[8],
                            }}
                        >
                            {/* Selected chips (removable) */}
                            {!!selected.length && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[6] }}>
                                    <View style={{ flexDirection: "row" }}>
                                        {selected.map((s) => (
                                            <Chip
                                                key={s.id}
                                                label={s.label}
                                                selected
                                                removable
                                                onPress={() => toggle({ id: s.id, label: s.label })}
                                            />
                                        ))}
                                    </View>
                                </ScrollView>
                            )}

                            {/* Suggestions */}
                            <CustomText variant="text-body-sm-r" style={{ color: colors.neutral700, marginBottom: spacing[6] }}>
                                {query ? "Suggestions" : "Common symptoms"}
                            </CustomText>
                            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                {filtered.map((s) => {
                                    const isSel = !!selected.find((x) => x.id === s.id);
                                    return <Chip key={s.id} label={s.label} selected={isSel} onPress={() => toggle(s)} />;
                                })}
                            </View>

                            <View style={{ alignItems: "flex-end", marginTop: spacing[6] }}>
                                <TouchableOpacity onPress={() => { setQuery(""); setFocused(false); }}>
                                    <CustomText variant="text-body-sm-m" style={{ color: colors.primary }}>
                                        Hide
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Input row (alone) */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[8] }}>
                        <TextInput
                            placeholder="Describe a symptom (e.g., Chest pain)"
                            value={query}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            onChangeText={setQuery}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: colors.neutral300,
                                borderRadius: radius.r8,
                                paddingHorizontal: spacing[14],
                                paddingVertical: spacing[10],
                                backgroundColor: colors.white,
                            }}
                        />
                        <Button
                            text={submitting ? "" : "Analyze"}
                            loading={submitting}
                            disabled={!selected.length || submitting}
                            onPress={submit}
                        />
                    </View>

                    {/* Footer actions */}
                    <View style={{ marginTop: spacing[10], flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity onPress={clearAll}>
                            <CustomText variant="text-body-sm-sb" style={{ color: colors.primary }}>
                                Clear
                            </CustomText>
                        </TouchableOpacity>
                        <CustomText variant="text-body-xs-r" style={{ color: colors.neutral700 }}>
                            Not a diagnosis. Seek urgent care for severe symptoms.
                        </CustomText>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}