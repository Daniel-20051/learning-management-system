# Student Course Registration Flow

## Overview

This document describes the complete Student Course Registration Flow implementation. The system allows administrators to allocate courses to students, and students can then register for all their allocated courses at once using their wallet balance.

---

## Flow Diagram

```
┌──────────────┐
│ Admin        │
│ Allocates    │──► Courses marked as "allocated" for student
│ Courses      │    in CourseReg table
└──────────────┘

        │
        ▼

┌──────────────────────────────────────────────────────┐
│ Step 1: Student Logs In                              │
│ - Authenticates with JWT token                       │
│ - System checks student is active                    │
└──────────────────────────────────────────────────────┘

        │
        ▼

┌──────────────────────────────────────────────────────┐
│ Step 2: View Allocated Courses                       │
│ Endpoint: GET /api/courses/allocated                 │
│                                                       │
│ System:                                              │
│ - Finds current active semester (by date/status)     │
│ - Gets courses with registration_status="allocated"  │
│ - Calculates total cost from allocated_price         │
│ - Checks if registration deadline has passed         │
│                                                       │
│ Response includes:                                   │
│ - Semester info (year, semester, deadline, status)   │
│ - List of allocated courses (code, title, units)     │
│ - Individual course prices                           │
│ - Total registration amount                          │
│ - can_register flag                                  │
│ - Student's wallet balance                           │
└──────────────────────────────────────────────────────┘

        │
        ▼

┌──────────────────────────────────────────────────────┐
│ Step 3: Student Reviews                              │
│                                                       │
│ Student sees:                                        │
│ - All allocated courses with details                 │
│ - Individual prices                                  │
│ - Total amount                                       │
│ - Registration deadline                              │
│ - Wallet balance                                     │
│ - Remaining balance after registration               │
└──────────────────────────────────────────────────────┘

        │
        ▼

┌──────────────────────────────────────────────────────┐
│ Step 4: Register for All Courses                     │
│ Endpoint: POST /api/courses/register-allocated       │
│                                                       │
│ System validates:                                    │
│ ✓ Student is active                                  │
│ ✓ Current semester exists                            │
│ ✓ Registration deadline not passed                   │
│ ✓ Sufficient wallet balance                          │
│                                                       │
│ If valid, system:                                    │
│ 1. Creates CourseOrder record                        │
│ 2. Creates Funding debit transaction                 │
│ 3. Updates student wallet_balance                    │
│ 4. Updates all CourseReg records:                    │
│    - registration_status → "registered"              │
│    - registered_at → current timestamp               │
│    - allocated_price → current semester price        │
│    - Links to CourseOrder via course_reg_id          │
└──────────────────────────────────────────────────────┘

        │
        ▼

┌──────────────────────────────────────────────────────┐
│ Post-Registration                                     │
│                                                       │
│ ✓ Courses appear in enrolled courses                 │
│ ✓ Wallet balance reduced                             │
│ ✓ Transaction recorded in Funding table              │
│ ✓ Student can access course materials                │
│ ✓ Admin can see registered students                  │
└──────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Frontend Implementation

#### 1. **API Methods** (`src/api/courses.ts`)

```typescript
// Get allocated courses for current semester
async GetAllocatedCourses() {
  const response = await axios.get(`${BASE_URL}/api/courses/allocated`, {
    headers: getAuthHeaders()
  });
  return response;
}

// Register for all allocated courses
async RegisterAllocatedCourses() {
  const response = await axios.post(
    `${BASE_URL}/api/courses/register-allocated`,
    {},
    { headers: getAuthHeaders() }
  );
  return response;
}
```

#### 2. **AllocatedCoursesPage** (`src/pages/student/allocated-courses/AllocatedCoursesPage.tsx`)

Features:
- Displays semester information (year, semester, deadline)
- Shows wallet balance prominently
- Lists all allocated courses with:
  - Course code and title
  - Course type (Core/Elective)
  - Units
  - Individual price
  - Registration status badge if already registered
- Shows total registration cost
- Validates wallet balance before allowing registration
- Confirmation dialog before processing payment
- Real-time status updates

#### 3. **Navigation**

Added "Course Registration" link in the user dropdown menu:
- Icon: GraduationCap
- Route: `/allocated-courses`
- Visible only to students (not admins)

#### 4. **Route Configuration** (`src/App.tsx`)

```typescript
<Route
  path="/allocated-courses"
  element={
    isLoggedIn ? <AllocatedCoursesPage /> : <Navigate to="/" replace />
  }
