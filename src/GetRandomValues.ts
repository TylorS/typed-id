import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Random from 'effect/Random'

export class GetRandomValues extends Context.Tag('GetRandomValues')<
  GetRandomValues,
  (length: number) => Effect.Effect<Uint8Array>
>() {
  static readonly layer = (f: (length: number) => Effect.Effect<Uint8Array>) =>
    Layer.succeed(GetRandomValues, f)

  static readonly apply = (length: number) => Effect.flatMap(GetRandomValues, (f) => f(length))

  static readonly PseudoRandom = this.layer((length) =>
    Effect.gen(function* () {
      const view = new Uint8Array(length)
      for (let i = 0; i < length; ++i) {
        view[i] = yield* Random.nextInt
      }

      return view
    }),
  )

  static readonly CryptoRandom = this.layer((length) =>
    Effect.sync(() => crypto.getRandomValues(new Uint8Array(length))),
  )
}
