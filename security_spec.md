# Security Specification: REXLIFY Firestore Access Controls

This document details the Zero-Trust Security Specification for REXLIFY, containing our core Data Invariants, the "Dirty Dozen" hostile payloads designed to compromise the database, and the complete Jest/Firebase Rules test runner.

---

## 1. Data Invariants

1. **User Identity Isolation**: A user profile document (`/users/{userId}`) can only be retrieved, created, or updated by the authenticated user whose `request.auth.uid` matches the document `{userId}`.
2. **Strict User Schema Validation**: All user profiles must adhere to strict key limits and type safety. They cannot contain "ghost fields" (e.g., `isAdmin`, `isVerified`).
3. **Immutability of Key Identity Attributes**: The user's `email` or profile primary keys cannot be modified once set.
4. **Unauthenticated Submissions (Contact Messages)**: Unauthenticated clients can create messages under `/messages/{messageId}`, but they cannot read, list, update, or delete any messages.
5. **Contact Message Schema Integrity**: Every sent message must have valid, constrained fields: `senderName`, `senderEmail`, `subject`, `category`, `message`, and `date`. The maximum message size must be capped to prevent Denial of Wallet storage abuse.
6. **Newsletter Subscribers**: Any user can subscribe to the newsletter under `/subscribers/{subscriberId}`. The subscriber document can only contain an `email` field with max length 150. Reading or modifying subscribers is strictly forbidden for all standard client connections.
7. **Strict Field Validation**: All timestamp-like fields or custom values must be sanitised and restricted to predefined limits. No recursive list additions are permitted.

---

## 2. The "Dirty Dozen" Payloads

These 12 hostile payloads are designed to challenge Identity, Integrity, and State:

### Category A: User Profile Exploits
1. **Hostile Profile Creation (Identity Spoofing)**: Attempting to write a profile under `/users/attacker_uid` using another user's email or setting fields on behalf of `legit_user_uid`.
2. **Ghost Field Injection (Privilege Escalation)**: Attempting to insert `role: 'admin'` or `isAdmin: true` inside `/users/{userId}` to gain unrequested administrator permissions.
3. **Immortal Attribute Modification**: Attempting to rewrite the immutable `email` or initial fields inside `/users/{userId}` after registration.
4. **Denial of Wallet (Volumetric Payload)**: Writing a bio of 1MB containing junk bytes to exhaust memory quotas.
5. **Character ID Poisoning**: Registering a user with a document ID containing invalid characters or massive strings (`/users/user_!!!!_$$$$`).
6. **Unauthenticated profile hijack**: Attempting to write a profile without active authentication headers.

### Category B: Message & Communication Exploits
7. **Contact Inbox Read (Query Scraping)**: Attempting to read or list `/messages` to scrape sensitive contact form emails or suggestions.
8. **Malicious Message Modification**: Attempting to update or delete a sent message `/messages/{messageId}` to overwrite context.
9. **Volumetric Message Attack**: Writing a message payload where `message` is 100KB of spam or `subject` is excessively large.
10. **Identity Spoofing in Messages**: Creating a message where `senderEmail` is spoofed but not conforming to format.

### Category C: Subscriber Exploits
11. **Subscriber Database List Leak**: Attempting to read `/subscribers` to steal registered customer email listings.
12. **Malicious Subscriber Poisoning**: Attempting to update or insert ghost fields (`isSubscribed: false` or arbitrary lists) into a subscriber document.

---

## 3. The Test Runner (`firestore.rules.test.ts`)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0264934784',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('REXLIFY Firestore Security Rules', () => {
  // Test Case 1: User Profile Isolation
  test('User can read/write their own profile but not others', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDb = testEnv.authenticatedContext('bob').firestore();

    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'alice'), {
        username: 'Alice',
        email: 'alice@rexlify.com',
        bio: 'Secure Dev',
        avatar: '🚀',
        favorites: [],
        watchLater: []
      })
    );

    await assertFails(
      setDoc(doc(bobDb, 'users', 'alice'), {
        username: 'Bob Spoofing Alice',
        email: 'alice@rexlify.com',
      })
    );
  });

  // Test Case 2: Privilege Escalation Prevention
  test('Prevent injection of ghost fields like isAdmin or role', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'alice'), {
        username: 'Alice',
        email: 'alice@rexlify.com',
        isAdmin: true,
      })
    );
  });

  // Test Case 3: Public cannot read subscriber emails
  test('Public and standard users cannot read subscribers', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      getDocs(collection(unauthDb, 'subscribers'))
    );
  });
});
```
