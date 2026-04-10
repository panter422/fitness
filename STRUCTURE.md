# Frontend Structure Guidelines

> **Stack**: React Native · Expo SDK 54 · Expo Router v6 · TypeScript (strict)  
> **State**: Redux Toolkit + RTK Query · Redux Persist  
> **Styling**: NativeWind (Tailwind CSS) · Reanimated

---

## Directory Layout

```
frontend/
├── app/                        # File-based routing (Expo Router)
│   ├── (tabs)/                 # Tab navigator group
│   │   ├── _layout.tsx         # Tab bar config
│   │   ├── index.tsx           # Home tab   → re-exports src/screens/dashboard
│   │   ├── record.tsx          # Record tab → re-exports src/screens/record
│   │   └── explore.tsx         # Feed tab   → re-exports src/screens/feed
│   ├── (auth)/                 # Auth flow group (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (onboarding)/           # Onboarding flow group
│   │   ├── _layout.tsx
│   │   └── [step].tsx          # Dynamic onboarding steps
│   ├── activity/
│   │   └── [id].tsx            # Activity summary modal
│   ├── _layout.tsx             # Root layout (providers, fonts, splash)
│   ├── profile.tsx             # Profile screen → re-exports src/screens/profile
│   └── modal.tsx               # Global modal screen
│
├── src/
│   ├── features/               # ⭐ Feature modules (business logic + state + hooks)
│   │   └── <feature>/
│   │       ├── hooks/          # Feature-specific hooks
│   │       ├── redux/          # Slice + injected RTK Query endpoints
│   │       ├── utils/          # Feature-specific helpers
│   │       ├── types.ts        # Feature-specific TypeScript types
│   │       └── index.ts        # Barrel export — public API for the feature
│   │
│   ├── screens/                # Screen components (UI layer)
│   │   └── <screen>/
│   │       ├── index.tsx       # Screen root component
│   │       └── components/     # Screen-scoped sub-components
│   │
│   ├── components/             # Shared cross-feature UI components
│   │   ├── ui/                 # Primitive/atomic components
│   │   │   └── haptic-tab.tsx  # Tab bar haptic feedback wrapper
│   │   └── maps/               # Map components (platform-split)
│   │       ├── maplibre-map.tsx
│   │       └── maplibre-map.web.tsx
│   │
│   ├── services/               # Global/shared API layer
│   │   └── api.ts              # RTK Query base API (fetchBaseQuery, tags)
│   │
│   ├── store/                  # Redux Store configuration
│   │   ├── index.ts            # Store setup, root reducer, typed exports
│   │   └── hooks.ts            # Typed useAppDispatch, useAppSelector, useAppStore
│   │
│   ├── hooks/                  # Shared/global hooks (theme, platform, etc.)
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   │
│   ├── theme/                  # Design tokens — single source of truth
│   │   └── index.ts            # Colors, fonts, spacing
│   │
│   ├── constants/              # App-wide constants & config
│   │   └── config.ts           # API URLs, feature flags, env vars
│   │
│   ├── types/                  # Global TypeScript types & interfaces
│   │   └── <domain>.types.ts
│   │
│   ├── utils/                  # Global utility functions
│   │   └── <util-name>.ts
│   │
│   └── assets/                 # Static assets (images, fonts, animations)
│       ├── images/
│       ├── fonts/
│       └── animations/         # Lottie files, etc.
│
├── assets/                     # Expo-managed assets (app icon, splash, etc.)
├── scripts/                    # Dev/build helper scripts
└── global.css                  # NativeWind global styles
```

---

## Architecture Principles

### 1. Thin Route Files

Route files in `app/` are **glue code only** — they re-export a screen component:

```tsx
// app/(tabs)/index.tsx
import DashboardScreen from '@/src/screens/dashboard/index';
export default DashboardScreen;
```

**Never** place business logic, API calls, or complex UI directly in `app/` files.

### 2. Feature Modules

Each feature is a self-contained module under `src/features/<feature>/`:

```
src/features/activity/
├── hooks/
│   ├── use-activity-tracker.ts
│   ├── use-activity-by-id.ts
│   ├── use-merged-activities.ts
│   └── use-sync-activities-with-server.ts
├── redux/
│   ├── activity-slice.ts       # Redux Toolkit slice
│   └── activity-api.ts         # RTK Query injected endpoints
├── utils/
│   ├── activity-merge.ts
│   └── map-matching.ts
├── types.ts                    # Shared Activity types
└── index.ts                    # Barrel export
```

**Rules**:
- Internal imports use **relative paths** (`../types`, `./use-merged-activities`).
- External consumers import **only through the barrel** (`@/src/features/activity`).
- Feature modules may import from `@/src/services/api` and `@/src/store` but **never** from other features (to avoid circular dependencies).

### 3. Screen Components

