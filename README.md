# 🏥 CarePlus – Healthcare Microservices Platform

CarePlus is a full digital healthcare ecosystem designed to connect **patients, doctors, assistants, and pharmacies** in a single integrated platform.  
The system provides appointment booking, prescription management, pharmacy ordering, AI-powered tools, real-time communication, and multi-role dashboards — all powered by a modern **microservices architecture**.

CarePlus was developed as a **Final Year Project**, but structured like a real production-ready healthcare system with clean separation of services, event-driven communication, and scalable modular design.

---

# 📚 Table of Contents
1. Introduction  
2. Main Features  
3. System Architecture  
4. Technologies Used  
5. Repository Structure  
6. Setup & Installation  
7. Microservices Overview  
8. AI Module Details  
9. Notification + OTP System  
10. API Documentation Links  
11. Testing  
12. Future Work  
13. Authors  

---

# 1️⃣ Introduction

CarePlus solves the problem of **fragmented healthcare**. Instead of using multiple apps or manual steps for appointments, prescriptions, and pharmacy orders, CarePlus unifies the entire workflow.

- Patients book appointments from the app or WhatsApp bot.  
- Doctors manage schedules, workplaces, prescriptions, and assistants from the dashboard.  
- Pharmacies receive digital prescriptions and process reservations/orders.  
- AI modules assist with symptom triage and breast cancer imaging.  
- A Notification service handles Email/WhatsApp OTP and reminders.  

This project follows a scalable **microservices architecture** built using NestJS, React, React Native, RabbitMQ, PostgreSQL, and Python AI models.

---

# 2️⃣ Main Features

## 👤 Patient Features
- Register/Login with email or phone number  
- OTP verification (Email + WhatsApp)  
- AI-powered symptom triage  
- Book appointments via **mobile app**  
- Book appointments via **WhatsApp bot**  
- View and cancel upcoming reservations  
- Display digital prescriptions  
- Search pharmacies by:  
  - product  
  - category  
  - price  
  - availability  
- Reserve prescription medicines  
- Order non-prescription products  
- Receive appointment reminders and updates  

---

## 🩺 Doctor Features
- Create and update doctor profile  
- Upload required documents (ID, license, certificate)  
- Manage workplaces (clinics/hospitals)  
- Define working hours and appointment slots  
- View daily/weekly appointment list  
- Accept/reject appointments  
- Access patient visit history  
- Create and manage digital prescriptions  
- Invite assistants to workplaces  
- Remove/assign assistants  
- View analytics:  
  - appointments count  
  - revenue  
  - reviews  
  - patient statistics  
- Use AI breast cancer imaging tool  

---

## 🧑‍💼 Assistant Features
- Receive doctor invitations by email  
- Accept/reject workplace assignment  
- View all workplaces assigned  
- View all patient appointments for the workplace  
- Support doctors in managing patient flow  

---

## 💊 Pharmacy Features
- Pharmacy profile & multiple branches  
- Add/edit/remove products  
- Create categories & manage stock  
- Search for prescription items  
- Accept or reject prescription reservations  
- Manage order statuses (pending → confirmed → ready → delivered)  
- Handle non-prescription product orders  
- Provide pickup or delivery options  
- Pharmacy-level analytics dashboard  

---

## 🤖 AI Features

### **1. AI Symptom Triage**
- Uses a logistic regression machine learning model  
- Predicts the most likely specialty for the patient  
- Suggests urgency level:  
  - Emergency  
  - Specialist  
  - General Practitioner  
- Accessible directly in the patient app  

### **2. AI Breast Cancer Detector**
- Uses DenseNet201 deep learning model  
- Classifies 8 labels: Benign/Malignant × Density 1–4  
- Preprocesses X-ray images  
- Generates probability for each class  
- Used by oncology doctors to assist diagnosis  

---

## 💬 WhatsApp Appointment Assistant
- Built with Express.js and webhook integration  
- Helps patients book appointments step-by-step:  
  1. Region  
  2. Specialty  
  3. Doctor  
  4. Workplace  
  5. Date  
  6. Time Slot  
- Users can:  
  - Create an account  
  - List upcoming appointments  
  - Cancel appointments  
  - Request help  

---

## 🔔 Notification System
- Email OTP via Gmail  
- WhatsApp OTP via API provider  
- Appointment reminder notifications  
- Doctor verification emails  
- Assistant invitation emails  
- System event alerts  
- Template-based formatting  
- Fully logged notification history  
- Retry logic for failed deliveries  

---

# 3️⃣ System Architecture

