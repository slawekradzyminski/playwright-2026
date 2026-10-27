# BUG-0017: Registration Sign in button also submits the signup form

| Jira field / metadata | Value |
| --- | --- |
| Summary | [UI] Sign in on a completed registration form sends an unintended signup request |
| Issue Type | Bug |
| Priority | High (proposed) |
| Component/s | Registration |
| Labels | ui, functional, registration |
| Environment | `http://localhost:8081/register`; frontend 3.9.1, backend 3.9.4 |
| Browser / viewport | Chromium 156.0.8078.48, 1280 × 720 |
| Source revision | Frontend `7392a3a935b373f3160c5a3ae4162c5b2f310624`; match to deployed image unknown |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | — |

## Description

The form's “Sign in” navigation button submits the completed registration form
while navigating to `/login`. A navigation action should not initiate account
creation. This can send personal inputs and attempt to create an account when
the user intended to leave registration.

## Steps to reproduce

1. Open `/register` and fill all five fields with valid disposable data.
2. Observe browser network requests (optionally intercept signup to prevent persistence).
3. Click “Sign in” below the Create account button.

## Expected result

The login form appears without sending `POST /api/v1/users/signup`.
The control is presented as navigation, separate from “Create account”.

## Actual result

The login form appears and a signup POST is sent with the completed inputs.

## Evidence

A live-backend exploratory session recorded a signup POST during Sign in navigation
(no response recorded before navigation). A focused repeat intercepted signup,
returned a controlled 400 response to avoid creating data, and counted **one**
signup request after clicking Sign in. No Create account click occurred in that
focused reproduction. The ordinary successful registration journey separately
returned 201, redirected to login and displayed the success toast.
Actual persistence from Sign in itself was not established.

The rendered navigation control is a `button` inside the registration form with
no explicit `type`; its effective DOM type is `submit`.

## Root cause

The inspected source places a Button with an onClick navigation handler inside
the form without `type="button"`. The shared Button renders a native button and
does not supply a default type. This agrees with the observed DOM and network
behavior; the source/build revision match remains unverified.

[Registration button at inspected revision](https://github.com/slawekradzyminski/vite-react-frontend/blob/7392a3a935b373f3160c5a3ae4162c5b2f310624/src/pages/auth/registerPage.tsx#L184)

## Suggested fix

Use a navigation link or set `type="button"` on this control.

## Acceptance criteria

- Clicking or keyboard-activating Sign in navigates to the visible login form.
- Neither valid nor invalid registration inputs cause a signup request during navigation.
- Create account still submits valid inputs normally.
- A regression test verifies that Sign in never submits the form.
