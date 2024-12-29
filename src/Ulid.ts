import * as Effect from 'effect/Effect'
import { GetRandomValues } from './GetRandomValues.js'
import { Schema } from 'effect'
import { DateTimes } from './DateTimes.js'

export const isUlid: (value: string) => value is Ulid = Schema.is(Schema.ULID) as any

export const Ulid = Schema.ULID.pipe(Schema.brand('@typed/id/ULID'))
export type Ulid = Schema.Schema.Type<typeof Ulid>

export type UlidSeed = {
  readonly seed: readonly [
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
  ]
  readonly now: number
}

// Crockford's Base32
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ENCODING_LEN = ENCODING.length
const TIME_MAX = 2 ** 48 - 1
const TIME_LEN = 10
const RANDOM_LEN = 16

export const makeUlidSeed: Effect.Effect<UlidSeed, never, GetRandomValues | DateTimes> =
  DateTimes.now.pipe(
    Effect.bindTo('now'),
    Effect.bind(
      'seed',
      () =>
        GetRandomValues.apply(16) as any as Effect.Effect<UlidSeed['seed'], never, GetRandomValues>,
    ),
  )

export const makeUlid: Effect.Effect<Ulid, never, GetRandomValues | DateTimes> = Effect.map(
  makeUlidSeed,
  ({ seed, now }) => ulid(seed, now),
)

function encodeTime(now: number, len: number): string {
  let str = ''
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % ENCODING_LEN
    str = ENCODING.charAt(mod) + str
    now = (now - mod) / ENCODING_LEN
  }
  return str
}

function encodeRandom(seed: UlidSeed['seed']): string {
  let str = ''
  for (let i = 0; i < RANDOM_LEN; i++) {
    str = str + ENCODING.charAt(seed[i] % ENCODING_LEN)
  }
  return str
}

export function ulid(seed: UlidSeed['seed'], now: UlidSeed['now']): Ulid {
  if (now > TIME_MAX) {
    throw new Error('Cannot generate ULID due to timestamp overflow')
  }

  const time = encodeTime(now, TIME_LEN)
  const random = encodeRandom(seed)

  return Ulid.make(time + random)
}
