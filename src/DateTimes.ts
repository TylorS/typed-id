import { Effect, Layer, Option, TestClock } from 'effect'

export class DateTimes extends Effect.Tag('DateTimes')<
  DateTimes,
  {
    readonly now: Effect.Effect<number>
    readonly date: Effect.Effect<Date>
  }
>() {
  static readonly make = (now: Effect.Effect<number>) =>
    Effect.succeed({
      now,
      date: now.pipe(Effect.map((millis) => new Date(millis))),
    })

  static readonly Default = this.make(Effect.clockWith((clock) => clock.currentTimeMillis))

  static readonly Fixed = (base: Date) =>
    Layer.effect(
      DateTimes,
      Effect.gen(function* () {
        const clock = yield* Effect.clock
        const startMillis = yield* clock.currentTimeMillis
        const now = clock.currentTimeMillis.pipe(
          Effect.map((millis) =>
            // Use BigInt to avoid floating point precision issues which can break deterministic testing
            Number(BigInt(base.getTime()) + BigInt(millis) - BigInt(startMillis)),
          ),
        )

        return {
          now,
          date: now.pipe(Effect.map((millis) => new Date(millis))),
        }
      }),
    )
}
