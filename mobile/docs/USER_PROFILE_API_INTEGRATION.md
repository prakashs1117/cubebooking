# User Profile API Integration

## Overview

Integrated the `/me/profile` API endpoint to fetch and display comprehensive user profile data in the Settings Screen Account tab.

## What Was Implemented

### 1. **User Profile Types** (`src/types/user.types.ts`)

- Created TypeScript interfaces for the API response
- Defines `UserProfile` and `UserProfileResponse` types
- Includes all fields from the API:
  - Basic info: id, email, username, firstName, lastName
  - Professional: company, department, designation, specialization, experienceYears
  - Account: role, image, emailVerifiedAt, createdAt, updatedAt

### 2. **User Profile API Service** (`src/services/api/user.service.ts`)

- Created `userService.getProfile()` method
- Makes authenticated GET request to `/me/profile`
- Uses axios client with automatic Bearer token injection
- Includes error handling and logging

### 3. **Settings Screen Integration** (`src/screens/SettingsScreenTabbed.tsx`)

- Added TanStack Query to fetch profile data
- Displays profile data in organized sections:
  - **Profile Information**: First Name, Last Name, Username, Email
  - **Professional Details**: Company, Department, Designation, Specialization, Experience
  - **Account Details**: Email Verification Status, Member Since, User ID
- Shows loading state while fetching
- Shows error state with retry button if fetch fails
- Only shows available fields (hides empty/null fields)

## API Details

### Endpoint

```
GET /me/profile
```

### Authentication

Requires Bearer token (automatically added by axios interceptor)

### Response Format

```typescript
{
  "user": {
    "id": "string",
    "email": "user@example.com",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "USER" | "ADMIN" | "MODERATOR",
    "image": "string",
    "company": "string",
    "department": "string",
    "designation": "string",
    "specialization": "string",
    "experienceYears": number,
    "emailVerifiedAt": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## UI Implementation

### Profile Information Section

- Shows user's full name (firstName + lastName) or username as fallback
- Displays email address
- Shows role badge (Admin/Moderator/User) with appropriate icon

### Professional Details Section (Conditional)

Only shown if user has any professional information:

- Company name
- Department
- Job designation
- Specialization
- Years of experience (formatted as "X years" or "X year")

### Account Details Section

- Email verification status with green checkmark icon
- Member since date (formatted as "Month DD, YYYY")
- User ID (shown in monospace font)

### States

#### Loading State

```
┌─────────────────┐
│   🔄 Spinner    │
│ Loading profile │
└─────────────────┘
```

#### Error State

```
┌─────────────────┐
│   ⚠️ Icon       │
│ Failed to load  │
│   [Retry Btn]   │
└─────────────────┘
```

#### Success State

Shows all available profile data in organized cards

## Features

### Smart Data Display

- Only shows fields that have values
- Hides entire sections if no data available
- Gracefully handles missing data

### Professional Formatting

- Date formatting: "January 1, 2024"
- Experience: "5 years" or "1 year" (singular handling)
- Email verification: Green checkmark with "Verified" text
- User ID: Monospace font for technical data

### Loading & Error Handling

- Loading spinner during fetch
- Error state with retry functionality
- Caching: Data cached for 5 minutes
- Auto-retry: 2 retry attempts on failure

### Authentication Integration

- Only fetches when user is logged in (`enabled: !!user`)
- Uses automatic Bearer token authentication
- Respects token refresh flow

## Query Configuration

```typescript
useQuery({
  queryKey: ['userProfile'],
  queryFn: userService.getProfile,
  enabled: !!user,
  staleTime: 1000 * 60 * 5, // 5 minutes
  retry: 2,
});
```

## Visual Design

### Layout Structure

```
┌─────────────────────────────────┐
│       Avatar (User Icon)         │
│      Full Name / Username        │
│           Email                  │
│        [Role Badge]              │
├─────────────────────────────────┤
│   👤 Profile Information         │
│   ┌─────────────────────────┐   │
│   │ First Name   : John     │   │
│   │ Last Name    : Doe      │   │
│   │ Username     : @johndoe │   │
│   │ Email        : john@... │   │
│   └─────────────────────────┘   │
├─────────────────────────────────┤
│   📦 Professional Details        │
│   ┌─────────────────────────┐   │
│   │ Company      : Merck    │   │
│   │ Department   : IT       │   │
│   │ Designation  : Dev      │   │
│   │ Specialization: React  │   │
│   │ Experience   : 5 years  │   │
│   └─────────────────────────┘   │
├─────────────────────────────────┤
│   ℹ️ Account Details             │
│   ┌─────────────────────────┐   │
│   │ Email Verified: ✅ Yes  │   │
│   │ Member Since: Jan 2024  │   │
│   │ User ID: abc123...      │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Styling

- Card-based layout with rounded corners
- Border separators between fields
- Consistent padding and spacing
- Theme-aware colors (light/dark mode)
- Icons for section headers

## Console Logs

The implementation includes helpful console logs:

```
✅ User profile fetched: { user: {...} }
❌ Error fetching user profile: Error(...)
```

## Benefits

1. **Real-time Data**: Always shows up-to-date profile information from server
2. **Professional Display**: Clean, organized presentation of user data
3. **Smart UX**: Loading states, error handling, retry functionality
4. **Type Safety**: Full TypeScript support for all profile fields
5. **Efficient**: Query caching reduces unnecessary API calls
6. **Flexible**: Adapts to show only available data fields

## Future Enhancements

Possible improvements:

- Profile image display (when image URL is provided)
- Edit profile functionality
- Pull-to-refresh for manual data sync
- Profile completeness indicator
- Last updated timestamp

## Files Modified/Created

### Created:

- ✅ `src/types/user.types.ts` - TypeScript types
- ✅ `src/services/api/user.service.ts` - API service
- ✅ `USER_PROFILE_API_INTEGRATION.md` - This documentation

### Modified:

- ✅ `src/screens/SettingsScreenTabbed.tsx` - Account tab UI

## Testing

To test the integration:

1. **Login Required**: User must be authenticated
2. **Navigate**: Go to Settings → Account tab
3. **Observe**: Loading spinner appears briefly
4. **Result**: Profile data displays in organized sections
5. **Error Test**: Disconnect internet and tap retry to see error state

The integration is complete and ready for use! 🎉
