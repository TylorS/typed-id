import * as Effect from 'effect/Effect'
import { Layer, Schema } from 'effect'
import { uuidStringify } from './UuidStringify.js'

export const Uuid5 = Schema.UUID.pipe(Schema.brand('@typed/id/UUID5'))
export type Uuid5 = Schema.Schema.Type<typeof Uuid5>

export const isUuid5: (value: string) => value is Uuid5 = Schema.is(Uuid5)

export class Sha1 extends Effect.Tag('Sha1')<
  Sha1,
  {
    readonly hash: (data: Uint8Array) => Effect.Effect<Uint8Array, never>
  }
>() {
  static readonly Default = Layer.succeed(this, {
    hash: (data: Uint8Array) =>
      Effect.promise(() =>
        crypto.subtle.digest('SHA-1', data).then((hash) => new Uint8Array(hash)),
      ),
  })
}

export type Uuid5Namespace = Uint8Array

const textEncoder = new TextEncoder()

// Pre-defined namespaces from RFC 4122
export const Uuid5Namespace = {
  DNS: new Uint8Array([
    0x6b, 0xa7, 0xb8, 0x10, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
  ]),

  URL: new Uint8Array([
    0x6b, 0xa7, 0xb8, 0x11, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
  ]),

  OID: new Uint8Array([
    0x6b, 0xa7, 0xb8, 0x12, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
  ]),

  X500: new Uint8Array([
    0x6b, 0xa7, 0xb8, 0x14, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
  ]),
} as const

export function makeUuid5(
  namespace: Uuid5Namespace,
  name: string,
): Effect.Effect<Uuid5, never, Sha1> {
  return Effect.gen(function* () {
    const sha1 = yield* Sha1

    // Convert name to UTF-8 bytes
    const nameBytes = textEncoder.encode(name)

    // Concatenate namespace and name
    const buffer = new Uint8Array(namespace.length + nameBytes.length)
    buffer.set(namespace)
    buffer.set(nameBytes, namespace.length)

    // Hash the concatenated bytes
    const hash = yield* sha1.hash(buffer)

    // Format as UUID v5
    const result = new Uint8Array(16)

    // Copy first 16 bytes of the hash
    result.set(hash.subarray(0, 16))

    // Set version (5) and variant bits
    result[6] = (result[6] & 0x0f) | 0x50 // version 5
    result[8] = (result[8] & 0x3f) | 0x80 // variant 1

    return uuidStringify(result) as Uuid5
  })
}
