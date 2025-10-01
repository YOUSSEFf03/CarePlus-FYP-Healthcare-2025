# 👥 Assistant System Documentation

## Overview
The assistant system allows doctors to manage their medical practice with the help of assistants who can handle various administrative and support tasks. This system provides a complete solution for managing medical practice staff, allowing doctors to efficiently delegate tasks while maintaining control over their workplaces.

---

## 🏥 What Doctors Can Do with Assistants

### 1. 👤 Assistant Management
- **Invite Assistants**: Send email invitations to potential assistants
- **Assign to Workplaces**: Assign assistants to specific medical practices/locations
- **Track Status**: Monitor active, inactive, and pending assistants
- **Remove Assistants**: Remove assistants from workplaces when needed
- **Cancel Invitations**: Cancel pending invitations before acceptance

### 2. 🏢 Workplace-Specific Control
- **Multi-Location Support**: Manage assistants across multiple doctor workplaces
- **Location-Based Access**: Control which workplace each assistant can access
- **Workplace Permissions**: Set specific permissions per workplace

### 3. 📋 Administrative Functions
- **View All Assistants**: See all assistants across all workplaces
- **Monitor Invitations**: Track pending, accepted, and rejected invitations
- **Manage Access**: Control when assistants can start/stop working

---

## 👩‍⚕️ What Assistants Can Do

### 1. 📨 Invitation Management
- **View Invitations**: See all invitations from doctors
- **Accept/Reject Invites**: Respond to workplace invitations
- **Track Status**: Monitor invitation status (pending, accepted, expired)

### 2. 🏢 Workplace Access
- **View Assigned Workplaces**: See all workplaces they're assigned to
- **Access Workplace Info**: View workplace details, addresses, schedules
- **Leave Workplaces**: Voluntarily leave workplace assignments

### 3. 🔄 Status Management
- **Active/Inactive Status**: Can be marked active/inactive by doctors
- **Assignment History**: Track workplace assignment history

---

## 📊 System Architecture

### Database Entities:
1. **AssistantInvite** - Manages invitation lifecycle
2. **DoctorWorkplaceAssistant** - Tracks assistant-workplace assignments
3. **DoctorWorkplace** - Workplace information
4. **User** - Assistant user accounts

### Invitation Flow:
```
Doctor → Invites Assistant → Assistant Receives Email → Assistant Accepts/Rejects → Assignment Created
```

---

## 🔐 Permissions & Access Control

### Doctor Permissions:
- ✅ Invite assistants to specific workplaces
- ✅ View all their assistants across workplaces
- ✅ Remove assistants from workplaces
- ✅ Cancel pending invitations
- ✅ View pending invitations

### Assistant Permissions:
- ✅ View their own invitations
- ✅ Accept or reject invitations
- ✅ View their assigned workplaces
- ✅ Leave workplace assignments
- ❌ Cannot invite other assistants
- ❌ Cannot access other doctors' data

---

## 📱 Complete API List

### For Doctors:

#### Invite Assistant to Workplace
```bash
POST /doctors/invite-assistant
POST /assistants/doctor/invite

Headers:
  Authorization: Bearer <doctor_token>
  Content-Type: application/json

Body:
{
  "assistantEmail": "assistant@example.com",
  "workplaceId": "workplace-uuid",
  "message": "Welcome to our medical team!"
}
```

#### View All Assistants
```bash
GET /doctors/my-assistants
GET /assistants/doctor/my-assistants

Headers:
  Authorization: Bearer <doctor_token>
```

#### View Pending Invitations
```bash
GET /doctors/pending-invites

Headers:
  Authorization: Bearer <doctor_token>
```

#### Remove Assistant from Workplace
```bash
DELETE /doctors/remove-assistant
DELETE /assistants/doctor/remove-assistant

Headers:
  Authorization: Bearer <doctor_token>
  Content-Type: application/json

Body:
{
  "assistantId": "assistant-user-uuid",
  "workplaceId": "workplace-uuid",
  "reason": "Performance issues"
}
```

#### Cancel Invitation
```bash
DELETE /doctors/cancel-invite/:inviteId
DELETE /assistants/doctor/cancel-invite/:inviteId

Headers:
  Authorization: Bearer <doctor_token>
```

### For Assistants:

#### View My Invitations
```bash
GET /assistants/my-invites

Headers:
  Authorization: Bearer <assistant_token>
```

#### Respond to Invitation
```bash
POST /assistants/respond-invite

Headers:
  Authorization: Bearer <assistant_token>
  Content-Type: application/json

Body:
{
  "inviteId": "invite-uuid",
  "response": "accept" // or "reject"
}
```

#### View My Assigned Workplaces
```bash
GET /assistants/my-workplaces

Headers:
  Authorization: Bearer <assistant_token>
```

#### Leave a Workplace
```bash
DELETE /assistants/leave-workplace/:workplaceId

Headers:
  Authorization: Bearer <assistant_token>
  Content-Type: application/json

Body:
{
  "reason": "Personal reasons" // optional
}
```

---

## 🔄 Complete Workflow

### 1. Doctor Invites Assistant:
```
Doctor → POST /doctors/invite-assistant → Assistant receives email → Assistant accepts/rejects
```

