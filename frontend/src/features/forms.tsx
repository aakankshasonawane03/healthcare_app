import { useEffect, useState } from "react";
import { errMsg } from "@/lib/api";
import { dateOnly, isEmail, isValidDate, todayStr, toISO } from "@/lib/format";
import { Doctor, useCreateDoctorMutation, useUpdateDoctorMutation } from "@/redux/slices/doctorApiSlice";
import { Patient, useCreatePatientMutation, useUpdatePatientMutation } from "@/redux/slices/patientApiSlice";
import { Field, FormModal, SelectField, toast } from "@/ui/kit";

const ACTIVE_OPTS = [
    { label: "Active", value: "yes" },
    { label: "Inactive", value: "no" },
];

// ------------------------------------------------------------------ Doctor
export function DoctorForm({
    visible,
    onClose,
    editing,
    prefillEmail,
    prefillName,
    allowStatus,
    title,
}: {
    visible: boolean;
    onClose: () => void;
    editing?: Doctor | null;
    prefillEmail?: string; // when set, email is fixed (used by "complete my profile")
    prefillName?: string;
    allowStatus?: boolean;
    title?: string;
}) {
    const [createDoctor, { isLoading: creating }] = useCreateDoctorMutation();
    const [updateDoctor, { isLoading: updating }] = useUpdateDoctorMutation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [spec, setSpec] = useState("");
    const [qual, setQual] = useState("");
    const [exp, setExp] = useState("");
    const [fee, setFee] = useState("");
    const [active, setActive] = useState("yes");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!visible) return;
        setError("");
        setName(editing?.name ?? prefillName ?? "");
        setEmail(editing?.email ?? prefillEmail ?? "");
        setPhone(editing?.phone ?? "");
        setSpec(editing?.specialization ?? "");
        setQual(editing?.qualification ?? "");
        setExp(editing ? String(editing.experience) : "");
        setFee(editing ? String(editing.consultation_fee) : "");
        setActive(editing ? (editing.is_active ? "yes" : "no") : "yes");
    }, [visible, editing]);

    const submit = async () => {
        setError("");
        const experience = Number(exp);
        const consultation_fee = Number(fee);
        if (!name.trim()) return setError("Name is required.");
        if (!isEmail(email.trim())) return setError("Enter a valid email.");
        if (!phone.trim()) return setError("Phone is required.");
        if (!spec.trim()) return setError("Specialization is required.");
        if (!qual.trim()) return setError("Qualification is required.");
        if (!Number.isInteger(experience) || experience < 1) return setError("Experience must be a whole number of years (1 or more).");
        if (!(consultation_fee > 0)) return setError("Consultation fee must be greater than 0.");

        try {
            if (editing) {
                await updateDoctor({
                    id: editing.id,
                    name: name.trim(),
                    phone: phone.trim(),
                    specialization: spec.trim(),
                    qualification: qual.trim(),
                    experience,
                    consultation_fee,
                    is_active: allowStatus ? active === "yes" : editing.is_active,
                }).unwrap();
                toast.ok("Doctor updated");
            } else {
                await createDoctor({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    specialization: spec.trim(),
                    qualification: qual.trim(),
                    experience,
                    consultation_fee,
                }).unwrap();
                toast.ok("Doctor created");
            }
            onClose();
        } catch (e) {
            setError(errMsg(e));
        }
    };

    return (
        <FormModal
            visible={visible}
            title={title || (editing ? "Edit doctor" : "Add doctor")}
            onClose={onClose}
            onSubmit={submit}
            loading={creating || updating}
            error={error}
        >
            <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!editing && !prefillEmail}
            />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Specialization" value={spec} onChangeText={setSpec} autoCapitalize="words" placeholder="e.g. Cardiologist" />
            <Field label="Qualification" value={qual} onChangeText={setQual} placeholder="e.g. MBBS, MD" />
            <Field label="Experience (years)" value={exp} onChangeText={setExp} keyboardType="number-pad" />
            <Field label="Consultation fee (₹)" value={fee} onChangeText={setFee} keyboardType="decimal-pad" />
            {editing && allowStatus ? (
                <SelectField label="Status" value={active} options={ACTIVE_OPTS} onChange={setActive} />
            ) : null}
        </FormModal>
    );
}

