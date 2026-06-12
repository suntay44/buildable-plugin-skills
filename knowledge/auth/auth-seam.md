# Auth Seam

The auth seam keeps session logic swappable. Screens depend on a small local interface, not a hosted provider SDK.

## Interface Shape

```ts
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type AuthSession = {
  user: AuthUser | null;
  status: "signed-out" | "signing-in" | "authenticated" | "error";
  error?: string;
};

export interface AuthService {
  getSession(): Promise<AuthSession>;
  signIn(input: { email: string; password?: string }): Promise<AuthSession>;
  signOut(): Promise<AuthSession>;
}
```

## Local Adapter

- Use a `createLocalAuthService()` implementation for prototypes.
- Store session state in memory, localStorage, AsyncStorage, or the repository layer only when persistence is requested.
- Keep demo users in local sample data.

## Provider Adapter

If the user names a provider such as Clerk, Auth0, NextAuth, Supabase Auth, or Firebase Auth:

- Put provider calls in `auth-service.ts`, `auth-adapter.ts`, or equivalent.
- Keep screens and components typed against `AuthService`.
- Keep a local/mock adapter available for development and tests.
- Do not leak provider client types into UI components.

## Review Signals

`buildable review` expects provider usage to appear behind an auth seam. Direct provider calls from screens/components should be treated as drift because they make the app harder to run locally and harder to swap later.
