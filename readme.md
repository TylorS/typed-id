# @typed/id

A TypeScript library providing common ID format generation using [Effect](https://effect.website/). This package includes implementations for UUID, NanoID, and ULID generation with a focus on type safety and functional programming principles.

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
  - UUID (v4)
  - NanoID
  - ULID
- ⚡ Efficient and secure random value generation
- 📦 Zero dependencies (except Effect)

## Usage

```typescript
import { Effect } from 'effect'
import { 
  DateTimes, 
  GetRandomValues, 
  makeUuid4, 
  makeUuid7,
  Uuid7State
  makeNanoId, 
  makeUlid 
} from '@typed/id'

// Generate a UUID v4
await makeUuid4.pipe(
  Effect.provide(GetRandomValues.CryptoRandom),
  Effect.flatMap(Effect.log),
  Effect.runPromise
)
// Output: "550e8400-e29b-41d4-a716-446655440000"

await makeUuid7.pipe(
  Effect.provide(Uuid7State.Default)
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
```

## API

### UUID

- `makeUuid4`: Generates a v4 UUID

- `makeUuid7`: Generate a v7, time-sortable, UUID

### NanoID

- `makeNanoId`: Generates a NanoID with a default length of 21 characters

### ULID

- `makeUlid`: Generates a ULID (Universally Unique Lexicographically Sortable Identifier)

## License

MIT
