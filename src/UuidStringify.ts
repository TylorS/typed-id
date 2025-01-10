const byteToHex: Array<string> = []

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1))
}

export function uuidStringify(seed: Uint8Array): string {
  return (
    // biome-ignore lint/style/useTemplate: Faster than template literals
    byteToHex[seed[0]] +
    byteToHex[seed[1]] +
    byteToHex[seed[2]] +
    byteToHex[seed[3]] +
    '-' +
    byteToHex[seed[4]] +
    byteToHex[seed[5]] +
    '-' +
    byteToHex[seed[6]] +
    byteToHex[seed[7]] +
    '-' +
    byteToHex[seed[8]] +
    byteToHex[seed[9]] +
    '-' +
    byteToHex[seed[10]] +
    byteToHex[seed[11]] +
    byteToHex[seed[12]] +
    byteToHex[seed[13]] +
    byteToHex[seed[14]] +
    byteToHex[seed[15]]
  )
}
