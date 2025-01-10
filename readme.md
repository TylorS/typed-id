# @typed/id

A TypeScript library providing common ID format generation using [Effect](https://effect.website/). This package includes implementations for UUID, NanoID, ULID, CUID2, and KSUID generation with a focus on type safety and functional programming principles.

## Installation

```bash
npm install @typed/id effect
# or
pnpm add @typed/id effect
# or
yarn add @typed/id effect
```

## Features

- 🎯 Type-safe ID generation
- 🔧 Built on top of Effect
- 🎨 Multiple ID format support:
  - UUID (v4, v5, v7)
  - NanoID
  - ULID
  - CUID2
  - KSUID
- ⚡ Efficient and secure random value generation
- 📦 Zero dependencies (except Effect)

## Stackblitz

Check the console to see the outputs

> https://stackblitz.com/edit/vitejs-vite-eukvweq2?file=src%2Fmain.ts

## Usage

```typescript
import { Effect } from 'effect'
import { 
  DateTimes, 
  GetRandomValues, 
  makeUuid4, 
  makeUuid5,
  makeUuid7,
  Uuid7State,
  Uuid5Namespace,
  Sha1,
  makeNanoId, 
  makeUlid,
  makeCuid,
  CuidState,
  makeKsuid,
} from '@typed/id'

// Generate a UUID v4 (random)
await makeUuid4.pipe(
  Effect.provide(GetRandomValues.CryptoRandom),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "550e8400-e29b-41d4-a716-446655440000"

// Generate a UUID v5 (namespace + name based)
await makeUuid5(Uuid5Namespace.URL, 'https://example.com').pipe(
  Effect.provide([GetRandomValues.CryptoRandom, DateTimes.Default, Sha1.Default]),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "2ed6657d-e927-568b-95e1-2665a8aea6a2"

// Generate a UUID v7 (time-sortable)
await makeUuid7.pipe(
  Effect.provide(Uuid7State.Default),
  Effect.provide([GetRandomValues.CryptoRandom, DateTimes.Default]),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "018e7768-c0b3-7000-8000-123456789abc"

// Generate a NanoID
await makeNanoId.pipe(
  Effect.provide(GetRandomValues.CryptoRandom),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "V1StGXR8_Z5jdHi6B-myT"

// Generate a ULID
await makeUlid.pipe(
  Effect.provide([GetRandomValues.CryptoRandom, DateTimes.Default]),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "01ARZ3NDEKTSV4RRFFQ69G5FAV"

// Generate a CUID
await makeCuid.pipe(
  Effect.provide(CuidState.layer('my-environment')), // Provide environment fingerprint
  Effect.provide([GetRandomValues.CryptoRandom, DateTimes.Default]),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "clh3aqnd900003b64zpka3df"

// Generate a KSUID
await makeKsuid.pipe(
  Effect.provide([GetRandomValues.CryptoRandom, DateTimes.Default]),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "1jIGxyVFPeR4GkCcDPQU2bXhxy9"
```

## API

### UUID

- `makeUuid4`: Generates a v4 UUID (random)
- `makeUuid5`: Generates a v5 UUID (SHA-1 hash of namespace + name)
- `makeUuid7`: Generates a v7 UUID (time-sortable)

### UUID v5 Namespaces

Pre-defined namespaces for UUID v5 generation:
- `Uuid5Namespace.DNS`: For DNS-based UUIDs
- `Uuid5Namespace.URL`: For URL-based UUIDs
- `Uuid5Namespace.OID`: For OID-based UUIDs
- `Uuid5Namespace.X500`: For X.500 DN-based UUIDs

### NanoID

- `makeNanoId`: Generates a NanoID with a default length of 21 characters

### ULID

- `makeUlid`: Generates a ULID (Universally Unique Lexicographically Sortable Identifier)

### CUID

- `makeCuid`: Generates a CUID2 (Collision-resistant Unique IDentifier)
- `CuidState.layer(envData)`: Creates a CUID state layer with environment fingerprint
  - `envData`: A string identifying the environment (e.g., 'browser', 'node', 'mobile-ios', uniqueProcessId())
  - Used to help prevent collisions in distributed systems
  - Cached and reused for efficiency
- Format: 24 characters, starting with a lowercase letter, followed by numbers and lowercase letters
- Properties:
  - Sequential for database performance
  - Secure from enumeration
  - URL-safe
  - Horizontally scalable
  - Includes timestamp for time-based sorting

### KSUID

- `makeKsuid`: Generates a KSUID (K-Sortable Unique IDentifier)
- Format: 27 characters of base62 (0-9A-Za-z)
- Components:
  - 32-bit timestamp (seconds since 2014-03-01)
  - 128-bit random payload
- Properties:
  - Time-sortable (lexicographically ordered by time)
  - URL-safe (base62 encoded)
  - Includes entropy for uniqueness
  - Fixed size (27 characters)
  - ~136 years of timestamp space from 2014
  - No special character dependencies

## License

MIT
