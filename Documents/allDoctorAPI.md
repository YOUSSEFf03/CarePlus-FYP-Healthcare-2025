# Doctor API Documentation

This document provides comprehensive documentation for all Doctor-related API endpoints in the Healthcare Management System.

## Base URL
```
http://localhost:3000/doctors
```

## Authentication
- **Public Routes**: No authentication required
- **Protected Routes**: Require Bearer token in Authorization header
- **Role-based Access**: Some endpoints require specific user roles (doctor, patient, admin)

---

## 📋 Table of Contents

1. [Public Routes](#public-routes)
2. [Doctor Profile Management](#doctor-profile-management)
3. [Appointment Management](#appointment-management)
4. [Review Management](#review-management)
5. [Workplace Management](#workplace-management)
6. [Assistant Management](#assistant-management)
7. [Analytics & Statistics](#analytics--statistics)
8. [Admin Routes](#admin-routes)

---

## 🌐 Public Routes

### 1. Get All Doctors
**GET** `/doctors`

Get a list of all doctors with optional filtering.

**Query Parameters:**
- `specialization` (string, optional): Filter by medical specialization
- `verification_status` (string, optional): Filter by verification status
- `is_active` (boolean, optional): Filter by active status
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Number of results per page

**Example Request:**
```bash
GET /doctors?specialization=cardiology&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "name": "Dr. John Smith",
        "specialization": "Cardiology",
        "verification_status": "verified",
        "is_active": true,
        "consultation_fee": 150
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  },
  "message": "Operation successful"
}
```

### 2. Get Doctor by ID
**GET** `/doctors/:id`

Get detailed information about a specific doctor.

**Path Parameters:**
- `id` (string, required): Doctor's UUID

**Example Request:**
```bash
GET /doctors/519dbc36-deb6-4bcb-a2f3-262a52d40622
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
    "name": "Dr. John Smith",
    "specialization": "Cardiology",
    "bio": "Experienced cardiologist...",
    "verification_status": "verified",
    "consultation_fee": 150,
    "workplaces": [...]
  },
  "message": "Operation successful"
}
```

### 3. Get Doctor Reviews
**GET** `/doctors/:doctorId/reviews`

Get all reviews for a specific doctor.

**Path Parameters:**
- `doctorId` (string, required): Doctor's UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Excellent doctor!",
        "patient_name": "John Doe",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "average_rating": 4.8,
    "total_reviews": 25
  },
  "message": "Operation successful"
}
```

### 4. Get Doctor Available Slots
**GET** `/doctors/:doctorId/available-slots`

Get available appointment slots for a doctor on a specific date.

**Path Parameters:**
- `doctorId` (string, required): Doctor's UUID

**Query Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format

**Example Request:**
```bash
GET /doctors/519dbc36-deb6-4bcb-a2f3-262a52d40622/available-slots?date=2024-01-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "available_slots": [
      "09:00", "09:30", "10:00", "14:00", "14:30"
    ]
  },
  "message": "Operation successful"
}
```

### 5. Get Doctor Stats (Public)
**GET** `/doctors/:doctorId/stats`

Get public statistics for a specific doctor.

**Path Parameters:**
- `doctorId` (string, required): Doctor's UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "total_appointments": 150,
    "average_rating": 4.8,
    "total_reviews": 25,
    "years_experience": 10
  },
  "message": "Operation successful"
}
```

### 6. Get General Statistics
**GET** `/doctors/stats`

Get system-wide doctor statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_doctors": 150,
    "verified_doctors": 120,
    "active_doctors": 140,
    "total_appointments": 5000
  },
  "message": "Operation successful"
}
```

---

## 👨‍⚕️ Doctor Profile Management

### 7. Get My Profile
**GET** `/doctors/profile/me`

Get the authenticated doctor's profile information.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "email": "john@example.com",
    "specialization": "Cardiology",
    "bio": "Experienced cardiologist...",
    "verification_status": "verified",
    "consultation_fee": 150,
    "workplaces": [...]
  },
  "message": "Operation successful"
}
```

### 8. Update My Profile
**PUT** `/doctors/profile/me`

Update the authenticated doctor's profile information.

**Authentication:** Required (Doctor token)

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "bio": "Updated bio...",
  "consultation_fee": 160,
  "specialization": "Cardiology"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "bio": "Updated bio...",
    "consultation_fee": 160
  },
  "message": "Operation successful"
}
```

---

## 📅 Appointment Management

### 9. Create Appointment
**POST** `/doctors/appointments`

Create a new appointment with a doctor.

**Authentication:** Required (Patient token)

**Request Body:**
```json
{
  "doctorId": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
  "appointment_date": "2024-01-15",
  "appointment_time": "14:30",
  "symptoms": "Chest pain and shortness of breath"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "appointment-uuid",
    "doctor_id": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
    "patient_id": "patient-uuid",
    "appointment_date": "2024-01-15",
    "appointment_time": "14:30",
    "status": "pending",
    "symptoms": "Chest pain and shortness of breath"
  },
  "message": "Operation successful"
}
```

### 10. Get My Appointments (Doctor)
**GET** `/doctors/appointments`

Get appointments for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Query Parameters:**
- `status` (string, optional): Filter by appointment status
- `date_from` (string, optional): Start date filter (YYYY-MM-DD)
- `date_to` (string, optional): End date filter (YYYY-MM-DD)
- `page` (number, optional): Page number
- `limit` (number, optional): Results per page

**Example Request:**
```bash
GET /doctors/appointments?status=pending&date_from=2024-01-01&date_to=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "patient_name": "John Doe",
        "appointment_date": "2024-01-15",
        "appointment_time": "14:30",
        "status": "pending",
        "symptoms": "Chest pain"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10
  },
  "message": "Operation successful"
}
```

### 11. Get My Bookings (Patient)
**GET** `/doctors/appointments/my-bookings`

Get appointments booked by the authenticated patient.

**Authentication:** Required (Patient token)

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "doctor_name": "Dr. John Smith",
        "appointment_date": "2024-01-15",
        "appointment_time": "14:30",
        "status": "confirmed",
        "symptoms": "Chest pain"
      }
    ]
  },
  "message": "Operation successful"
}
```