/>
```

---

## Key Features

### All-or-Nothing Registration
- Students must register for ALL allocated courses at once
- Cannot register for individual courses from allocated list
- Prevents partial registrations

### Wallet Integration
- Real-time balance checking
- Shows remaining balance after registration
- Prevents registration if insufficient funds
- Automatic deduction on successful registration

### Deadline Enforcement
- Registration deadline displayed prominently
- System prevents registration after deadline passes
- Admin can extend deadlines if needed

### Price Synchronization
- Uses current semester prices at registration time
- Updates allocated_price if price changed since allocation
- Ensures accurate billing

### Transaction Tracking
- Every registration creates:
  - CourseOrder record (for order tracking)
  - Funding transaction (for financial audit)
  - Updated CourseReg records (for course enrollment)

### Status Management
- Clear status transitions: `allocated` → `registered`
- Visual badges show registration status
- Timestamp recorded for each registration

---

## User Experience Flow

### 1. **Student Dashboard**
   - Click user avatar → "Course Registration"

### 2. **Allocated Courses Page**
   ```
   ┌─────────────────────────────────────────────┐
   │ Course Registration                         │
   ├─────────────────────────────────────────────┤
   │ Semester Information                        │
   │ - Academic Year: 2023/2024                  │
   │ - Semester: 1ST                             │
   │ - Deadline: December 31, 2024               │
   │ - Status: Open for Registration             │
   ├─────────────────────────────────────────────┤
   │ Wallet Balance                              │
   │ ₦ 150,000.00                                │
   ├─────────────────────────────────────────────┤
   │ Allocated Courses (5)                       │
   │                                             │
   │ [CSC101] Introduction to Computing          │
   │ Core • 3 Units                    ₦10,000   │
   │                                             │
   │ [MTH101] Elementary Mathematics             │
   │ Core • 3 Units                    ₦10,000   │
   │                                             │
   │ ... (more courses)                          │
   ├─────────────────────────────────────────────┤
   │ Total: ₦50,000.00    [Register All Courses] │
   └─────────────────────────────────────────────┘
   ```

### 3. **Confirmation Dialog**
   - Shows breakdown of costs
   - Displays current balance
   - Shows remaining balance after registration
   - Requires explicit confirmation

### 4. **Success**
   - Success message displayed
   - Redirects to enrolled courses
   - Courses now accessible

---

## Error Handling

### Frontend Validation
- Insufficient wallet balance → Show error, disable button
- Deadline passed → Show warning, disable registration
- No allocated courses → Show empty state message

### Backend Validation (Expected)
- Invalid student → 401 Unauthorized
- Deadline passed → 403 Forbidden
- Insufficient balance → 400 Bad Request
- No allocated courses → 404 Not Found
- Already registered → 409 Conflict

---

## Security Considerations

1. **Authentication**
   - All endpoints require valid JWT token
   - Token sent in Authorization header

2. **Authorization**
   - Students can only see/register their own courses
   - Admin-only endpoints separated

3. **Transaction Integrity**
   - Atomic operations (all-or-nothing)
   - Balance checks before deduction
   - Transaction records for audit trail

4. **Data Validation**
   - Deadline enforcement
   - Price validation
   - Status consistency checks

---

## Backend Requirements

The backend API should implement the following endpoints:

### `GET /api/courses/allocated`

**Response:**
```json
{
  "success": true,
  "data": {
    "semester": {
      "academic_year": "2023/2024",
      "semester": "1ST",
      "registration_deadline": "2024-12-31T23:59:59Z",
      "deadline_passed": false
    },
    "courses": [
      {
        "id": 1,
        "course_id": 101,
        "course_code": "CSC101",
        "title": "Introduction to Computing",
        "units": 3,
        "course_type": "C",
        "allocated_price": "10000",
        "registration_status": "allocated"
      }
    ],
    "total_amount": 50000,
    "can_register": true,
    "wallet_balance": 150000,
    "currency": "NGN"
  }
}
```

### `POST /api/courses/register-allocated`

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for 5 courses",
  "data": {
    "order_id": 12345,
    "courses_registered": 5,
    "amount_paid": 50000,
    "new_balance": 100000,
    "transaction_id": "TXN-20241205-12345"
  }
}
```

---

## Database Schema Requirements

### CourseReg Table
```sql
- id
- student_id
- course_id
- academic_year
- semester
- registration_status: 'allocated' | 'registered' | 'completed'
- allocated_price
- registered_at
- course_order_id (FK to CourseOrder)
```

### CourseOrder Table
```sql
- id
- student_id
- order_date
- total_amount
- status
- payment_method: 'wallet'
```

### Funding Table
```sql
- id
- student_id
- transaction_type: 'credit' | 'debit'
- amount
- purpose: 'course_registration'
- reference_id (links to CourseOrder)
- timestamp
```

---

## Testing Checklist

- [ ] Student can view allocated courses
- [ ] Semester information displays correctly
- [ ] Wallet balance shows accurately
- [ ] Course list shows all allocated courses
- [ ] Total amount calculates correctly
- [ ] Registration button disabled when balance insufficient
- [ ] Registration button disabled when deadline passed
- [ ] Confirmation dialog shows correct information
- [ ] Registration processes successfully
- [ ] Wallet balance updates after registration
- [ ] Courses show as "registered" after registration
- [ ] Student redirected to enrolled courses
- [ ] Transaction recorded in funding table
- [ ] Already registered courses cannot be re-registered
- [ ] Error messages display appropriately
- [ ] Navigation link works correctly

---

## Future Enhancements

1. **Partial Registration Option**
   - Allow students to select specific courses
   - Register for subset of allocated courses

2. **Payment Plans**
   - Installment payments
   - Split registration across multiple transactions

3. **Course Waitlisting**
   - Waitlist when course is full
   - Auto-register when space available

4. **Registration Reminders**
   - Email/SMS notifications
   - Deadline reminders

5. **Mobile App**
   - Native iOS/Android apps
   - Push notifications

---

## Support

For issues or questions about the course registration flow:
- Check backend API logs
- Verify student wallet balance
- Confirm semester configuration
- Check registration deadline settings
- Review CourseReg table for allocation status

---

## Changelog

### Version 1.0.0 (December 5, 2024)
- Initial implementation of course registration flow
- Added allocated courses page
- Integrated wallet balance checking
- Implemented all-or-nothing registration
- Added navigation link
- Created comprehensive documentation

