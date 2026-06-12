# Auth Shape

Buildable treats auth as a **shape** before it treats auth as a provider. When the user asks for login, accounts, protected routes, or sessions, model the product flow without forcing hosted auth.

## Default Local Shape

- `User`: id, name, email, role, avatarInitials, createdAt.
- `Session`: userId, status, lastActiveAt, expiresAt.
- `AuthState`: signed-out, signing-in, authenticated, error, signed-out-after-timeout.
- `AuthActions`: signIn, signOut, switchDemoUser, recoverSession.

## Screens And States

- Signed-out screen: explain the local/demo nature of the account flow.
- Sign-in form: email field, password/demo code field, validation, submitting, error, success.
- Authenticated shell: show current user, role, and sign-out action.
- Protected surface: redirect or empty-state copy when signed out.
- Timeout state: explain that the session expired and allow sign-in again.

## Local-First Rules

- Default to a local/mock session store so the app runs without accounts, secrets, or network setup.
- Seed one or more demo users from local sample data.
- Do not add OAuth, email delivery, magic links, password reset email, captcha, or a hosted provider unless the user names one.
- Keep auth copy honest: "demo account" or "local prototype" when no real provider exists.

## Acceptance Criteria

- The app can show signed-out and signed-in states locally.
- Forms have labels, validation, submitting, success, and error states.
- Protected UI has a clear signed-out fallback.
- Auth state is isolated behind the auth seam in `knowledge/auth/auth-seam.md`.
