# Backend API Documentation

## Overview

The backend is a Laravel 11 API using:
- **Authentication**: Laravel Sanctum (token-based)
- **Database**: MySQL with Eloquent ORM
- **Architecture**: RESTful API with JSON:API-inspired responses
- **Authorization**: Policy-based (Laravel Policies)

**Base URL**: `http://localhost:8000` (configured via `NEXT_PUBLIC_API_URL`)

---

## Authentication Flow

### 1. Login
**Endpoint**: `POST /api/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "message": "Authenticated",
  "status": 200,
  "data": {
    "token": "1|abc123...",
    "user": {
      "type": "users",
      "id": 1,
      "attributes": {
        "name": "John Doe",
        "email": "user@example.com",
        "role": "admin",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z",
        "deletedAt": null
      },
      "relationships": {
        "patient": null
      },
      "links": {
        "self": "http://localhost:8000/api/user"
      }
    }
  }
}
```

**Error** (401):
```json
{
  "message": "Invalid credentials",
  "status": 401
}
```

### 2. Get Current User
**Endpoint**: `GET /api/user`
**Auth**: Required (Bearer token)

**Response** (200):
```json
{
  "message": "Profile retrieved",
  "status": 200,
  "data": {
    "user": { /* UserResource */ }
  }
}
```

### 3. Logout
**Endpoint**: `POST /api/logout`
**Auth**: Required

**Response**: 204 No Content

---

## User Roles

The system has 3 roles:
- **`admin`**: Full access (CRUD users, patients, visits)
- **`doktor`**: Can view/manage patients and visits
- **`pacijent`**: Can only view their own patient record

---

## Response Structure

### Standard Success Response
```json
{
  "message": "Operation successful",
  "status": 200,
  "data": {
    /* resource data */
  }
}
```