```
             ┌───────────────────────────┐
             │   Web App (React)        │
             └────────────┬─────────────┘
                          │
             ┌────────────▼─────────────┐
             │ Mobile App (ReactNative) │
             └────────────┬─────────────┘
                          │
             ┌────────────▼─────────────┐
             │ WhatsApp Bot (Node.js)   │
             └────────────┬─────────────┘
                          │
                          ▼
                  ┌─────────────────┐
                  │   API Gateway   │
                  │    (NestJS)     │
                  └───────┬─────────┘
                          │
                 REST + RabbitMQ Events
                          │
   ┌──────────────────────┼────────────────────────────┐
   │                      │                            │
┌──▼───────┐        ┌─────▼───────┐             ┌──────▼────────┐
│ Auth     │        │ Doctor      │             │ Pharmacy      │
│ Service  │        │ Service     │             │ Service       │
└──┬───────┘        └─────┬───────┘             └──────┬────────┘
   │ User/JWT             │ Appointments               │ Orders/
   │ Roles                │ Workplaces                 │ Reservations
   │                      │ Assistants                 │ Products
   │                      │                            │
┌──▼─────────┐      ┌─────▼─────────┐          ┌───────▼─────────┐
│Notification│      │ AI Triage      │          │  AI Breast      │
│ Service    │      │ Service        │          │  Cancer Model   │
└──┬─────────┘      └───────┬────────┘          └────────┬────────┘
   │ Email/WhatsApp          │                            │
   │ OTP & Alerts            │                            │
   │                         │                            │
   │                 ┌───────▼─────────┐          ┌───────▼─────────┐
   │                 │   RabbitMQ      │          │ PostgreSQL DBs  │
   └────────────────▶│ (Message Bus)   │◀─────────┴─────────────────┘
                     └─────────────────┘
```

---

# 4️⃣ Technologies Used

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React, React Native, Expo | Web dashboard + mobile app |
| Backend | NestJS Microservices | Auth, Doctor, Pharmacy, Notification, Gateway |
| Communication | RabbitMQ | Event-driven messaging |
| Databases | PostgreSQL | Each service has its own DB |
| AI | Python, Flask, TensorFlow, Scikit-learn | Triage + Breast Cancer |
| File Storage | Supabase | Images & documents |
| Notifications | Gmail SMTP, UltraMsg | Email/WhatsApp OTP & alerts |
| Bot | Express.js | WhatsApp conversational assistant |
| Tooling | Turborepo, Postman, Figma | Dev tools |

---

# 5️⃣ Repository Structure

```
careplus/
├─ apps/
│  ├─ web/
│  ├─ mobile/
│  ├─ backend/
│  │  ├─ gateway/
│  │  ├─ auth/
│  │  ├─ doctor/
│  │  ├─ pharmacy/
│  │  ├─ notification/
│  ├─ ai-triage/
│  ├─ whatsapp-bot/
│
├─ docs/
├─ package.json
├─ turbo.json
├─ README.md
```

---

# 6️⃣ Setup & Installation

## Install dependencies
```bash
npm install
```

## Start backend services
```bash
cd apps/backend
npm run start:dev
```

## Web App
```bash
cd apps/web
npm run dev
```

## Mobile App
```bash
cd apps/mobile
npm start
```

## WhatsApp Bot
```bash
cd apps/whatsapp-bot
npm run start
```

---

# 7️⃣ Microservices Overview

### 🔐 Auth Service
- User registration & login  
- Role management (doctor/patient/assistant/pharmacy)  
- OTP generation  
- Sends OTP request to Notification Service  

### 🩺 Doctor Service
- Doctor profiles  
- Workplaces management  
- Appointment slots  
- Digital prescriptions  
- Invitations for assistants  
- Reviews & analytics  

### 💊 Pharmacy Service
- Product catalog  
- Categories  
- Prescription reservations  
- Product orders  
- Branch management  

### ✉️ Notification Service
- Email OTP  
- WhatsApp OTP  
- Appointment reminders  
- Template engine  
- Notification logs  

### 🤖 WhatsApp Bot
- Appointment booking wizard  
- Appointment listing  
- Appointment cancellation  

---

# 8️⃣ AI Module Details

## AI Symptom Triage
- Logistic Regression model  
- Input: Age, gender, symptoms  
- Output: specialty + urgency level  
- Accessible through REST API  

## AI Breast Cancer Detector
- DenseNet201 CNN model  
- Classifies 8 categories  
- Flask API backend  
- React-based frontend  

---

# 9️⃣ OTP & Notification System

- OTP via Email & WhatsApp  
- Doctor verification notifications  
- Assistant invitation emails  
- Appointment reminders  
- Template-based system  
- Full logging + retry mechanism  

---

# 🔟 API Documentation

All documentation is stored inside `/docs`:

- Doctor API  
- Assistant System  
- Notification Service  
- Pharmacy API  
- Email/WhatsApp Setup  
- Gmail App Password Guide  

---

# 1️⃣1️⃣ Testing

- Postman collections  
- cURL scripts  
- Database seed & test data  
- WhatsApp bot scenario tests  
- AI model accuracy verification  

---

# 1️⃣2️⃣ Future Work

- Integrate online payments for pharmacy orders  
- Add full Electronic Health Record (EHR) module  
- Real-time doctor–patient chat  
- Doctor video consultations  
- Delivery tracking for pharmacy orders  
- Kubernetes-based cloud deployment  
- Expand AI modules to dermatology, pulmonology, cardiology  
- Add multilingual support (English/Arabic/French)  
- Implement push notifications (FCM)  

---

# 1️⃣3️⃣ Authors

- **Youssef Farah**  
- **Tony Katrib**  
- **Daniel Kabbout**  

Antonine University – Faculty of Engineering – Computer Science Department.
