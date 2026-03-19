# Frontend Structure Guidelines

> **Stack**: React Native · Expo SDK 54 · Expo Router v6 · TypeScript (strict)

---

## Directory Layout

```
frontend/
├── app/                     # File-based routing (Expo Router)
│   ├── (tabs)/              # Tab navigator group
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   └── index.tsx        # Home tab screen
│   ├── (auth)/              # Auth flow group (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (onboarding)/        # Onboarding flow group
│   │   ├── _layout.tsx
│   │   └── [step].tsx       # Dynamic onboarding steps
│   ├── _layout.tsx          # Root layout (providers, fonts, splash)
│   └── modal.tsx            # Global modal screen
│
├── components/              # UI components
│   ├── ui/                  # Primitive/atomic components (Button, Input, Card, etc.)
│   ├── common/              # Shared components used across multiple features (Header, Footer, CustomList)
│   └── <feature>/           # Feature-scoped composed components
│       └── <ComponentName>.tsx
│
├── features/                # Feature modules (business logic + slices + RTK Query)
│   └── <feature>/
│       ├── hooks/           # Feature-specific hooks
│       ├── redux/           # Slice definitions & feature-specific API endpoints
│       ├── types.ts         # Feature-specific TypeScript types
│       └── utils.ts         # Feature-specific helpers
│
├── services/                # Global/shared API layer (RTK Query Base)
│   └── api.ts               # Base API definition (fetchBaseQuery, tags, etc.)
│
├── store/                   # Redux Store configuration
│   ├── index.ts             # Store setup and root reducer
│   └── hooks.ts             # Typed version of useDispatch and useSelector
│
├── hooks/                   # Shared/global hooks
│   └── use-<name>.ts
│
├── constants/               # App-wide constants & theme tokens
│   ├── theme.ts             # Colors, spacing, typography, border-radius
│   └── config.ts            # API URLs, feature flags, env vars
│
├── types/                   # Global TypeScript types & interfaces
│   └── <domain>.types.ts
│
├── utils/                   # Global utility functions
│   └── <util-name>.ts
│
├── assets/                  # Static assets (images, fonts, animations)
│   ├── images/
│   ├── fonts/
│   └── animations/          # Lottie files, etc.
│
└── scripts/                 # Dev/build helper scripts
```

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Files** | `kebab-case` | `workout-card.tsx`, `use-auth.ts` |
| **Components** | `PascalCase` export | `export function WorkoutCard()` |
| **Hooks** | `use` prefix, camelCase | `useWorkout`, `useAuth` |
| **Types/Interfaces** | `PascalCase` | `Workout`, `UserProfile` |
| **Constants** | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_SETS` |
| **Store** | `kebab-case` file | `auth-slice.ts`, `api.ts` |

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

### 4. ui/ vs feature components
| `components/ui/` | `components/<feature>/` |
|---|---|
| Generic, reusable primitives | Composed from `ui/` primitives |
| No business logic | May contain feature-aware logic |
| e.g., `Button`, `Input`, `Card` | e.g., `WorkoutCard`, `ExerciseList` |

---

## Routing (Expo Router)

- Each **route group** uses parenthesized folders: `(tabs)`, `(auth)`, `(onboarding)`.
- **Layouts** (`_layout.tsx`) define navigation structure (Stack, Tabs, Drawer).
- **Dynamic segments** use bracket syntax: `[id].tsx`, `[step].tsx`.
- **Modals** are defined as screens with `presentation: 'modal'` in the layout config.
- Keep screen files **thin**: delegate logic to `features/<feature>/hooks/`.

---

## State Management Strategy

| Scope | Tool | Location |
|---|---|---|
| **Server state** (API data) | RTK Query | `features/<feature>/redux/` |
| **Global client state** | Redux Toolkit (Slices) | `features/<feature>/redux/` or `store/` |
| **Local component state** | `useState` / `useReducer` | In-component |
| **Form state** | React Hook Form | In-component or feature hook |

---

## API Layer (RTK Query)

1. **Base API** in `services/api.ts` — uses `createApi` with `fetchBaseQuery`.
2. **Feature Endpoints** injected via code-splitting in `features/<feature>/redux/`.
3. **Automatically generated hooks** (e.g., `useGetWorkoutsQuery`) used in components.

```
User taps screen
  → component calls useGetWorkoutsQuery()
    → RTK Query checks cache
      → fetches via baseQuery if needed
        → updates global store state
```

---

## Styling Approach

- Use **StyleSheet.create** for all styles (no inline style objects in JSX).
- Theme tokens live in `constants/theme.ts` — import from there, never hardcode colors/spacing.
- Prefer **Reanimated** for animations, **Gesture Handler** for touch interactions.

---

## Import Aliases

Use the configured `@/` path alias for clean imports:
```tsx
// ✅ Good
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';

// ❌ Bad — relative path spaghetti
import { Button } from '../../../components/ui/button';
```

---

## General Rules

1. **No `any`** — use `unknown` if the type is truly unknown, then narrow.
2. **No default exports** — use named exports for better refactoring & tree-shaking.
3. **Co-locate tests** — `__tests__/` folder next to the code it tests, or `<file>.test.tsx`.
4. **Keep `app/` screens thin** — screens are glue code; business logic lives in `features/`.
5. **One component per file** — exception: small private sub-components used only by the parent.
6. **Barrel exports** — each folder may have an `index.ts` re-exporting public API.
