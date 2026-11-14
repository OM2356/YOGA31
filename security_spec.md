# FlowState Wellness — Firestore Security Specification

## 1. Data Invariants
1. **Identity Ownership**: Every user-scoped document (`userProfiles`, `userProgress`, `practiceLogs`, `moodEntries`, `dailyPlans`, `aiConversations`, `challengeEnrollments`) MUST contain `userId == request.auth.uid` on creation and MUST NOT change `userId` on update.
2. **Email Verification Gate**: Standard authenticated writes require `request.auth.token.email_verified == true`.
3. **PII Isolation**: `userProfiles/{userId}` contains `email` and `displayName` and is strictly readable only by the owner (`request.auth.uid == userId`) or a verified admin. Non-owners can never `get` or `list` user profiles.
4. **Temporal & Immutable Fields**: `createdAt` must equal `request.time` on creation and remain equal to `existing().createdAt` on update. `updatedAt` must equal `request.time` on creation and update.
5. **Terminal State Locking**: Once a `challengeEnrollments` document reaches `status == 'completed'`, non-admin users cannot modify it further.
6. **Admin RBAC Protection**: Only bootstrapped verified admin (`omkarsathe3103@gmail.com` with `email_verified == true`) or members of `/admins/{uid}` may read/list admin management collections (`userProfiles` listing, `customContent` writes). Ordinary users cannot write to `/admins` or inject `role`/`isAdmin` shadow fields.
7. **Strict Schema & Bounds**: Every string field enforces `.size()` bounds; every array enforces `.size() <= MAX`; every document enforces `keys().hasAll(...)` and `keys().hasOnly(...)` on create and `affectedKeys().hasOnly(...)` on update.

## 2. "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Identity Spoof on PracticeLog Create**: Authenticated user A submits `practiceLogs/log_1` with `userId: "user_B"`.
2. **Shadow Field Injection on UserProfile Create**: User adds `"isAdmin": true` or `"role": "admin"` to `userProfiles/{uid}`.
3. **Timestamp Forgery on MoodEntry Create**: User sets `createdAt` to a past timestamp instead of `serverTimestamp()`.
4. **Owner Reassignment on DailyPlan Update**: User attempts to update `userId` on an existing `dailyPlans/{planId}`.
5. **PII Scrape on UserProfiles List**: Ordinary authenticated user runs `getDocs(collection(db, "userProfiles"))`.
6. **Blanket Read on PracticeLogs List**: User queries `practiceLogs` without `where("userId", "==", uid)`.
7. **ID Poisoning**: User writes to `practiceLogs/` with a 500-character document ID or invalid characters (`../admin`).
8. **Resource Exhaustion (1MB String)**: User submits a 20,000-char `note` in `moodEntries`.
9. **Unbounded Array**: User submits `favoritePoses` with 100 entries in `userProgress`.
10. **Terminal State Bypass**: User updates `challengeEnrollments/{id}` after `status == "completed"`.
11. **Privilege Escalation on CustomContent**: Non-admin user attempts to `create` or `delete` in `customContent`.
12. **Unverified Email Spoof**: Request token has `email == "omkarsathe3103@gmail.com"` but `email_verified == false`.
