# Auth Screens

## Use When

The user explicitly requested login/accounts (or `--with-auth`). Auth is opt-in: never add these screens unprompted. Pair with `knowledge/auth/auth-shape.md` and the auth seam.

## Expected Components

- sign-in: email + password fields with visible labels, submit button with loading state, error summary
- sign-up: minimum viable fields only; password requirements stated up front, not revealed on failure
- a demo-user shortcut in local/mock mode ("Continue as demo user") so the prototype works with zero setup
- protected-route shell: redirect-to-sign-in plus a signed-in header state (name + sign out)

## Behavior

- validation is inline and specific ("Password needs 8+ characters"), announced to screen readers
- submit handles idle / submitting / error / success — no dead button after click
- auth state lives behind the seam; screens call the auth interface, never a provider SDK
- mock mode seeds 1-2 demo users; a named provider replaces the adapter, not the screens

## Avoid

- social-login buttons for providers the user never named
- password confirmation fields in a prototype
- locking the entire prototype behind sign-in when only some routes need it
- storing credentials in source or localStorage as plaintext "real" auth claims
