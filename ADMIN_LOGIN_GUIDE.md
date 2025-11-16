# Admin Login Implementation Guide

## Overview
A separate admin login system has been implemented for super administrators to access the admin management portal.

## Features Implemented

### 1. **Separate Admin Login Page** ✅
- **Route**: `/admin-login`
- **Endpoint**: `https://lms-work.onrender.com/api/admin/login`
- **UI**: Clean, dedicated admin login interface with Shield icon
- **Navigation**: "Back to Student Login" button to return to main login

### 2. **Updated Main Login Page** ✅
- Added "Login as Admin" button in top-right corner
- Button includes Shield icon for visual distinction
- Clicking navigates to `/admin-login`

### 3. **Admin Authentication Flow** ✅
```
1. User clicks "Login as Admin" on main login page
   ↓
2. Redirects to /admin-login
   ↓
3. Admin enters credentials
   ↓
4. POST to /api/admin/login
   ↓
5. On success:
   - Stores access token in cookies
   - Stores admin data (with permissions) in cookies
   - Updates AuthContext with admin user
   - Redirects to /super-admin/dashboard
```

### 4. **Enhanced AuthContext** ✅
Updated to support multiple user roles:
- `isAdmin` - True for staff, super_admin, or admin roles
- `isSuperAdmin` - True for super_admin or admin roles
- `isStaff` - True for staff role only

User interface now includes:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "staff" | "student" | "super_admin" | "admin";
  permissions?: any;  // Stores admin permissions
  userType?: string;  // "admin" for super admins
}
```

### 5. **Role-Based Routing** ✅
```typescript
// Login redirect logic:
- super_admin/admin → /super-admin/dashboard
- staff → /admin/dashboard  
- student → /home

// Route protection:
- /super-admin/* → Only accessible by super_admin/admin roles
- /admin/* → Accessible by all admin types (staff, super_admin, admin)
- /admin-login → Public, redirects if already logged in
```

## API Integration

### Admin Login Endpoint
```typescript
POST https://lms-work.onrender.com/api/admin/login

Request:
{
  "email": "admin@pinnacleuniversity.co",
  "password": "your-password"
}

Response (Success):
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": 1,
      "firstName": "Super Updated",
      "lastName": "Admin",
      "email": "admin@pinnacleuniversity.co",
      "role": "super_admin",
      "permissions": {
        "staff": { "edit": true, "view": true, "create": true, "delete": true },
        "admins": { "edit": true, "view": true, "create": true, "delete": true },
        "system": { "logs": true, "settings": true, "analytics": true },
        "content": { "exams": true, "units": true, "modules": true, "quizzes": true },
        "courses": { "edit": true, "view": true, "create": true, "delete": true },
        "students": { "edit": true, "view": true, "create": true, "delete": true }
      },
      "status": "active",
      "profileImage": null
    },
    "accessToken": "eyJhbGci...",
    "userType": "admin",
    "expiresIn": 14400
  }
}
```

### Implementation in Code
```typescript
// src/api/auth.ts
async LoginAdmin(data: { email: string; password: string }) {
  const payload = { email: data.email, password: data.password };
  const response = await axios.post(`${BASE_URL}/api/admin/login`, payload);
  
  // Auto-stores access token in cookies
  if (response.data.success) {
    setAccessToken(response.data.data.accessToken);
  }
  
  return response;
}
```

## File Changes

### New Files Created
1. **`src/pages/AdminLogin.tsx`**
   - Dedicated admin login page
   - Form with email and password
   - Loading states and error handling
   - Integration with AuthContext

### Modified Files
1. **`src/pages/Login.tsx`**
   - Added "Login as Admin" button
   - Navigation to admin login page

2. **`src/api/auth.ts`**
   - Added `LoginAdmin()` method
   - Handles admin login endpoint

3. **`src/context/AuthContext.tsx`**
   - Extended User interface for admin roles
   - Added `isSuperAdmin` and `isStaff` helpers
   - Updated role checking logic

4. **`src/App.tsx`**
   - Added `/admin-login` route
   - Updated redirect logic for different roles
   - Protected super-admin routes

## Usage

### For Developers
1. **Starting the app**: Users see the main login page
2. **Admin access**: Click "Login as Admin" button
3. **Credentials**: Use super admin credentials
4. **Access**: After login, redirects to super admin dashboard

### For Users
1. **Student/Staff Login**: Use the main login page at `/`
2. **Super Admin Login**: Click "Login as Admin" → Enter super admin credentials

## Testing

### Test Admin Login
1. Navigate to the application
2. Click "Login as Admin" button (top-right)
3. Enter admin credentials:
   - Email: `admin@pinnacleuniversity.co`
   - Password: [your admin password]
4. Verify redirect to `/super-admin/dashboard`
5. Verify access to super admin features:
   - Students management
   - Staff management
   - Admins management
   - Activity logs

### Test Role-Based Access
1. **As Super Admin**:
   - Should access `/super-admin/*` routes
   - Should access `/admin/*` routes (staff features)

2. **As Staff**:
   - Should access `/admin/*` routes
   - Should NOT access `/super-admin/*` routes

3. **As Student**:
   - Should access student routes only
   - Should NOT access any admin routes

## Security Features

1. **Separate Endpoints**: Different login endpoints for students/staff vs super admins
2. **Role-Based Access Control**: Routes protected based on user role
3. **Token Management**: Access tokens stored securely in HTTP-only cookies
4. **Automatic Logout**: 401 responses trigger automatic logout
5. **Session Persistence**: Login state persists across page refreshes
6. **Cross-Tab Sync**: Logout in one tab logs out all tabs

## Permissions System

The admin permissions object controls access to different features:

```typescript
permissions: {
  staff: { edit, view, create, delete },
  admins: { edit, view, create, delete },
  system: { logs, settings, analytics },
  content: { exams, units, modules, quizzes },
  courses: { edit, view, create, delete },
  students: { edit, view, create, delete }
}
```

These permissions are stored with the user data and can be used to:
- Show/hide UI elements
- Enable/disable actions
- Control API access
- Customize admin experience

## Next Steps

### To Implement Permission-Based UI
```typescript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user } = useAuth();
  const canCreateStudents = user?.permissions?.students?.create;

  return (
    <div>
      {canCreateStudents && (
        <Button onClick={handleCreateStudent}>Create Student</Button>
      )}
    </div>
  );
}
```

### To Add More Admin Types
1. Update the User role type in `AuthContext.tsx`
2. Add role checking logic
3. Create appropriate routes
4. Update redirect logic in `App.tsx`

## Troubleshooting

### Issue: Admin can't access super-admin routes
**Solution**: Check that the user role is "super_admin" or "admin" in the response

### Issue: Token not persisting
**Solution**: Verify cookies are being set correctly and not blocked by browser

### Issue: Redirect loop
**Solution**: Check role-based redirect logic in App.tsx

### Issue: 401 Unauthorized
**Solution**: Verify token is being sent in Authorization header

---

**Last Updated**: November 13, 2024  
**Version**: 1.0.0  
**Status**: ✅ Fully Implemented and Ready for Testing

