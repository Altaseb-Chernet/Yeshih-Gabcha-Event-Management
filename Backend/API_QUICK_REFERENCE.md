# Habesha Events API - Quick Reference

## Base URL
```
http://localhost/api
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/2fa/verify` | Verify 2FA OTP | ❌ |
| POST | `/auth/2fa/enable` | Enable 2FA | ✅ |
| POST | `/auth/2fa/disable` | Disable 2FA | ✅ |
| POST | `/auth/change-password` | Change password | ✅ |
| POST | `/auth/resend-verification` | Resend verification email | ✅ |
| GET | `/auth/verify-email?token={token}` | Verify email | ❌ |

---

## 👤 User Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users/me` | Get current user | ✅ | Any |
| PUT | `/users/me` | Update profile | ✅ | Any |
| PUT | `/users/me/profile-image-upload` | Upload profile image | ✅ | Any |
| GET | `/users/profile` | Get profile (alias) | ✅ | Any |
| PUT | `/users/profile` | Update profile (alias) | ✅ | Any |
| PUT | `/users/change-password` | Change password | ✅ | Any |
| PUT | `/users/deactivate` | Deactivate account | ✅ | Any |
| GET | `/users/admin/users` | List all users | ✅ | Admin |
| PUT | `/users/admin/users/{id}` | Update user status | ✅ | Admin |

---

## 📅 Booking Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/bookings/calc-price` | Calculate booking price | ✅ | User |
| POST | `/bookings` | Create booking | ✅ | User |
| GET | `/bookings/my-bookings` | Get my bookings | ✅ | User |
| GET | `/bookings/{id}` | Get booking by ID | ✅ | User |
| POST | `/bookings/{id}/proceed-payment` | Initiate payment | ✅ | User |
| GET | `/bookings/{id}/qr` | Get booking QR code | ✅ | User |
| GET | `/bookings/admin/bookings` | List all bookings | ✅ | Admin |
| PUT | `/bookings/admin/bookings/{id}/status` | Update booking status | ✅ | Admin |

---

## 🎉 Event Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/events` | List events | ❌ | Public |
| GET | `/events/{id}` | Get event by ID | ❌ | Public |
| POST | `/events/{id}/proceed-payment` | Buy event ticket | ✅ | User |
| POST | `/events` | Create event | ✅ | Admin |
| PUT | `/events/{id}` | Update event | ✅ | Admin |
| DELETE | `/events/{id}` | Delete event | ✅ | Admin |

---

## 🛠️ Service Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/services` | List services | ❌ | Public |
| GET | `/services/{id}` | Get service by ID | ❌ | Public |
| POST | `/services` | Create service | ✅ | Admin |
| PUT | `/services/{id}` | Update service | ✅ | Admin |
| DELETE | `/services/{id}` | Delete service | ✅ | Admin |
| DELETE | `/services/{id}/images/{index}` | Delete service image | ✅ | Admin |

---

## 🖼️ Gallery Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/gallery` | List gallery items | ❌ | Public |
| GET | `/gallery/{id}` | Get gallery item | ❌ | Public |
| POST | `/gallery/{id}/reaction` | Add reaction | ✅ | User |
| POST | `/gallery` | Create gallery item | ✅ | Admin |
| PUT | `/gallery/{id}` | Update gallery item | ✅ | Admin |
| DELETE | `/gallery/{id}` | Delete gallery item | ✅ | Admin |

---

## 💳 Payment Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/payments/my-payments` | Get my payments | ✅ | User |
| GET | `/payments/{id}` | Get payment by ID | ✅ | User |
| POST | `/payments/{id}/proof` | Upload payment proof | ✅ | User |
| GET | `/payments/admin/payments` | List all payments | ✅ | Admin |
| GET | `/payments/admin/event-payments` | List event payments | ✅ | Admin |
| POST | `/payments/{id}/process` | Approve/reject payment | ✅ | Admin |

---

## 📊 Reports & Dashboard Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/reports/admin/dashboard/metrics` | Dashboard metrics | ✅ | Admin |
| GET | `/reports/admin/reports/bookings-over-time` | Bookings chart | ✅ | Admin |
| GET | `/reports/admin/reports/revenue-over-time` | Revenue chart | ✅ | Admin |
| GET | `/reports/admin/reports/service-distribution` | Service stats | ✅ | Admin |
| GET | `/reports/admin/reports/user-growth` | User growth chart | ✅ | Admin |
| GET | `/reports/admin/reports/traffic-source` | Traffic analytics | ✅ | Admin |
| GET | `/reports/admin/reports/event-stats` | Event statistics | ✅ | Admin |

