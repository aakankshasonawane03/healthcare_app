# Healthcare app – connect frontend ↔ backend

## 1. Backend (Go)
```bash
cd backend
# MongoDB must be running (MONGO_URI in .env)
go mod tidy
go run ./cmd/server        # or: air
```
Check: http://localhost:8080/api/auth/health  → `{"success":true,...}`

### Create the first ADMIN (public signup can't make admins)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: change-this-admin-key" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"ADMIN"}'
```
(`ADMIN_SIGNUP_KEY` lives in backend `.env` – change it.)

## 2. Frontend (Expo)
```bash
cd frontend
npm install
cp .env.example .env       # then set EXPO_PUBLIC_API_URL (see below)
npx expo start -c          # -c clears cache so the new .env is read
```
| Where you run the app | EXPO_PUBLIC_API_URL |
|---|---|
| Web / iOS simulator | http://localhost:8080 |
| Android emulator | http://10.0.2.2:8080 |
| Real phone (same Wi‑Fi) | http://<PC-LAN-IP>:8080 (allow port 8080 in firewall) |

## 3. How the roles work together
1. Sign up as **Patient / Doctor / Receptionist** (or log in as the admin).
2. **Doctor** → Profile → *Complete profile* (creates the Doctor record; matched to the login by email).
3. **Patient** → Profile → *Complete profile* (creates the Patient record).
4. Patient → Doctors → *Book appointment*. Doctor / Reception → Appointments → Confirm / Complete / Cancel.
5. Doctor → Records → *Add record*; the patient sees it under Records.
6. Admin → Users (activate/deactivate), Doctors, Patients, Clinics, Appointments, stats.

## Not implemented (backend has no real support yet)
* Forgot-password / email reset (no endpoint)
* Creating prescriptions (backend needs a Consultation, which is only a stub) – prescriptions are shown read-only
* Queue, schedules, consultations, push notifications UI