### 2. Assistant Joins Workplace:
```
Assistant → POST /assistants/respond-invite → Assignment created → Assistant can access workplace
```

### 3. Daily Operations:
```
Assistant → GET /assistants/my-workplaces → View assigned workplaces → Access workplace data
```

### 4. Leaving Workplace:
```
Assistant → DELETE /assistants/leave-workplace/:workplaceId → Assignment marked inactive
```

---

## 📝 Example API Responses

### Successful Invitation Response:
```json
{
  "success": true,
  "data": {
    "id": "invite-uuid",
    "doctorId": "doctor-uuid",
    "assistantId": "assistant-user-uuid",
    "workplaceId": "workplace-uuid",
    "status": "pending",
    "expires_at": "2024-01-22T10:30:00Z",
    "message": "Welcome to our medical team!",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Operation successful"
}
```

### Assistant Workplaces Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "workplace-uuid-1",
      "workplace_name": "Downtown Medical Clinic",
      "workplace_type": "clinic",
      "addresses": [
        {
          "id": "address-uuid",
          "street": "Main Street",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "zipcode": "10001"
        }
      ],
      "consultation_fee": 150,
      "is_active": true
    }
  ],
  "message": "Operation successful"
}
```

### Doctor's Assistants Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment-uuid",
      "doctorWorkplaceId": "workplace-uuid",
      "assistantId": "assistant-user-uuid",
      "status": "active",
      "assigned_at": "2024-01-15T10:30:00Z",
      "userInfo": {
        "id": "assistant-user-uuid",
        "name": "John Assistant",
        "email": "assistant@example.com",
        "phone": "+1-555-0125"
      }
    }
  ],
  "message": "Operation successful"
}
```

---

## 🎯 Key Benefits

### For Doctors:
- ✅ **Efficient Management**: Manage multiple assistants across locations
- ✅ **Controlled Access**: Assign assistants to specific workplaces only
- ✅ **Flexible Invitations**: Send personalized invitations with messages
- ✅ **Easy Removal**: Remove assistants when needed
- ✅ **Multi-Workplace Support**: Manage assistants across different locations

### For Assistants:
- ✅ **Multiple Opportunities**: Work with multiple doctors/workplaces
- ✅ **Clear Communication**: Receive detailed invitation information
- ✅ **Flexible Scheduling**: Leave workplaces when needed
- ✅ **Transparent Process**: See all invitations and assignments
- ✅ **Workplace Access**: View detailed workplace information

---

## 🔐 Security & Permissions

- **Role-Based Access**: Only doctors can invite, only assistants can respond
- **Workplace Isolation**: Assistants only see their assigned workplaces
- **Invitation Expiry**: Invitations expire after 7 days
- **Status Tracking**: All actions are logged and tracked
- **Authentication Required**: All endpoints require valid authentication tokens
- **Role Validation**: Each endpoint validates user roles before processing

---

## 🚀 Getting Started

### Prerequisites:
- Gateway service running on `http://localhost:3000`
- Doctor service running and connected
- Valid authentication tokens for different user roles
- RabbitMQ for microservice communication
- PostgreSQL database

### Testing the APIs:
1. **Get Authentication Tokens**: Login as doctor and assistant users
2. **Test Doctor Functions**: Start with inviting assistants
3. **Test Assistant Functions**: Accept invitations and view workplaces
4. **Test Management**: Remove assistants and cancel invitations

### Error Handling:
All APIs return consistent error responses:
```json
{
  "success": false,
  "status": 403,
  "message": "Doctor access required",
  "error": "Forbidden"
}
```

---

## 📋 Testing Checklist

- [ ] **Doctor can invite assistant to workplace**
- [ ] **Assistant receives and can view invitations**
- [ ] **Assistant can accept/reject invitations**
- [ ] **Doctor can view all their assistants**
- [ ] **Assistant can view assigned workplaces**
- [ ] **Doctor can remove assistant from workplace**
- [ ] **Assistant can leave workplace voluntarily**
- [ ] **Doctor can cancel pending invitations**
- [ ] **Proper error handling for unauthorized access**
- [ ] **Invitation expiry functionality**

---

## 🔧 Technical Details

### Message Patterns (Internal):
- `invite_assistant`
- `respond_to_invite`
- `get_my_invites`
- `get_my_assistants`
- `get_doctor_pending_invites`
- `remove_assistant`
- `cancel_invite`
- `get_assistant_workplaces`
- `leave_workplace`

### Database Tables:
- `assistant_invites` - Stores invitation data
- `doctor_workplace_assistants` - Tracks assignments
- `doctor_workplaces` - Workplace information
- `addresses` - Workplace addresses
- `users` - User accounts

### Status Values:
- **Invitation Status**: `pending`, `accepted`, `rejected`, `expired`
- **Assignment Status**: `active`, `inactive`, `removed`

---

## 📞 Support

For technical support or questions about the assistant system:
- Check the API responses for detailed error messages
- Verify authentication tokens are valid and not expired
- Ensure proper role permissions for each endpoint
- Check database connectivity and RabbitMQ status

---

*Last updated: January 2024*
