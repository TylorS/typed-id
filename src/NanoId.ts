import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import { GetRandomValues } from './GetRandomValues.js'

const nanoIdPattern = /[0-9a-zA-Z_-]/

export const isNanoId = (id: string): id is NanoId => nanoIdPattern.test(id)

export const NanoId = Schema.String.pipe(Schema.brand('@typed/id/NanoId'))
export type NanoId = Schema.Schema.Type<typeof NanoId>

export type NanoIdSeed = readonly [
  zero: number,
  one: number,
  two: number,
  three: number,
  four: number,
  five: number,
  six: number,
  seven: number,
  eight: number,
  nine: number,
  ten: number,
  eleven: number,
  twelve: number,
  thirteen: number,
  fourteen: number,
  fifteen: number,
  sixteen: number,
  seventeen: number,
  eighteen: number,
  nineteen: number,
  twenty: number,
]

const numToCharacter = (byte: number): string => {
  byte &= 63
  if (byte < 36) {
    // `0-9a-z`
    return byte.toString(36)
  } else if (byte < 62) {
    // `A-Z`
    return (byte - 26).toString(36).toUpperCase()
  } else if (byte > 62) {
    return '-'
  } else {
    return '_'
  }
}

export const nanoId = (seed: NanoIdSeed): NanoId =>
  NanoId.make(seed.reduce((id, x) => id + numToCharacter(x), ''))

export const makeNanoIdSeed: Effect.Effect<NanoIdSeed, never, GetRandomValues> =
  GetRandomValues.apply(21) as any

export const makeNanoId: Effect.Effect<NanoId, never, GetRandomValues> = Effect.map(
  makeNanoIdSeed,
  nanoId,
)
