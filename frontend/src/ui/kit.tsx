import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export const C = {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    bg: "#F8FAFC",
    card: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    muted: "#64748B",
    danger: "#DC2626",
    success: "#16A34A",
    warn: "#D97706",
};

export const toast = {
    ok: (text: string) => Toast.show({ type: "success", text1: text }),
    err: (text: string) => Toast.show({ type: "error", text1: "Error", text2: text, visibilityTime: 5000 }),
};

// ---------------------------------------------------------------- Buttons
export function Btn({
    title,
    onPress,
    variant = "primary",
    loading,
    disabled,
    small,
}: {
    title: string;
    onPress: () => void;
    variant?: "primary" | "outline" | "danger" | "ghost";
    loading?: boolean;
    disabled?: boolean;
    small?: boolean;
}) {
    const bg =
        variant === "primary" ? C.primary : variant === "danger" ? C.danger : "transparent";
    const color = variant === "primary" || variant === "danger" ? "#fff" : variant === "ghost" ? C.primary : C.primary;
    const borderColor = variant === "outline" ? C.primary : variant === "ghost" ? "transparent" : bg;
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                s.btn,
                small && s.btnSmall,
                { backgroundColor: bg, borderColor, opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1 },
            ]}
        >
            {loading ? (
                <ActivityIndicator color={color} size="small" />
            ) : (
                <Text style={[s.btnText, small && { fontSize: 13 }, { color }]}>{title}</Text>
            )}
        </Pressable>
    );
}

// ---------------------------------------------------------------- Layout bits
export function Card({ children, onPress }: { children: any; onPress?: () => void }) {
    if (onPress) {
        return (
            <Pressable onPress={onPress} style={s.card}>
                {children}
            </Pressable>
        );
    }
    return <View style={s.card}>{children}</View>;
}

export function Badge({ text, tone = "gray" }: { text: string; tone?: "green" | "red" | "blue" | "amber" | "gray" }) {
    const map: any = {
        green: ["#DCFCE7", "#166534"],
        red: ["#FEE2E2", "#991B1B"],
        blue: ["#DBEAFE", "#1E40AF"],
        amber: ["#FEF3C7", "#92400E"],
        gray: ["#E2E8F0", "#334155"],
    };
    return (
        <View style={[s.badge, { backgroundColor: map[tone][0] }]}>
            <Text style={[s.badgeText, { color: map[tone][1] }]}>{text}</Text>
        </View>
    );
}

export const statusTone = (st: string) =>
    st === "Completed" ? "green" : st === "Cancelled" ? "red" : st === "Confirmed" ? "blue" : "amber";

export function Loading() {
    return (
        <View style={s.center}>
            <ActivityIndicator size="large" color={C.primary} />
        </View>
    );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <View style={s.errBox}>
            <Text style={{ color: C.danger, marginBottom: 8 }}>{message}</Text>
            {onRetry ? <Btn title="Retry" onPress={onRetry} small variant="outline" /> : null}
        </View>
    );
}

export function Empty({ text }: { text: string }) {
    return (
        <View style={s.center}>
            <Text style={{ color: C.muted, textAlign: "center" }}>{text}</Text>
        </View>
    );
}

export function SectionTitle({ children, right }: { children: any; right?: any }) {
    return (
        <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>{children}</Text>
            {right}
        </View>
    );
}

export function Row({ label, value }: { label: string; value?: string | number }) {
    return (
        <View style={{ flexDirection: "row", marginTop: 4 }}>
            <Text style={{ width: 110, color: C.muted, fontSize: 13 }}>{label}</Text>
            <Text style={{ flex: 1, color: C.text, fontSize: 13 }}>{value === undefined || value === "" ? "-" : value}</Text>
        </View>
    );
}

