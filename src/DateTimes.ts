import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

export class DateTimes extends Effect.Tag('DateTimes')<
  DateTimes,
  {
    readonly now: Effect.Effect<number>
    readonly date: Effect.Effect<Date>
  }
>() {
  static readonly make = (now: Effect.Effect<number>): Layer.Layer<DateTimes> =>
    Layer.succeed(this, {
      now,
      date: now.pipe(Effect.map((millis) => new Date(millis))),
    })

  static readonly Default: Layer.Layer<DateTimes> = this.make(Effect.clockWith((clock) => clock.currentTimeMillis))

  static readonly Fixed = (base: Date): Layer.Layer<DateTimes> =>
    Layer.effect(
      DateTimes,
      Effect.gen(function* () {
        const clock = yield* Effect.clock
        const baseN = BigInt(base.getTime())
        const startMillis = yield* clock.currentTimeMillis
        const now = clock.currentTimeMillis.pipe(
          Effect.map((millis) =>
            // Use BigInt to avoid floating point precision issues which can break deterministic testing
            Number(baseN + BigInt(millis) - BigInt(startMillis)),
          ),
        )

        return {
          now,
          date: now.pipe(Effect.map((millis) => new Date(millis))),
        }
      }),
    )
}