Screens in `src/screens/<screen>/` contain the **visual composition layer**:
- They import hooks and types from feature modules.
- They import shared UI from `src/components/`.
- Complex screens extract sub-components into a co-located `components/` folder.
- Screens should stay under ~150 lines; extract custom hooks when they grow.

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Files** | `kebab-case` | `activity-slice.ts`, `use-auth.ts` |
| **Components** | `PascalCase` export | `export function WorkoutCard()` |
| **Hooks** | `use` prefix, camelCase | `useActivityTracker`, `useAuth` |
| **Types/Interfaces** | `PascalCase` | `Activity`, `UserProfile` |
| **Constants** | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_SETS` |
| **Store files** | `kebab-case` | `activity-slice.ts`, `api.ts` |
| **Feature folders** | `kebab-case` | `features/activity/`, `features/auth/` |

---

## Component Guidelines

### 1. Functional Components Only
```tsx
// ✅ Good
export function WorkoutCard({ workout }: WorkoutCardProps) { ... }

// ❌ Bad — no class components
class WorkoutCard extends React.Component { ... }
```

### 2. Props Interface Co-located
Define the props interface directly above the component in the same file:
```tsx
interface WorkoutCardProps {
  workout: Workout;
  onPress?: () => void;
}

export function WorkoutCard({ workout, onPress }: WorkoutCardProps) { ... }
```

### 3. Component Size Limit
If a component exceeds ~150 lines, extract sub-components or custom hooks.

### 4. Component Placement

| `src/components/ui/` | `src/screens/<screen>/components/` |
|---|---|
| Generic, reusable primitives | Screen-specific sub-components |
| No business logic | Composed from `ui/` primitives |
| e.g., `Button`, `Input`, `Card` | e.g., `SocialShareCard` |

---

## Routing (Expo Router)

- Each **route group** uses parenthesized folders: `(tabs)`, `(auth)`, `(onboarding)`.
- **Layouts** (`_layout.tsx`) define navigation structure (Stack, Tabs, Drawer).
- **Dynamic segments** use bracket syntax: `[id].tsx`, `[step].tsx`.
- **Modals** are defined as screens with `presentation: 'modal'` in the layout config.
- Keep route files **thin**: delegate to `src/screens/` → which delegates to `src/features/`.

---

## State Management Strategy

| Scope | Tool | Location |
|---|---|---|
| **Server state** (API data) | RTK Query | `src/features/<feature>/redux/` |
| **Global client state** | Redux Toolkit (Slices) | `src/features/<feature>/redux/` |
| **Local component state** | `useState` / `useReducer` | In-component |
| **Form state** | React Hook Form | In-component or feature hook |
| **Persisted state** | Redux Persist | Configured in `src/store/index.ts` |

---

## API Layer (RTK Query)

1. **Base API** in `src/services/api.ts` — `createApi` with `fetchBaseQuery` and empty endpoints.
2. **Feature endpoints** injected via `api.injectEndpoints()` in `src/features/<feature>/redux/`.
3. **Auto-generated hooks** (e.g., `useGetActivitiesQuery`) exported through the feature barrel.

```
User taps screen
  → component calls useGetActivitiesQuery()          (from feature barrel)
    → RTK Query checks cache
      → fetches via baseQuery if needed
        → updates global store state
          → component re-renders with data
```

---

## Styling Approach

- Use **NativeWind** (Tailwind CSS classes) for styling via `className`.
- Theme tokens live in `src/theme/index.ts` — import from there, never hardcode colors/spacing.
- Prefer **Reanimated** for animations, **Gesture Handler** for touch interactions.
- For complex styles that can't be expressed as classes, use `StyleSheet.create`.

---

## Import Aliases

Use the configured `@/` path alias for clean imports:
```tsx
// ✅ Good
import { useActivityTracker } from '@/src/features/activity';
import { Button } from '@/src/components/ui/button';

// ❌ Bad — relative path spaghetti
import { useActivityTracker } from '../../../features/activity/hooks/use-activity-tracker';
```

---

## General Rules

1. **No `any`** — use `unknown` if the type is truly unknown, then narrow.
2. **No default exports for components** — use named exports for better refactoring & tree-shaking. Exception: screen root components use `export default` since Expo Router requires it.
3. **Co-locate tests** — `__tests__/` folder next to the code it tests, or `<file>.test.tsx`.
4. **Keep `app/` screens thin** — screens re-export from `src/screens/`, which delegate logic to `src/features/`.
5. **One component per file** — exception: small private sub-components used only by the parent.
6. **Barrel exports** — each feature has an `index.ts` re-exporting its public API.
7. **Feature isolation** — features may import from `services/` and `store/`, but never from each other.
8. **Platform extensions** — use `.web.ts`, `.ios.ts`, `.android.ts` suffixes for platform-specific code.