// ------------------------------------------------------------------ Patient
const GENDERS = ["Male", "Female", "Other"].map((g) => ({ label: g, value: g }));
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => ({ label: g, value: g }));

export function PatientForm({
    visible,
    onClose,
    editing,
    prefillEmail,
    prefillName,
    allowStatus,
    title,
}: {
    visible: boolean;
    onClose: () => void;
    editing?: Patient | null;
    prefillEmail?: string;
    prefillName?: string;
    allowStatus?: boolean;
    title?: string;
}) {
    const [createPatient, { isLoading: creating }] = useCreatePatientMutation();
    const [updatePatient, { isLoading: updating }] = useUpdatePatientMutation();

    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [blood, setBlood] = useState("");
    const [address, setAddress] = useState("");
    const [emergency, setEmergency] = useState("");
    const [active, setActive] = useState("yes");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!visible) return;
        setError("");
        const [pf, ...pl] = (prefillName || "").split(" ");
        setFirst(editing?.first_name ?? pf ?? "");
        setLast(editing?.last_name ?? pl.join(" ") ?? "");
        setEmail(editing?.email ?? prefillEmail ?? "");
        setPhone(editing?.phone ?? "");
        setGender(editing?.gender ?? "");
        setDob(editing ? dateOnly(editing.date_of_birth) : "");
        setBlood(editing?.blood_group ?? "");
        setAddress(editing?.address ?? "");
        setEmergency(editing?.emergency_contact ?? "");
        setActive(editing ? (editing.is_active ? "yes" : "no") : "yes");
    }, [visible, editing]);

    const submit = async () => {
        setError("");
        if (!first.trim()) return setError("First name is required.");
        if (!last.trim()) return setError("Last name is required.");
        if (!isEmail(email.trim())) return setError("Enter a valid email.");
        if (!phone.trim()) return setError("Phone is required.");
        if (!gender) return setError("Please select a gender.");
        if (!isValidDate(dob)) return setError("Date of birth must be YYYY-MM-DD, e.g. 1995-04-18.");
        if (dob > todayStr()) return setError("Date of birth cannot be in the future.");
        if (!blood) return setError("Please select a blood group.");
        if (!address.trim()) return setError("Address is required.");
        if (!emergency.trim()) return setError("Emergency contact is required.");

        const body = {
            first_name: first.trim(),
            last_name: last.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            gender,
            date_of_birth: toISO(dob),
            blood_group: blood,
            address: address.trim(),
            emergency_contact: emergency.trim(),
        };

        try {
            if (editing) {
                await updatePatient({
                    id: editing.id,
                    ...body,
                    is_active: allowStatus ? active === "yes" : editing.is_active,
                }).unwrap();
                toast.ok("Patient updated");
            } else {
                await createPatient(body).unwrap();
                toast.ok("Patient created");
            }
            onClose();
        } catch (e) {
            setError(errMsg(e));
        }
    };

    return (
        <FormModal
            visible={visible}
            title={title || (editing ? "Edit patient" : "Register patient")}
            onClose={onClose}
            onSubmit={submit}
            loading={creating || updating}
            error={error}
        >
            <Field label="First name" value={first} onChangeText={setFirst} autoCapitalize="words" />
            <Field label="Last name" value={last} onChangeText={setLast} autoCapitalize="words" />
            <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!prefillEmail}
            />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <SelectField label="Gender" value={gender} options={GENDERS} onChange={setGender} />
            <Field label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1995-04-18" />
            <SelectField label="Blood group" value={blood} options={BLOOD} onChange={setBlood} />
            <Field label="Address" value={address} onChangeText={setAddress} autoCapitalize="sentences" />
            <Field label="Emergency contact (phone)" value={emergency} onChangeText={setEmergency} keyboardType="phone-pad" />
            {editing && allowStatus ? (
                <SelectField label="Status" value={active} options={ACTIVE_OPTS} onChange={setActive} />
            ) : null}
        </FormModal>
    );
}
