import { describe, expect, it } from '@effect/vitest'
import { Effect, flow } from 'effect'
import {
  DateTimes,
  GetRandomValues,
  isUuid4,
  isUuid5,
  isUuid7,
  makeNanoId,
  makeUlid,
  makeUuid4,
  makeUuid5,
  makeUuid7,
  Sha1,
  Uuid5Namespace,
  Uuid7State,
} from './index.js'

const makeTestValues = (length: number) => {
  const values = new Uint8Array(length)
  for (let i = 0; i < length; ++i) {
    values[i] = i
  }
  return values
}

const provideTestValues = flow(
  Effect.provide([Uuid7State.Default]),
  Effect.provide(Sha1.Default),
  Effect.provide([
    GetRandomValues.layer((length) => Effect.succeed(makeTestValues(length))),
    DateTimes.Fixed(new Date(0)),
  ]),
)

describe(__filename, () => {
  describe('Uuid4', () => {
    it.effect('generates a UUID v4', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeUuid4)
        expect(id).toMatchInlineSnapshot(`"00010203-0405-4607-8809-0a0b0c0d0e0f"`)
        expect(id.length).toEqual(36)
        expect(isUuid4(id)).toEqual(true)
      }).pipe(provideTestValues),
    )
  })

  describe('Uuid5', () => {
    it.effect('generates a UUID v5', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeUuid5(Uuid5Namespace.DNS, 'example.com'))
        expect(id).toMatchInlineSnapshot(`"cfbff0d1-9375-5685-968c-48ce8b15ae17"`)
        expect(id.length).toEqual(36)
        expect(isUuid5(id)).toEqual(true)
      }).pipe(provideTestValues),
    )
  })

  describe('Uuid7', () => {
    it.effect('generates a UUID v7', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeUuid7)
        expect(id).toMatchInlineSnapshot(`"00000000-0000-7030-9c20-260b0c0d0e0f"`)
        expect(id.length).toEqual(36)
        expect(isUuid7(id)).toEqual(true)
      }).pipe(provideTestValues),
    )
  })

  describe('NanoId', () => {
    it.effect('generates a NanoId', () =>
      Effect.gen(function* (_) {
        const id = yield* _(makeNanoId)
        expect(id).toMatchInlineSnapshot(`"0123456789abcdefghijk"`)
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
