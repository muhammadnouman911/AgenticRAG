# Security Specification - AgenticRAG

## Data Invariants
1. A user profile (`users/{userId}`) can only be created by the authenticated user with that UID.
2. User roles ('admin', 'user') are immutable by the user themselves.
3. Public profile info is readable by authenticated users (if needed), but PII is restricted.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: Attempt to update `role: 'admin'` in own user profile.
3. **Malicious ID**: Attempt to create a document with a 1KB string ID.
4. **PII Leak**: Attempt to read another user's email.
5. **Shadow Fields**: Attempt to add `is_verified: true` to a user document.
... (others covered by strict key check)

## Firebase Blueprint
```json
{
  "entities": {
    "User": {
      "title": "User Profile",
      "type": "object",
      "properties": {
        "email": { "type": "string" },
        "displayName": { "type": "string" },
        "photoURL": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "role": { "type": "string", "enum": ["user", "admin"] }
      },
      "required": ["email", "createdAt", "role"]
    }
  },
  "firestore": {
    "users/{userId}": {
      "schema": "User",
      "description": "User account information"
    }
  }
}
```
