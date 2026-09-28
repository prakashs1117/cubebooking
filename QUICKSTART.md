# Quick Start Guide

Get the admin panel pages up and running in 5 minutes.

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Firebase
Copy environment template and add your Firebase credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase project credentials:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Create Firestore Collection
In Firebase Console:
1. Go to Firestore Database
2. Create collection: `toastmaster-onboarding`
3. Enable authentication method (Email/Password recommended)

## 4. Run Development Server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser

## 5. Test Routes

### Onboarding (Public)
```
http://localhost:5173/onboarding
```
- Fill out the form
- Submit (requires Firebase connection)

### Admin Dashboard (Protected)
```
http://localhost:5173/admin
```
- Sign in with Firebase credentials
- View all submissions
- Search and filter responses

## Project Structure

```
src/
├── components/
│   ├── OnboardingPage.tsx      ← Onboarding form
│   ├── OnboardingPage.css      ← Onboarding styles
│   └── AdminDashboard.tsx      ← Admin view
├── hooks/
│   └── useAuth.ts              ← Auth management
├── types/
│   └── index.ts                ← TypeScript types
├── utils/
│   └── constants.ts            ← App constants
├── firebase.ts                 ← Firebase config
├── App.tsx                     ← Main app + routing
└── main.tsx                    ← Entry point
```

## Build for Production
```bash
npm run build
```

Output will be in `dist/` directory.

## Troubleshooting

**Can't submit form?**
- Check Firebase credentials in `.env.local`
- Ensure Firestore database is created
- Check browser console for errors

**Can't access admin?**
- Make sure you're signed in via Firebase Auth
- Check that user is created in Firebase Console
- Try signing out and back in

**Styles not loading?**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server

## Next Steps

See `INTEGRATION_GUIDE.md` for:
- Detailed setup instructions
- How to customize questions
- How to modify styling
- Advanced configuration

## Key Files Changed/Added

### New Files:
- `src/components/OnboardingPage.tsx` (TypeScript)
- `src/components/OnboardingPage.css`
- `src/components/AdminDashboard.tsx` (TypeScript)
- `src/firebase.ts`
- `src/types/index.ts`
- `src/utils/constants.ts`
- `src/hooks/useAuth.ts`
- `.env.example`

### Modified Files:
- `package.json` (added dependencies)
- `src/App.tsx` (added routing)