// ---------------------------------------------------------------- Inputs
export function Field({
    label,
    error,
    ...props
}: { label: string; error?: string } & TextInputProps) {
    return (
        <View style={{ marginTop: 12 }}>
            <Text style={s.label}>{label}</Text>
            <TextInput
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                {...props}
                style={[s.input, props.editable === false && { backgroundColor: "#F1F5F9", color: C.muted }, props.style]}
            />
            {error ? <Text style={{ color: C.danger, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
        </View>
    );
}

export function SearchBox({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || "Search..."}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            style={[s.input, { marginBottom: 10, backgroundColor: "#fff" }]}
        />
    );
}

export function Chips({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, flexGrow: 0 }}>
            {options.map((o) => (
                <Pressable
                    key={o}
                    onPress={() => onChange(o)}
                    style={[s.chip, value === o && { backgroundColor: C.primary, borderColor: C.primary }]}
                >
                    <Text style={{ color: value === o ? "#fff" : C.text, fontSize: 13 }}>{o}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

/** Tap-to-pick dropdown implemented with a modal list (works on web + native). */
export function SelectField({
    label,
    value,
    options,
    onChange,
    placeholder = "Select...",
    error,
}: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);
    return (
        <View style={{ marginTop: 12 }}>
            <Text style={s.label}>{label}</Text>
            <Pressable onPress={() => setOpen(true)} style={[s.input, { justifyContent: "center" }]}>
                <Text style={{ color: selected ? C.text : "#94A3B8" }}>{selected ? selected.label : placeholder}</Text>
            </Pressable>
            {error ? <Text style={{ color: C.danger, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={s.overlay} onPress={() => setOpen(false)}>
                    <View style={[s.sheet, { maxHeight: "70%" }]}>
                        <Text style={s.sheetTitle}>{label}</Text>
                        <ScrollView>
                            {options.length === 0 ? <Empty text="Nothing to choose from yet." /> : null}
                            {options.map((o) => (
                                <Pressable
                                    key={o.value}
                                    onPress={() => {
                                        onChange(o.value);
                                        setOpen(false);
                                    }}
                                    style={[s.option, o.value === value && { backgroundColor: "#EFF6FF" }]}
                                >
                                    <Text style={{ color: C.text }}>{o.label}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

// ---------------------------------------------------------------- Modals
export function FormModal({
    visible,
    title,
    onClose,
    onSubmit,
    submitText = "Save",
    loading,
    error,
    children,
}: {
    visible: boolean;
    title: string;
    onClose: () => void;
    onSubmit?: () => void;
    submitText?: string;
    loading?: boolean;
    error?: string;
    children: any;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={s.overlay}
            >
                <View style={[s.sheet, { maxHeight: "92%" }]}>
                    <Text style={s.sheetTitle}>{title}</Text>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {children}
                        {error ? (
                            <Text style={{ color: C.danger, marginTop: 12 }}>{error}</Text>
                        ) : null}
                    </ScrollView>
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                        <View style={{ flex: 1 }}>
                            <Btn title={onSubmit ? "Cancel" : "Close"} variant="outline" onPress={onClose} />
                        </View>
                        {onSubmit ? (
                            <View style={{ flex: 1 }}>
                                <Btn title={submitText} onPress={onSubmit} loading={loading} />
                            </View>
                        ) : null}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = "Confirm",
    danger,
    loading,
    onConfirm,
    onCancel,
}: {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={[s.overlay, { justifyContent: "center", padding: 24 }]}>
                <View style={[s.sheet, { borderRadius: 16 }]}>
                    <Text style={s.sheetTitle}>{title}</Text>
                    <Text style={{ color: C.muted, marginBottom: 16 }}>{message}</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Btn title="Cancel" variant="outline" onPress={onCancel} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Btn title={confirmText} variant={danger ? "danger" : "primary"} onPress={onConfirm} loading={loading} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ---------------------------------------------------------------- styles
const s = StyleSheet.create({
    btn: {
        height: 46,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    btnSmall: { height: 36, borderRadius: 10, paddingHorizontal: 12 },
    btnText: { fontSize: 15, fontWeight: "700" },
    card: {
        backgroundColor: C.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        marginBottom: 12,
    },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start" },
    badgeText: { fontSize: 12, fontWeight: "700" },
    center: { padding: 32, alignItems: "center", justifyContent: "center" },
    errBox: {
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    sectionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 10,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: C.text },
    label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 },
    input: {
        height: 46,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 10,
        paddingHorizontal: 12,
        color: C.text,
        backgroundColor: "#fff",
    },
    chip: {
        paddingHorizontal: 14,
        height: 34,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "flex-end" },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        width: "100%",
        maxWidth: 560,
        alignSelf: "center",
    },
    sheetTitle: { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 6 },
    option: { paddingVertical: 14, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
});
