import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { DateTimes, GetRandomValues, isUuid, makeNanoId, makeUlid, makeUuid } from './index.js'

const makeTestValues = (length: number) => {
  const values = new Uint8Array(length)
  for (let i = 0; i < length; ++i) {
    values[i] = i
  }
  return values
}

const provideTestValues = Effect.provide([
  GetRandomValues.layer((length) => Effect.succeed(makeTestValues(length))),
  DateTimes.Fixed(new Date(0)),
])

describe(__filename, () => {
  describe('Uuid', () => {
    it.effect('generates a UUID', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeUuid)
        expect(id).toEqual('00010203-0405-0607-0809-0a0b0c0d0e0f')
        expect(id.length).toEqual(36)
        expect(isUuid(id)).toEqual(true)
      }).pipe(provideTestValues),
    )
  })

  describe('NanoId', () => {
    it.effect('generates a NanoId', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeNanoId)

        expect(id).toEqual('0123456789abcdefghijk')
        expect(id.length).toEqual(21)
      }).pipe(provideTestValues),
    )
  })

  describe('Ulid', () => {
    it.effect('generates a Ulid', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeUlid)
        expect(id).toMatchInlineSnapshot(`"00000000000123456789ABCDEF"`)
        expect(id.length).toEqual(26)
      }).pipe(provideTestValues),
    )
  })
})
