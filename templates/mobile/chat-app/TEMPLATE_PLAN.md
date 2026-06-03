# Mobile Chat App Template Plan

Use this planned template for local-first conversation prototypes.

## Product Shape

A static/local chat interface with inbox, conversation detail, compose state, unread indicators, and realistic sample messages.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `inbox`: conversation list, unread states, search/filter affordance.
- `conversation`: message thread, composer, timestamp/read status.

## Interaction Checklist

- Select a conversation.
- Compose a local message.
- Mark read/unread in local state.
- Show empty inbox and empty conversation states.

## Validation Hints

- Do not add realtime backend, accounts, push notifications, or external messaging APIs unless requested.
- Run `buildable review` after implementation.
