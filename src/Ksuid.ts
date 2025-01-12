import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import { DateTimes } from './DateTimes.js'
import { GetRandomValues } from './GetRandomValues.js'

// Constants
const EPOCH = 14e11 // 2014-03-01T00:00:00Z
const TIMESTAMP_BYTES = 4
const PAYLOAD_BYTES = 16
const TOTAL_BYTES = TIMESTAMP_BYTES + PAYLOAD_BYTES
const STRING_LENGTH = 27

// Schema
export const Ksuid = Schema.String.pipe(
  Schema.pattern(/^[0-9a-zA-Z]{27}$/),
  Schema.brand('@typed/id/KSUID'),
)
export type Ksuid = Schema.Schema.Type<typeof Ksuid>

export const isKsuid: (value: string) => value is Ksuid = Schema.is(Ksuid)

// Types
type KsuidSeed = {
  readonly timestamp: number
  readonly payload: Uint8Array
}

// Utilities
const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const base = BigInt(base62Chars.length)

function base62Encode(bytes: Uint8Array): string {
  let number = 0n
  for (const byte of bytes) {
    number = (number << 8n) + BigInt(byte)
  }

  const chars: string[] = new Array(STRING_LENGTH)
  let i = chars.length

  while (i > 0) {
    i--
    const remainder = Number(number % base)
    chars[i] = base62Chars[remainder]
    number = number / base
  }

  return chars.join('')
}

// Core Functions
function ksuidFromSeed({ timestamp, payload }: KsuidSeed): Ksuid {
  // Create the combined bytes
  const bytes = new Uint8Array(TOTAL_BYTES)

  // Support for timestamps before the epoch, usually for testing
  if (timestamp < EPOCH) {
    timestamp += EPOCH
  }

  // Write timestamp (4 bytes, big-endian)
  const seconds = Math.floor((timestamp - EPOCH) / 1000)
  bytes[0] = (seconds >>> 24) & 0xff
  bytes[1] = (seconds >>> 16) & 0xff
  bytes[2] = (seconds >>> 8) & 0xff
  bytes[3] = seconds & 0xff

  // Copy payload
  bytes.set(payload, TIMESTAMP_BYTES)

  // Encode as base62
  return Ksuid.make(base62Encode(bytes))
}

// Public API
export const makeKsuid: Effect.Effect<Ksuid, never, DateTimes | GetRandomValues> = Effect.gen(
  function* () {
    const timestamp = yield* DateTimes.now
    const payload = yield* GetRandomValues.apply(PAYLOAD_BYTES)
    return ksuidFromSeed({ timestamp, payload })
  },
)