### Paginated Response
```json
{
  "message": "Resources retrieved successfully",
  "status": 200,
  "data": [
    /* array of resources */
  ],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 73
  },
  "links": {
    "first": "http://localhost:8000/api/patients?page=1",
    "last": "http://localhost:8000/api/patients?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/patients?page=2"
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "status": 400,
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

---

## Patients API

### List Patients
**Endpoint**: `GET /api/patients`
**Auth**: Required
**Permissions**: 
- Admin/Doctor: See all patients
- Patient: See only their own record

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)

**Response** (200):
```json
{
  "message": "Patients retrieved successfully.",
  "status": 200,
  "data": [
    {
      "type": "patient",
      "id": "1",
      "attributes": {
        "firstName": "Jane",
        "lastName": "Smith",
        "fullName": "Jane Smith",
        "dateOfBirth": "1990-05-15",
        "gender": "F",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "New York",
        "postalCode": "10001",
        "emergencyContactName": "John Smith",
        "emergencyContactPhone": "+0987654321",
        "bloodType": "A+",
        "allergies": "Penicillin",
        "medicalNotes": "Diabetic",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z"
      },
      "relationships": {
        "user": {
          "data": {
            "type": "user",
            "id": "5"
          }
        },
        "socioeconomic": {
          "data": {
            "type": "patient_socioeconomic",
            "id": "1"
          }
        }
      }
    }
  ],
  "meta": { /* pagination meta */ },
  "links": { /* pagination links */ }
}
```

### Get Single Patient
**Endpoint**: `GET /api/patients/{id}`
**Auth**: Required
**Permissions**: Admin/Doctor can view any, Patient can view only their own

**Response** (200):
```json
{
  "message": "Patient retrieved successfully.",
  "status": 200,
  "data": {
    "patient": {
      "type": "patient",
      "id": "1",
      "attributes": { /* same as list */ },
      "relationships": { /* same as list */ }
    }
  }
}
```

### Create Patient
**Endpoint**: `POST /api/patients`
**Auth**: Required
**Permissions**: Admin/Doctor only

**Request Body**:
```json
{
  "user_id": 5,
  "first_name": "Jane",
  "last_name": "Smith",
  "date_of_birth": "1990-05-15",
  "gender": "F",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postal_code": "10001",
  "emergency_contact_name": "John Smith",
  "emergency_contact_phone": "+0987654321",
  "blood_type": "A+",
  "allergies": "Penicillin",
  "medical_notes": "Diabetic",
  "socioeconomic": {
    "marital_status": "married",
    "number_of_dependents": 2,
    "employment_status": "employed_full_time",
    "income_level": "middle",
    "has_health_insurance": true,
    "smoking_status": "never",
    "alcohol_consumption": "occasional",
    "physical_activity_level": "moderately_active",
    "food_security_status": "food_secure",
    "additional_notes": "Notes here"
  }
}
```

**Required Fields**:
- `user_id` (integer, must exist in users table)
- `first_name` (string, max 50)
- `last_name` (string, max 50)
- `date_of_birth` (date, before today)
- `gender` (enum: `M`, `F`)
- `phone` (string, max 33)
- `emergency_contact_name` (string, max 100)
- `emergency_contact_phone` (string, max 50)

**Optional Fields**:
- `address`, `city`, `postal_code`
- `blood_type` (enum: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
- `allergies`, `medical_notes`
- `socioeconomic` (entire object is optional)

**Response** (201):
```json
{
  "message": "Patient created successfully.",
  "status": 201,
  "data": {
    "patient": { /* PatientResource */ }
  }
}
```

### Update Patient
**Endpoint**: `PUT /api/patients/{id}` or `PATCH /api/patients/{id}`
**Auth**: Required
**Permissions**: Admin/Doctor can update any, Patient can update only their own

**Request Body**: Same as create, but all fields are optional (partial update)

**Note**: `user_id` cannot be changed (prohibited)

**Response** (200):
```json
{
  "message": "Patient updated successfully.",
  "status": 200,
  "data": {
    "patient": { /* PatientResource */ }
  }
}
```

### Delete Patient
**Endpoint**: `DELETE /api/patients/{id}`
**Auth**: Required
**Permissions**: Admin/Doctor only

**Response**: 204 No Content

**Note**: Soft delete - patient is marked as deleted but not removed from database. Socioeconomic data is also soft-deleted automatically.

---

## Socioeconomic Data

Socioeconomic data is embedded within the patient resource. It's automatically created/updated when included in patient create/update requests.

### Enum Values

**marital_status**:
- `single`, `married`, `divorced`, `widowed`, `separated`, `other`

**employment_status**:
- `employed_full_time`, `employed_part_time`, `self_employed`, `unemployed`, `retired`, `student`, `unable_to_work`, `other`

**income_level**:
- `low`, `lower_middle`, `middle`, `upper_middle`, `high`

**smoking_status**:
- `never`, `former`, `current_light`, `current_heavy`

**alcohol_consumption**:
- `none`, `occasional`, `moderate`, `heavy`

**physical_activity_level**:
- `sedentary`, `lightly_active`, `moderately_active`, `very_active`

**food_security_status**:
- `food_secure`, `food_insecure`, `unsure`

---

## Users API

### List Users
**Endpoint**: `GET /api/users`
**Auth**: Required
**Permissions**: Admin/Doctor only

**Response** (200): Paginated list of UserResource

### Get User
**Endpoint**: `GET /api/users/{id}`
**Auth**: Required
**Permissions**: Admin/Doctor only

**Response** (200):
```json
{
  "message": "User retrieved",
  "status": 200,
  "data": {
    "user": { /* UserResource */ }
  }
}
```

### Create User
**Endpoint**: `POST /api/users`
**Auth**: Required
**Permissions**: Admin only

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "doktor"
}
```

**Response** (201):
```json
{
  "message": "User created successfully.",
  "status": 201,
  "data": {
    "user": { /* UserResource */ }
  }
}
```

### Update User
**Endpoint**: `PUT /api/users/{id}`
**Auth**: Required
**Permissions**: Admin only

**Request**: Same as create (all fields optional)

**Response** (200):
```json
{
  "message": "User updated successfully.",
  "status": 200,
  "data": {
    "user": { /* UserResource */ }
  }
}
```

### Delete User (Soft Delete)
**Endpoint**: `DELETE /api/users/{id}`
**Auth**: Required
**Permissions**: Admin only

**Response**: 204 No Content

### Restore User
**Endpoint**: `POST /api/users/{id}/restore`
**Auth**: Required
**Permissions**: Admin only

**Response** (200):
```json
{
  "message": "User restored successfully.",
  "status": 200,
  "data": {
    "user": { /* UserResource */ }
  }
}
```

### Force Delete User
**Endpoint**: `DELETE /api/users/{id}/force`
**Auth**: Required
**Permissions**: Admin only

**Response**: 204 No Content

**Warning**: Permanently deletes user from database

---

## Visits API (Coming Soon)

