# Admin Panel Integration Guide

This Vite app now includes the onboarding and admin pages from the admin-panel project, fully configured with TypeScript and Vite.

## What's Been Integrated

### Pages
- **Onboarding Page** (`/onboarding`) - Guest onboarding form with multi-step questions
- **Admin Dashboard** (`/admin`) - View and manage onboarding submissions (auth-protected)

### Components
All components have been converted to TypeScript:
- `OnboardingPage.tsx` - Main onboarding flow with hero, questionnaire, and contact form
- `AdminDashboard.tsx` - Admin view with submission management, search, and filtering
- Supporting UI components (JIcon, JPress, JDashes, JInput, Badge, SubmissionRow)

### Styling
- `OnboardingPage.css` - Onboarding-specific styles and animations
- Built with Tailwind-compatible inline styles and CSS variables
- Responsive design for mobile and desktop

### Configuration
- `firebase.ts` - Firebase initialization with environment variables
- `types/index.ts` - TypeScript types and interfaces
- `utils/constants.ts` - Reusable constants and data
- `hooks/useAuth.ts` - Authentication hook
- `.env.example` - Environment variable template

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

The following packages have been added:
- `react-router-dom` - Page routing
- `firebase` - Backend and authentication
- `lucide-react` - Icon library

### 2. Configure Firebase
Copy `.env.example` to `.env.local` and add your Firebase credentials:

```bash
cp .env.example .env.local
```

Then update the values in `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Create Firestore Collections
In your Firebase project, create these collections:
- `toastmaster-onboarding` - Stores onboarding form submissions

### 4. Set Up Authentication
In Firebase Console:
1. Enable Authentication (Email/Password or Google)
2. Create test admin user for accessing `/admin` route
3. Admin access is based on authentication state

### 5. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

- `/onboarding` - Public onboarding form
- `/admin` - Protected admin dashboard (requires login)
- `/` - Redirects to onboarding

## Project Structure

```
src/
├── components/
│   ├── OnboardingPage.tsx      # Onboarding form component
│   ├── OnboardingPage.css      # Onboarding styles
│   └── AdminDashboard.tsx      # Admin dashboard component
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── types/
│   └── index.ts                # TypeScript types
├── utils/
│   └── constants.ts            # Constants and data
├── firebase.ts                 # Firebase configuration
├── App.tsx                     # Main app with routing
└── main.tsx                    # Entry point
```

## Key Features

### Onboarding Page
- **Hero Section** - Introduction with meeting details
- **Multi-Step Form** - 5 questions with single/multi-select options
- **Contact Form** - Name, phone, email, city, notes
- **Thank You Page** - Confirmation with social media links
- **Validation** - Phone number (10 digits), email format checking
- **Firebase Integration** - Auto-saves submissions to Firestore

### Admin Dashboard
- **Submission List** - Real-time updates from Firestore
- **Expandable Details** - View full submission info with answers
- **Search & Filter** - Search by name, email, or city
- **Sidebar Navigation** - Collapsible admin menu
- **User Info** - Display current admin user email
- **Logout** - Sign out functionality

## Building for Production

```bash
npm run build
```

This generates optimized production files in `dist/`.

## TypeScript Configuration

- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - App-specific configuration
- `tsconfig.node.json` - Build tool configuration

All components are fully typed with TypeScript for better development experience and type safety.

## Environment Variables

Required environment variables in `.env.local`:
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Customization

### Modify Onboarding Questions
Edit `src/utils/constants.ts` - `J_Q` array

### Change Styling
- Onboarding: Edit `src/components/OnboardingPage.css`
- Admin: Modify inline styles in `src/components/AdminDashboard.tsx`
- CSS Variables: Update `:root` in OnboardingPage.css

### Update Firestore Collection
Change collection name in:
- `src/components/OnboardingPage.tsx` (addDoc)
- `src/components/AdminDashboard.tsx` (query)

## Troubleshooting

### Firebase Connection Issues
- Verify environment variables in `.env.local`
- Check Firebase project console for API key restrictions
- Ensure Firestore is enabled in Firebase project

### Authentication Not Working
- Check Firebase authentication methods are enabled
- Verify user is created in Firebase Console
- Check browser console for auth errors

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Check that OnboardingPage.css is imported
- Verify CSS variables are defined in :root

## Support

For issues or questions:
1. Check the original admin-panel project structure
2. Review Firebase documentation
3. Check Vite documentation for build issues