### 12. Update Appointment Status
**PUT** `/doctors/appointments/:appointmentId/status`

Update the status of an appointment (doctor or admin only).

**Authentication:** Required (Doctor or Admin token)

**Path Parameters:**
- `appointmentId` (string, required): Appointment UUID

**Request Body:**
```json
{
  "status": "confirmed",
  "diagnosis": "Mild chest discomfort",
  "prescription": "Rest and follow-up in 2 weeks",
  "notes": "Patient should avoid strenuous activities"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "appointment-uuid",
    "status": "confirmed",
    "diagnosis": "Mild chest discomfort",
    "prescription": "Rest and follow-up in 2 weeks",
    "notes": "Patient should avoid strenuous activities"
  },
  "message": "Operation successful"
}
```

---

## ⭐ Review Management

### 13. Create Review
**POST** `/doctors/reviews`

Create a review for a doctor after an appointment.

**Authentication:** Required (Patient token)

**Request Body:**
```json
{
  "doctorId": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
  "appointmentId": "appointment-uuid",
  "rating": 5,
  "comment": "Excellent doctor, very professional and helpful!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "doctor_id": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
    "patient_id": "patient-uuid",
    "rating": 5,
    "comment": "Excellent doctor, very professional and helpful!",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Operation successful"
}
```

---

## 🏥 Workplace Management

### 14. Create Workplace
**POST** `/doctors/workplaces`

Create a new workplace for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Request Body:**
```json
{
  "workplace_name": "City Medical Center",
  "workplace_type": "hospital",
  "phone_number": "+1234567890",
  "email": "info@citymedical.com",
  "description": "Full-service medical center",
  "website": "https://citymedical.com",
  "consultation_fee": 150,
  "services_offered": ["consultation", "diagnosis", "treatment"],
  "insurance_accepted": ["Blue Cross", "Aetna"],
  "is_primary": true,
  "address": {
    "building_name": "City Medical Building",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipcode": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "workplace-uuid",
    "workplace_name": "City Medical Center",
    "workplace_type": "hospital",
    "consultation_fee": 150,
    "is_primary": true
  },
  "message": "Operation successful"
}
```

