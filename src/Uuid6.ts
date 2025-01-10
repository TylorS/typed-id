import * as Effect from 'effect/Effect'
import { GetRandomValues } from './GetRandomValues.js'
import { Layer, Schema } from 'effect'
import { DateTimes } from './DateTimes.js'
import { uuidStringify } from './UuidStringify.js'

export const Uuid6 = Schema.UUID.pipe(Schema.brand('@typed/id/UUID6'))
export type Uuid6 = Schema.Schema.Type<typeof Uuid6>

export const isUuid6: (value: string) => value is Uuid6 = Schema.is(Uuid6)

export type Uuid6Seed = {
  readonly msecs: number
  readonly nsecs: number
  readonly clockSeq: number
  readonly nodeId: Uint8Array
}

export class Uuid6State extends Effect.Tag('Uuid6State')<
  Uuid6State,
  {
    readonly next: Effect.Effect<Uuid6Seed>
  }
>() {
  static Default: Layer.Layer<Uuid6State, never, GetRandomValues | DateTimes> = Layer.effect(
    this,
    Effect.gen(function* () {
      const { now } = yield* DateTimes
      const getRandomValues = yield* GetRandomValues

      const state = {
        msecs: Number.NEGATIVE_INFINITY,
        nsecs: 0,
        clockSeq: -1,
        nodeId: undefined as Uint8Array | undefined,
      }

      function updateState(currentTime: number, randomBytes: Uint8Array) {
        if (currentTime === state.msecs) {
          // Same msec-interval = simulate higher clock resolution by bumping `nsecs`
          state.nsecs++

          // Check for `nsecs` overflow (nsecs is capped at 10K intervals / msec)
          if (state.nsecs >= 10000) {
            state.nodeId = undefined
            state.nsecs = 0
          }
        } else if (currentTime > state.msecs) {
          // Reset nsec counter when clock advances to a new msec interval
          state.nsecs = 0
        } else if (currentTime < state.msecs) {
          // Handle clock regression
          state.nodeId = undefined
        }

        // Init node and clock sequence if needed
        if (!state.nodeId) {
          state.nodeId = randomBytes.slice(10, 16)
          // Set multicast bit
          state.nodeId[0] |= 0x01

          // Clock sequence must be randomized
          state.clockSeq = ((randomBytes[8] << 8) | randomBytes[9]) & 0x3fff
        }

        state.msecs = currentTime

        return {
          msecs: state.msecs,
          nsecs: state.nsecs,
          clockSeq: state.clockSeq,
          nodeId: state.nodeId,
        }
      }

      return {
        next: Effect.gen(function* () {
          const timestamp = yield* now
          const randomBytes = yield* getRandomValues(16)
          return updateState(timestamp, randomBytes)
        }),
      }
    }),
  )
}

export const makeUuid6: Effect.Effect<Uuid6, never, Uuid6State> = Effect.map(
  Uuid6State.next,
  uuid6FromSeed,
)

function uuid6FromSeed({ msecs, nsecs, clockSeq, nodeId }: Uuid6Seed): Uuid6 {
  // First generate the fields as they would be in a v1 UUID
  const result = new Uint8Array(16)

  // Offset to Gregorian epoch
  msecs += 12219292800000

  // `time_low`
  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000
  const time_low_bytes = new Uint8Array([
    (tl >>> 24) & 0xff,
    (tl >>> 16) & 0xff,
    (tl >>> 8) & 0xff,
    tl & 0xff,
  ])

  // `time_mid` and `time_high`
  const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff
  const time_mid_high_bytes = new Uint8Array([
    (tmh >>> 8) & 0xff,
    tmh & 0xff,
    ((tmh >>> 24) & 0xf) | 0x10, // include version 1
    (tmh >>> 16) & 0xff,
  ])

  result[0] = ((time_mid_high_bytes[2] & 0x0f) << 4) | ((time_mid_high_bytes[3] >> 4) & 0x0f)
  result[1] = ((time_mid_high_bytes[3] & 0x0f) << 4) | ((time_mid_high_bytes[0] & 0xf0) >> 4)
  result[2] = ((time_mid_high_bytes[0] & 0x0f) << 4) | ((time_mid_high_bytes[1] & 0xf0) >> 4)
  result[3] = ((time_mid_high_bytes[1] & 0x0f) << 4) | ((time_low_bytes[0] & 0xf0) >> 4)
  result[4] = ((time_low_bytes[0] & 0x0f) << 4) | ((time_low_bytes[1] & 0xf0) >> 4)
  result[5] = ((time_low_bytes[1] & 0x0f) << 4) | ((time_low_bytes[2] & 0xf0) >> 4)
  result[6] = 0x60 | (time_low_bytes[2] & 0x0f)
  result[7] = time_low_bytes[3]

  // clock_seq_hi_and_reserved
  result[8] = (clockSeq >>> 8) | 0x80 // variant bits

  // clock_seq_low
  result[9] = clockSeq & 0xff

  // node
  result[10] = nodeId[0]
  result[11] = nodeId[1]
  result[12] = nodeId[2]
  result[13] = nodeId[3]
  result[14] = nodeId[4]
  result[15] = nodeId[5]

  return uuidStringify(result) as Uuid6
}