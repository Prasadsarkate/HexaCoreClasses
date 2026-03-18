# Frontend Documentation - HexaCore Classes

Welcome to the **Frontend** documentation. This is the visual part of the website that users interact with. It is built using **React.js**, **TypeScript**, and **Tailwind CSS**.

## 🛠️ Tech Stack
| Technology | Purpose |
|---|---|
| React 18 | UI framework (component-based) |
| TypeScript | Type-safe JavaScript |
| Vite | Fast build tool & dev server |
| Tailwind CSS | Utility-first CSS framework |
| shadcn/ui | Pre-built accessible UI components |
| Framer Motion | Smooth animations |
| React Router v6 | Client-side routing |
| React Context API | Global state management |
| Google OAuth | Social login |

## 📁 Directory Structure (`src/`)

### 1. `components/` — Reusable UI Parts
Small, reusable pieces of code used across multiple pages.
- **`ui/`**: Base elements (Button, Input, Card, Dialog) — powered by shadcn/ui.
- **`VideoCard.tsx`**: Displays a video thumbnail, title, and duration.
- **`PDFCard.tsx`**: Displays PDF notes with download option.
- **`DoubtCard.tsx`**: Shows a student's question, answers, and status.
- **`ProfilePhotoUpload.tsx`**: Avatar upload/view/delete with Google Drive storage.
- **`BottomNav.tsx`**: Mobile bottom navigation bar.

### 2. `pages/` — Full Screen Views
These correspond to the routes (URLs) in your application.
- **`Home.tsx`**: Landing page with featured content and continue watching.
- **`Login.tsx`**: Multi-step auth form (Login / Register / OTP / Reset Password).
- **`Library.tsx`**: Browse all subjects, playlists, videos, and PDFs.
- **`VideoPlayer.tsx`**: Video playback page with progress tracking.
- **`Profile.tsx`**: User settings, social links, activity stats, and avatar management.
- **`Admin.tsx`**: Admin dashboard with tabs for Videos, PDFs, Users, Doubts, Settings.
- **`Search.tsx`**: Global search across videos, playlists, and PDFs.

### 3. `services/api.ts` — Backend Connection (🔒 Secured)
- Contains all functions to fetch data from the PHP backend.
- Defines `API_BASE_URL` — auto-switches between dev (localhost) and production.
- **Auto-attaches JWT token**: Every request includes `Authorization: Bearer <token>` header.
- **Auto-handles 401**: If token expires, automatically clears localStorage and redirects to login.
- Example: `getVideos()` → `GET /api/videos.php` with auth header.

```typescript
// How it works internally:
async function fetchAPI(endpoint, options) {
  const token = localStorage.getItem('auth_token');
  headers['Authorization'] = `Bearer ${token}`;  // ← Auto-attached
  
  const res = await fetch(API_BASE_URL + endpoint, { headers });
  
  if (res.status === 401) {
    // Token expired → redirect to login
    localStorage.clear();
    window.location.href = '/auth';
  }
  
  return res.json();
}
```

### 4. `contexts/AuthContext.tsx` — Auth State Management (🔒 Secured)
- Manages the global state of the logged-in user.
- Persists token + user data in `localStorage` across page refreshes.
- Provides methods: `signIn`, `signUp`, `signOut`, `signInWithGoogle`, `verifyEmailOTP`, `requestPasswordReset`.
- **Security**: No sensitive data (OTP, tokens) logged to console in production.
- Sends auth headers when refreshing profile data.

### 5. `App.tsx` & `main.tsx`
- **`main.tsx`**: Entry point — mounts React to the HTML file.
- **`App.tsx`**: Sets up layout, providers (AuthProvider, GoogleOAuthProvider).
- **`routes.tsx`**: URL → Page mapping (e.g., `/login` → `Login.tsx`, `/admin` → `Admin.tsx`).

## 🔒 Frontend Security Features

| Feature | Implementation |
|---|---|
| **Auth Token Management** | Stored in `localStorage`, auto-sent with every API request |
| **Auto-Logout on 401** | `fetchAPI()` clears token and redirects when server rejects |
| **No OTP in Console** | Removed all `console.log` statements that exposed OTP codes |
| **No Debug Logging** | Removed Google Login response debug logging |
| **Protected Routes** | Admin pages check `user.role === 'admin'` before rendering |
| **Input Validation** | Password strength checked on registration (8+ chars, letter+number) |

## 🔄 How It Works (Flow)

### Page Load Flow
```
1. main.tsx loads → wraps app in AuthProvider
2. AuthProvider checks localStorage for existing token
3. If token exists → set user state → show authenticated UI
4. If no token → show login page
```

### API Request Flow
```
1. User clicks "View Videos"
2. Library.tsx calls api.ts → getVideos()
3. fetchAPI() auto-attaches Bearer token from localStorage
4. Request: GET /api/videos.php + Authorization header
5. Backend validates token, runs query, returns JSON
6. React updates state via useState → UI re-renders
```

### Authentication Flow
```
1. User fills login form → signIn(email, password)
2. AuthContext sends POST to /api/auth/login.php
3. Backend verifies password → returns JWT token + user data
4. AuthContext saves token to localStorage + state
5. User is now authenticated → all future requests include token
```

## ❓ Key Concepts for Viva/Exams

| Concept | Explanation |
|---|---|
| **Component** | A reusable building block of React (e.g., Button, VideoCard) |
| **Props** | Data passed from parent component to child component |
| **State (`useState`)** | Data that changes over time (e.g., list of videos, user input) |
| **Effect (`useEffect`)** | Side-effect logic that runs on mount/update (e.g., "Load videos when page opens") |
| **Context API** | Shares global state (like user auth) across all components without prop drilling |
| **TypeScript** | Adds type safety to JavaScript — catches errors at compile time |
| **JWT Token** | A signed token stored in localStorage, sent with every request to prove identity |
| **Bearer Auth** | HTTP standard for token-based auth: `Authorization: Bearer <token>` |
| **SPA (Single Page App)** | React loads once, then dynamically updates content without full page reloads |
| **Vite** | Modern build tool — faster than Webpack, supports hot module replacement (HMR) |
| **Tailwind CSS** | Utility-first CSS framework — classes like `bg-blue-500 p-4 rounded-lg` |
| **shadcn/ui** | Pre-built accessible React components that you copy into your project |
| **React Router** | Client-side routing — URL changes update the component, not the whole page |
| **OAuth 2.0** | Google Sign-In protocol — user authenticates with Google, app gets access token |