### 15. Get Doctor Workplaces
**GET** `/doctors/workplaces`

Get all workplaces for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "workplaces": [
      {
        "id": "workplace-uuid",
        "workplace_name": "City Medical Center",
        "workplace_type": "hospital",
        "consultation_fee": 150,
        "is_primary": true,
        "address": {...}
      }
    ]
  },
  "message": "Operation successful"
}
```

### 16. Update Workplace
**PUT** `/doctors/workplaces/:workplaceId`

Update a specific workplace.

**Authentication:** Required (Doctor token)

**Path Parameters:**
- `workplaceId` (string, required): Workplace UUID

**Request Body:**
```json
{
  "workplace_name": "Updated Medical Center",
  "consultation_fee": 160,
  "phone_number": "+1234567891"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "workplace-uuid",
    "workplace_name": "Updated Medical Center",
    "consultation_fee": 160,
    "phone_number": "+1234567891"
  },
  "message": "Operation successful"
}
```

### 17. Delete Workplace
**DELETE** `/doctors/workplaces/:workplaceId`

Delete a specific workplace.

**Authentication:** Required (Doctor token)

**Path Parameters:**
- `workplaceId` (string, required): Workplace UUID

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Operation successful"
}
```

### 18. Create Appointment Slots
**POST** `/doctors/workplaces/:workplaceId/appointment-slots`

Create appointment slots for a specific workplace.

**Authentication:** Required (Doctor token)

**Path Parameters:**
- `workplaceId` (string, required): Workplace UUID

**Request Body:**
```json
{
  "date": "2024-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created_slots": 16,
    "date": "2024-01-15",
    "slots": [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ]
  },
  "message": "Operation successful"
}
```

### 19. Get Workplace Appointment Slots
**GET** `/doctors/workplaces/:workplaceId/appointment-slots`

Get appointment slots for a specific workplace and date.

**Path Parameters:**
- `workplaceId` (string, required): Workplace UUID

**Query Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format

**Example Request:**
```bash
GET /doctors/workplaces/workplace-uuid/appointment-slots?date=2024-01-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workplace_id": "workplace-uuid",
    "date": "2024-01-15",
    "slots": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "09:30",
        "available": false
      }
    ]
  },
  "message": "Operation successful"
}
```

---

## 👥 Assistant Management

### 20. Invite Assistant
**POST** `/doctors/invite-assistant`

Invite an assistant to join a workplace.

**Authentication:** Required (Doctor token)

**Request Body:**
```json
{
  "assistantEmail": "assistant@example.com",
  "workplaceId": "workplace-uuid",
  "message": "Join our medical team!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invite_id": "invite-uuid",
    "assistant_email": "assistant@example.com",
    "workplace_id": "workplace-uuid",
    "status": "pending"
  },
  "message": "Operation successful"
}
```

### 21. Get My Assistants
**GET** `/doctors/my-assistants`

Get all assistants working with the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "assistants": [
      {
        "id": "assistant-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "workplaces": [
          {
            "id": "workplace-uuid",
            "name": "City Medical Center"
          }
        ]
      }
    ]
  },
  "message": "Operation successful"
}
```

### 22. Get Pending Invites
**GET** `/doctors/pending-invites`

Get all pending assistant invites sent by the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_invites": [
      {
        "id": "invite-uuid",
        "assistant_email": "assistant@example.com",
        "workplace_name": "City Medical Center",
        "sent_at": "2024-01-15T10:30:00Z",
        "status": "pending"
      }
    ]
  },
  "message": "Operation successful"
}
```

### 23. Remove Assistant
**DELETE** `/doctors/remove-assistant`

Remove an assistant from a workplace.

**Authentication:** Required (Doctor token)

**Request Body:**
```json
{
  "assistantId": "assistant-uuid",
  "workplaceId": "workplace-uuid",
  "reason": "No longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Operation successful"
}
```

### 24. Cancel Invite
**DELETE** `/doctors/cancel-invite/:inviteId`

Cancel a pending assistant invite.

