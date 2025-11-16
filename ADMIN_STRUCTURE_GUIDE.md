# Admin System Restructure Guide

## Overview
This document outlines the new admin system structure for the Learning Management System (LMS). The system has been restructured to clearly separate **Staff** (previously Admin) and **Super Admin** (now Admin) roles.

## Structure Changes

### Previous Structure
- `admin` → Staff members (teachers, instructors)
- `super-admin` → System administrators

### New Structure
- `staff` → Staff members (teachers, instructors) - manages courses, students, content
- `admin` → Super administrators - manages entire system including students, staff, and other admins

## Directory Structure

```
src/
├── Components/
│   ├── admin/              # Staff components (unchanged functionality)
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── ... (course management components)
│   │
│   └── super-admin/        # NEW: Super Admin components
│       ├── AdminLayout.tsx
│       ├── AdminSidebar.tsx
│       ├── AdminHeader.tsx
│       └── dialogs/
│           ├── CreateStudentDialog.tsx
│           ├── CreateStaffDialog.tsx
│           ├── CreateAdminDialog.tsx
│           └── ActivityLogsDialog.tsx
│
└── pages/
    ├── admin/              # Staff pages (unchanged functionality)
    │   ├── dashboard/
    │   ├── course/
    │   ├── exams/
    │   └── ...
    │
    └── super-admin/        # NEW: Super Admin pages
        ├── dashboard/
        │   └── DashboardPage.tsx
        ├── profile/
        │   └── ProfilePage.tsx
        ├── students/
        │   └── StudentsPage.tsx
        ├── staff/
        │   └── StaffPage.tsx
        └── admins/
            └── AdminsPage.tsx
```

## Super Admin Features

### 1. Authentication (4 features)
✅ **1.1 Admin Login** → Uses existing auth system  
✅ **1.2 Get Admin Profile** → `/super-admin/profile`  
✅ **1.3 Update Admin Profile** → Profile page with edit capabilities  
✅ **1.4 Admin Logout** → Integrated in header and sidebar  

### 2. Managing Students (8 features)
✅ **2.1 Get All Students** → `/super-admin/students` with pagination & filters  
✅ **2.2 Get Student Statistics** → Dashboard cards showing student metrics  
✅ **2.3 Get Single Student** → Click on student row for details  
✅ **2.4 Create New Student** → CreateStudentDialog component  
✅ **2.5 Update Student Info** → Edit action in dropdown menu  
✅ **2.6 Deactivate Student** → Deactivate action in dropdown menu  
✅ **2.7 Activate Student** → Activate action in dropdown menu  
✅ **2.8 Reset Student Password** → Reset password action (sends email)  

### 3. Managing Staff (5 features)
✅ **3.1 Get All Staff** → `/super-admin/staff` with search & filters  
✅ **3.2 Create New Staff** → CreateStaffDialog component  
✅ **3.3 Update Staff Info** → Edit action in dropdown menu  
✅ **3.4 Deactivate Staff** → Deactivate action in dropdown menu  
✅ **3.5 Reset Staff Password** → Reset password action (sends email)  

### 4. Managing Admins (5 features)
✅ **4.1 Get All Admins** → `/super-admin/admins` with search & filters  
✅ **4.2 Create New Admin** → CreateAdminDialog component (sends welcome email)  
✅ **4.3 Update Admin Info** → Edit action in dropdown menu  
✅ **4.4 Deactivate Admin** → Deactivate action in dropdown menu  
✅ **4.5 View Activity Logs** → ActivityLogsDialog component for audit trail  

## Routes

### Staff Routes (unchanged)
```
/admin/dashboard          → Staff dashboard
/admin/courses           → Course management
/admin/courses/:id       → Course details
/admin/exams             → Exam management
/admin/discussions       → Discussion forums
/admin/results           → Student results
```

### Super Admin Routes (NEW)
```
/super-admin/dashboard   → Super admin dashboard
/super-admin/profile     → Admin profile & settings
/super-admin/students    → Student management
/super-admin/staff       → Staff management
/super-admin/admins      → Admin management
```

## Components

### Super Admin Layout Components
- **AdminLayout.tsx** → Main layout with sidebar and header
- **AdminSidebar.tsx** → Navigation sidebar with Dashboard, Students, Staff, Admins
- **AdminHeader.tsx** → Top header with user profile and notifications

