## WhatsApp Bot — Medical Appointments

This service enables patients to register, view, book, and cancel medical appointments over WhatsApp using Twilio. It integrates with authentication and doctor service databases for users/patients, doctors, workplaces, slots, and appointments.

### What it does
- Registers a patient via step-by-step WhatsApp prompts
- Guides users to book new appointments (region → specialization → doctor → clinic → date → time)
- Shows active appointments
- Cancels a selected appointment
- Sends reminders (script) and can generate time slots (script)

### Architecture
- HTTP server: Express (`server.js`)
- WhatsApp webhook: `POST /whatsapp` (Twilio will POST here)
- Messaging provider: Twilio API
- Databases: PostgreSQL
  - `authDb`: users, patients
  - `doctorDb`: doctors, workplaces, slots, appointments
- Database pools configured in `database/connections.js`

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ running locally or reachable over network
- A Twilio account with a WhatsApp-enabled number (or sandbox)

### Install
```bash
cd Apps/whatsapp-bot
npm install
```

### Environment variables
Create a `.env` file in `Apps/whatsapp-bot/` with the following values (adjust as needed):
```env
# Default/legacy (optional)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=medibook

# Auth DB (users/patients)
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_USER=postgres
AUTH_DB_PASSWORD=yourpassword
AUTH_DB_NAME=auth_db

# Doctor DB (doctors/slots/appointments)
DOCTOR_DB_HOST=localhost
DOCTOR_DB_PORT=5432
DOCTOR_DB_USER=postgres
DOCTOR_DB_PASSWORD=yourpassword
DOCTOR_DB_NAME=doctor_db

# Safety flag (do not run schema unless you intend to)
ALLOW_SCHEMA_MIGRATIONS=false

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1xxxxxxxxxx
```

Notes:
- The app maintains three pools: default, `authDb`, `doctorDb`. Queries are routed to the correct pool by each module.
- By default, schema creation is disabled. Only set `ALLOW_SCHEMA_MIGRATIONS=true` if you want to execute `database/schema.sql` and `database/seed.sql` on the default pool.

### Databases and schema
- Connection pools are defined in `database/connections.js`.
- Example schema is included in `database/schema.sql` and `database/seed.sql` for local development.
- To only verify connectivity (recommended), run:
```bash
npm run init-db
```
This checks connectivity for default, `authDb`, and `doctorDb` without altering schema unless `ALLOW_SCHEMA_MIGRATIONS=true`.

### Running the bot (local)
1) Start the server:
```bash
npm run dev
# or
npm start
```

2) Expose your local server to the internet with a tunnel (for Twilio webhooks):
```bash
# Pick any tunnel you prefer, e.g. ngrok
ngrok http 3000
```

3) Configure Twilio WhatsApp webhook:
- Set the WhatsApp incoming message webhook to: `https://<your-ngrok-subdomain>.ngrok.io/whatsapp`
  - Method: POST

### WhatsApp commands & flow

Entry points:
- `hi`, `hello`, or `start`: shows a welcome message and quick actions
- `register`: begins patient registration (name → email → DOB → gender)
- `new appointment` or `book appointment`: starts booking flow
- `my appointments` or `appointments`: lists active appointments
- `delete appointment` or `cancel appointment`: starts deletion flow

Appointment booking flow (happy path):
1. Region selection (predefined list for demo)
2. Specialization selection
3. Doctor selection (filtered by specialization)
4. Clinic selection (workplaces for selected doctor)
5. Date selection (DD/MM)
6. Time selection (shows available slots)
7. Confirmation and booking

Relevant modules:
- Controller: `controllers/appointmentController.js`
- Router: `routes/whatsapp.js`
- Incoming handler and state machine: `controllers/messageHandler.js`
- Database service: `services/databaseService.js`
  - Users/Patients: `database/queries/users.js`, `database/queries/patients.js` (authDb)
  - Doctors/Workplaces/Slots/Appointments: `database/queries/doctors.js`, `database/queries/slots.js`, `database/queries/appointments.js` (doctorDb)

### Scripts
- Check DB connectivity (no schema changes):
```bash
npm run init-db
```
- Generate slots (example utility):
```bash
npm run generate-slots
```
- Send reminders (example utility):
```bash
npm run send-reminders
```

### Webhook endpoint
- `POST /whatsapp` — Twilio will send incoming messages here. The handler orchestrates the registration and appointment state machine.

### Troubleshooting
- Database operator/type mismatch (e.g., `operator does not exist: character varying = uuid`):
  - Ensure your SQL matches your actual column types and names. This project assumes integer IDs in the example schema; your production DB may use UUIDs. Queries in `database/queries/*.js` should be aligned with your tables.
  - Verify with:
    ```sql
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'appointments';
    ```
- Database does not exist / cannot connect:
  - Check `.env` values, network, and permissions. Ensure the configured DBs exist (`auth_db`, `doctor_db`, and default `medibook` if used).
- Twilio webhook not firing:
  - Confirm the correct public URL and path `/whatsapp`, method POST, and that your tunnel is running.

### Security & safety
- Do not enable schema migrations in production. Keep `ALLOW_SCHEMA_MIGRATIONS=false`.
- Limit DB users to only required privileges.

### New Appointment flow (user says "NEW APPOINTMENT")

- Prerequisite check
  - If not registered: prompt to register and start registration flow.
  - If registered: load patient by phone; ensure there is no active appointment.

- Step 1 — Region
  - Bot: "Please select your region: Downtown, Westside, East District. Reply with the region name."
  - User replies with region name.

- Step 2 — Specialization
  - Bot: "Available specializations in <Region>: Cardiology, Pediatrics, Orthopedics. Reply with specialization."
  - User replies with specialization.

- Step 3 — Doctor
  - Bot lists doctors for that specialization (and region if supported) and asks for a name.
  - User replies with the doctor's name (e.g., "Dr. Smith").

- Step 4 — Clinic
  - Bot lists clinics/workplaces for the chosen doctor and asks for clinic name.
  - User replies with clinic name.

- Step 5 — Date
  - Bot: "Please enter your preferred date (DD/MM), e.g. 15/07."
  - User replies with date; bot validates format.

- Step 6 — Time slot
  - Bot shows available times for that date and asks for time (HH:MM).
  - User replies with a time from the list; bot validates.

- Step 7 — Create appointment
  - Bot creates appointment with: patientId, doctorId, appointment_date = selected slot time, and a note.
  - Bot confirms: "✅ Appointment Booked! Doctor: Dr. <Name>, Specialization: <Spec>, Date: <Day, DD/MM HH:mm>"

- If any step fails
  - Bot shows a concise error and repeats that step (invalid region/specialization/doctor/clinic/date/time; no slots available → ask for another date).

#### Example conversation

- User: NEW APPOINTMENT
- Bot: Please select your region: Downtown, Westside, East District.
- User: Downtown
- Bot: Available specializations in Downtown: Cardiology, Pediatrics, Orthopedics.
- User: Cardiology
- Bot: Available Cardiology doctors: Dr. A, Dr. B. Reply with doctor's name.
- User: Dr. A
- Bot: Clinics for Dr. A: City Heart Center. Reply with clinic name.
- User: City Heart Center
- Bot: Enter preferred date (DD/MM), e.g. 15/07.
- User: 21/09
- Bot: Available slots on Sunday, 21/09: 10:00, 12:00, 15:30. Reply with HH:MM.
- User: 12:00
- Bot: ✅ Appointment Booked! Doctor: Dr. A, Specialization: Cardiology, Date: Sunday, 21/09 12:00