---

## ⚙️ Admin Config Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin-config/pricing-rules` | Get pricing rules | ✅ | Admin |
| PUT | `/admin-config/pricing-rules/{eventType}` | Update pricing rule | ✅ | Admin |
| GET | `/admin-config/payment-methods` | Get payment methods | ✅ | Admin |
| PUT | `/admin-config/payment-methods/{method}` | Update payment method | ✅ | Admin |

---

## 🔔 Notification Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/notifications/admin` | Get notifications | ✅ | Admin |
| GET | `/notifications/admin/unread-count` | Get unread count | ✅ | Admin |
| PATCH | `/notifications/admin/{id}/read` | Mark as read | ✅ | Admin |
| PATCH | `/notifications/admin/read-all` | Mark all as read | ✅ | Admin |

---

## 📝 Common Request Examples

### Register User
```json
POST /auth/register
{
  "firstName": "Abebe",
  "lastName": "Kebede",
  "email": "abebe@example.com",
  "phone": "0911223344",
  "password": "SecurePass123"
}
```

### Login
```json
POST /auth/login
{
  "identifier": "abebe@example.com",
  "password": "SecurePass123"
}
```

### Calculate Booking Price
```json
POST /bookings/calc-price
{
  "eventType": "wedding",
  "guestCount": 150,
  "durationHours": 5,
  "eventDate": "2026-06-15",
  "eventTime": "14:00"
}
```

### Create Booking
```json
POST /bookings
{
  "customerName": "Abebe Kebede",
  "customerEmail": "abebe@example.com",
  "customerPhone": "0911223344",
  "eventType": "wedding",
  "eventDate": "2026-06-15",
  "eventTime": "14:00",
  "guestCount": 150,
  "durationHours": 5,
  "message": "Please arrange floral decorations"
}
```

### Initiate Payment
```json
POST /bookings/{id}/proceed-payment
{
  "paymentMethod": "telebirr",
  "phoneNumber": "0911223344"
}
```

---

## 🎯 Query Parameters

### Pagination
- `limit` - Number of items per page (default: 20)
- `offset` - Number of items to skip (default: 0)

### Filtering
- `status` - Filter by status (varies by endpoint)
- `category` - Filter by category
- `eventType` - Filter by event type
- `search` - Search term
- `role` - Filter by user role
- `method` - Filter by payment method
- `groupBy` - Group data by time period (day/week/month)
- `from` - Start date for date range
- `to` - End date for date range

---

## 📤 File Upload Endpoints

These endpoints accept `multipart/form-data`:

1. **Profile Image**: `PUT /users/me/profile-image-upload`
   - Field: `profileImage`
   - Max size: 5MB

2. **Service Images**: `POST /services`, `PUT /services/{id}`
   - Field: `images` (multiple files)
   - Max size: 10MB per file

3. **Event Image**: `POST /events`, `PUT /events/{id}`
   - Field: `image`
   - Max size: 10MB

4. **Gallery Image**: `POST /gallery`
   - Field: `image`
   - Max size: 10MB

5. **Payment Proof**: `POST /payments/{id}/proof`
   - Field: `proof`
   - Max size: 5MB

---

## 🔑 Event Types
- `wedding` - Wedding ceremonies
- `birthday` - Birthday parties
- `corporate` - Corporate events
- `other` - Other event types

## 💰 Payment Methods
- `telebirr` - Telebirr mobile money
- `cbe` - Commercial Bank of Ethiopia
- `commercial` - Commercial Bank
- `abyssinia` - Abyssinia Bank

## 📊 Booking Status
- `pending` - Awaiting confirmation
- `confirmed` - Confirmed and paid
- `cancelled` - Cancelled
- `completed` - Event completed

## 💳 Payment Status
- `pending` - Awaiting admin approval
- `approved` - Payment approved
- `rejected` - Payment rejected

---

## 🚀 Quick Test Flow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Get token
3. **Browse Events**: `GET /events`
4. **Calculate Price**: `POST /bookings/calc-price`
5. **Create Booking**: `POST /bookings`
6. **Initiate Payment**: `POST /bookings/{id}/proceed-payment`
7. **Upload Proof**: `POST /payments/{id}/proof`
8. **Admin Approves**: `POST /payments/{id}/process`
9. **Get QR Code**: `GET /bookings/{id}/qr`

---

For detailed request/response schemas, see `swagger.yaml` or open `swagger-ui.html` in your browser.