### Dialog Components
- **CreateStudentDialog.tsx** → Form to create new students
- **CreateStaffDialog.tsx** → Form to create new staff with role selection
- **CreateAdminDialog.tsx** → Form to create new admins with warning alert
- **ActivityLogsDialog.tsx** → View audit trail of admin actions

## Pages

### DashboardPage.tsx
- Overview statistics (students, staff, admins, activity)
- Recent activity feed
- Quick action buttons

### ProfilePage.tsx
- View and edit admin profile
- Update personal information
- Change password
- Security settings

### StudentsPage.tsx
- Student statistics cards
- Searchable table with filters
- Actions: Create, Edit, Deactivate/Activate, Reset Password
- Pagination support

### StaffPage.tsx
- Staff statistics cards
- Searchable table with filters
- Actions: Create, Edit, Deactivate, Reset Password
- Role-based filtering

### AdminsPage.tsx
- Admin statistics cards
- Searchable table with filters
- Actions: Create, Edit, Deactivate, View Activity Logs
- Recent activity log section

## Implementation Notes

### 🔴 TODO: API Integration
All pages currently use placeholder data. You need to:
1. Create API endpoints for:
   - Student CRUD operations
   - Staff CRUD operations
   - Admin CRUD operations
   - Activity logging
   - Statistics/analytics

2. Update the following files with actual API calls:
   - `src/pages/super-admin/students/StudentsPage.tsx`
   - `src/pages/super-admin/staff/StaffPage.tsx`
   - `src/pages/super-admin/admins/AdminsPage.tsx`
   - `src/pages/super-admin/dashboard/DashboardPage.tsx`
   - All dialog components in `src/Components/super-admin/dialogs/`

### 🟡 TODO: Authentication
1. Update AuthContext to distinguish between:
   - Regular Admin (Staff)
   - Super Admin
2. Add role-based access control
3. Update login flow to redirect based on role

### 🟢 Completed
- ✅ Created all page components with placeholder UI
- ✅ Created all dialog components for CRUD operations
- ✅ Set up routing in App.tsx
- ✅ Created layout components (Sidebar, Header)
- ✅ Added proper navigation and user experience
- ✅ Implemented search and filter UI
- ✅ Added statistics cards
- ✅ Created activity log viewer

## Next Steps

1. **API Development**
   - Create backend endpoints for all features
   - Implement authentication and authorization
   - Add role-based permissions

2. **Data Integration**
   - Connect all placeholder components to real APIs
   - Implement data fetching hooks
   - Add loading and error states

3. **Testing**
   - Test all CRUD operations
   - Verify email notifications
   - Test role-based access control
   - Validate data persistence

4. **Enhancement**
   - Add data export functionality
   - Implement bulk operations
   - Add advanced filtering
   - Create analytics dashboards

## Design Patterns

### Component Structure
```tsx
// Each page follows this pattern:
- Header with title and actions
- Statistics cards (where applicable)
- Main content card with:
  - Search and filters
  - Data table
  - Action dropdowns
```

### Dialog Pattern
```tsx
// All dialogs follow this structure:
- Dialog header with title and description
- Form with validated inputs
- Footer with Cancel and Submit buttons
- Toast notifications for success/error
```

### State Management
- Local state for UI interactions
- API calls with loading states
- Toast notifications for user feedback
- Error handling with try-catch blocks

## UI Components Used

- **shadcn/ui components:**
  - Card, CardHeader, CardTitle, CardDescription, CardContent
  - Button, Input, Label
  - Dialog, DialogContent, DialogHeader
  - Table, TableHeader, TableBody, TableRow, TableCell
  - Badge, Avatar, AvatarFallback
  - Select, SelectTrigger, SelectContent, SelectItem
  - DropdownMenu
  - Alert, AlertDescription

- **Lucide React icons:**
  - Users, UserCog, Shield, Activity
  - Plus, Search, Filter, MoreVertical
  - Edit, Trash, CheckCircle, XCircle, Key
  - Calendar, Clock, User, Mail, Phone, MapPin

## Styling

All components use:
- Tailwind CSS for styling
- Dark mode support via ThemeProvider
- Responsive design (mobile, tablet, desktop)
- Consistent spacing and colors
- Accessible UI elements

---

**Last Updated:** November 13, 2024  
**Version:** 1.0.0  
**Status:** Structure Complete, API Integration Pending