The backend has a `Visit` model ready:
- `patient_id`: Foreign key to patients
- `doctor_id`: Foreign key to users (doctor)
- `date`: Visit date/time
- `notes`: Visit notes

**Note**: Visit endpoints are not yet implemented in the routes file.

---

## Frontend Integration

### API Client Setup

The frontend uses a custom API client (`frontend/src/api/client.ts`) that:

1. **Automatically adds Bearer token** from localStorage
2. **Handles 401 errors** by clearing token and redirecting to login
3. **Provides typed methods**: `client.get()`, `client.post()`, `client.put()`, `client.delete()`
4. **Throws ApiError** with status, message, and validation errors

### Example Usage

```typescript
import { client } from '@/api/client'

// Login
const response = await client.post<LoginResponse>('api/login', {
  email: 'user@example.com',
  password: 'password123'
})
localStorage.setItem('token', response.data.token)
localStorage.setItem('user', JSON.stringify(response.data.user))

// Get patients
const patients = await client.get<PatientsResponse>('api/patients?page=1')

// Create patient
const newPatient = await client.post<PatientResponse>('api/patients', {
  user_id: 5,
  first_name: 'Jane',
  last_name: 'Smith',
  // ... other fields
})

// Update patient
const updated = await client.put<PatientResponse>(`api/patients/${id}`, {
  phone: '+1234567890'
})

// Delete patient
await client.delete(`api/patients/${id}`)
```

### Error Handling

```typescript
try {
  const data = await client.get('api/patients')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status) // 400, 401, 404, etc.
    console.error(error.message) // Server error message
    console.error(error.payload?.errors) // Validation errors
  }
}
```

---

## TypeScript Types

You should create TypeScript interfaces matching the API responses:

```typescript
// User types
interface User {
  type: 'users'
  id: number
  attributes: {
    name: string
    email: string
    role: 'admin' | 'doktor' | 'pacijent'
    createdAt: string
    updatedAt: string
    deletedAt: string | null
  }
  relationships: {
    patient: Patient | null
  }
  links: {
    self: string
  }
}

// Patient types
interface Patient {
  type: 'patient'
  id: string
  attributes: {
    firstName: string
    lastName: string
    fullName: string
    dateOfBirth: string
    gender: 'M' | 'F'
    phone: string
    address: string | null
    city: string | null
    postalCode: string | null
    emergencyContactName: string
    emergencyContactPhone: string
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
    allergies: string | null
    medicalNotes: string | null
    createdAt: string
    updatedAt: string
  }
  relationships: {
    user: {
      data: {
        type: 'user'
        id: string
      } | null
    }
    socioeconomic: {
      data: {
        type: 'patient_socioeconomic'
        id: string
      } | null
    }
  }
}

// API Response types
interface ApiResponse<T> {
  message: string
  status: number
  data: T
}

interface PaginatedResponse<T> {
  message: string
  status: number
  data: T[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}
```

---

## Authorization Rules

### Patient Policies

- **viewAny**: Admin/Doctor can view all, Patient can view only their own
- **view**: Admin/Doctor can view any, Patient can view only their own
- **create**: Admin/Doctor only
- **update**: Admin/Doctor can update any, Patient can update only their own
- **delete**: Admin/Doctor only

### User Policies

- **viewAny**: Admin/Doctor only
- **view**: Admin/Doctor only
- **create**: Admin only
- **update**: Admin only
- **delete**: Admin only
- **restore**: Admin only
- **forceDelete**: Admin only

---

## Environment Variables

**Backend** (`.env`):
```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutribase
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

**Frontend** (`.env`):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get patients (with token)
curl -X GET http://localhost:8000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create patient
curl -X POST http://localhost:8000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"user_id":5,"first_name":"Jane","last_name":"Smith",...}'
```

### Using Postman/Insomnia

1. Create a new request
2. Set method and URL
3. Add header: `Authorization: Bearer YOUR_TOKEN`
4. Add header: `Content-Type: application/json`
5. Add JSON body for POST/PUT requests

---

## Next Steps for Frontend

1. **Create TypeScript types** for all API responses
2. **Build API service layer** with typed functions for each endpoint
3. **Implement authentication context** to manage token and user state
4. **Create patient forms** using the Vuexy form components
5. **Build patient list/detail pages** with MUI DataGrid
6. **Add error handling** with toast notifications
7. **Implement role-based UI** (show/hide features based on user role)
