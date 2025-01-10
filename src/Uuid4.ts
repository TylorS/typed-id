import * as Effect from 'effect/Effect'
import { GetRandomValues } from './GetRandomValues.js'
import { Schema } from 'effect'
import { uuidStringify } from './UuidStringify.js'

export const Uuid4 = Schema.UUID.pipe(Schema.brand('@typed/id/UUID4'))
export type Uuid4 = Schema.Schema.Type<typeof Uuid4>

export const isUuid4: (value: string) => value is Uuid4 = Schema.is(Uuid4)

export const makeUuid4: Effect.Effect<Uuid4, never, GetRandomValues> = Effect.map(
  GetRandomValues.apply(16),
  uuid4FromSeed,
)

function uuid4FromSeed(seed: Uint8Array): Uuid4 {
  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  seed[6] = (seed[6] & 0x0f) | 0x40
  seed[8] = (seed[8] & 0x3f) | 0x80

  return uuidStringify(seed) as Uuid4
}