**Authentication:** Required (Doctor token)

**Path Parameters:**
- `inviteId` (string, required): Invite UUID

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Operation successful"
}
```

---

## 📊 Analytics & Statistics

### 25. Get Weekly Analytics
**GET** `/doctors/analytics/weekly`

Get weekly analytics for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "week_start": "2024-01-08",
    "week_end": "2024-01-14",
    "total_appointments": 25,
    "completed_appointments": 23,
    "cancelled_appointments": 2,
    "total_revenue": 3750,
    "average_rating": 4.8
  },
  "message": "Operation successful"
}
```

### 26. Get Monthly Analytics
**GET** `/doctors/analytics/monthly`

Get monthly analytics for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2024-01",
    "total_appointments": 100,
    "completed_appointments": 95,
    "cancelled_appointments": 5,
    "total_revenue": 15000,
    "average_rating": 4.7,
    "new_patients": 15
  },
  "message": "Operation successful"
}
```

### 27. Get Today's Schedule
**GET** `/doctors/schedule/today`

Get today's schedule for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "appointments": [
      {
        "id": "appointment-uuid",
        "patient_name": "John Doe",
        "time": "09:00",
        "status": "confirmed",
        "symptoms": "Chest pain"
      },
      {
        "id": "appointment-uuid-2",
        "patient_name": "Jane Smith",
        "time": "14:30",
        "status": "pending",
        "symptoms": "Headache"
      }
    ]
  },
  "message": "Operation successful"
}
```

### 28. Get Appointment Statistics
**GET** `/doctors/appointments/statistics`

Get appointment statistics for the authenticated doctor.

**Authentication:** Required (Doctor token)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_appointments": 500,
    "pending_appointments": 25,
    "confirmed_appointments": 400,
    "completed_appointments": 350,
    "cancelled_appointments": 50,
    "average_daily_appointments": 8.5
  },
  "message": "Operation successful"
}
```

### 29. Get Appointment Statistics by Date Range
**GET** `/doctors/appointments/statistics/date-range`

Get appointment statistics for a specific date range.

**Authentication:** Required (Doctor token)

**Query Parameters:**
- `start_date` (string, required): Start date (YYYY-MM-DD)
- `end_date` (string, required): End date (YYYY-MM-DD)

**Example Request:**
```bash
GET /doctors/appointments/statistics/date-range?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "total_appointments": 100,
    "completed_appointments": 95,
    "cancelled_appointments": 5,
    "total_revenue": 15000
  },
  "message": "Operation successful"
}
```

---

## 🔧 Admin Routes

### 30. Verify Doctor
**POST** `/doctors/verify`

Verify or reject a doctor's registration (admin only).

**Authentication:** Required (Admin token)

**Request Body:**
```json
{
  "doctorId": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
  "status": "verified",
  "rejection_reason": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor_id": "519dbc36-deb6-4bcb-a2f3-262a52d40622",
    "verification_status": "verified",
    "verified_at": "2024-01-15T10:30:00Z"
  },
  "message": "Operation successful"
}
```

### 31. Get System Appointment Statistics
**GET** `/doctors/appointments/statistics/system`

Get system-wide appointment statistics (admin only).

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_appointments": 10000,
    "total_doctors": 150,
    "total_patients": 5000,
    "average_appointments_per_doctor": 66.7,
    "system_uptime": "99.9%"
  },
  "message": "Operation successful"
}
```

---

## 🚨 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "status": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 📝 Notes

1. **Authentication**: Include `Authorization: Bearer <token>` header for protected routes
2. **Date Format**: Use `YYYY-MM-DD` format for dates
3. **Time Format**: Use `HH:MM` format for times (24-hour)
4. **UUIDs**: All IDs are UUIDs (Universally Unique Identifiers)
5. **Pagination**: Use `page` and `limit` query parameters for paginated results
6. **Role Requirements**: 
   - `doctor` - Doctor-specific operations
   - `patient` - Patient-specific operations  
   - `admin` - Administrative operations

---

## 🔗 Related Documentation

- [Authentication API](./auth-api.md)
- [Patient API](./patient-api.md)
- [Notification API](./notification-api.md)
