//! https://stackoverflow.com/a/64953280

export function abs(x: bigint) {
    return x < 0n ? -x : x;
}

export function sign(x: bigint) {
    if (x === 0n) return 0n;
    return x < 0n ? -1n : 1n;
}

export function pow(base: bigint, exponent: bigint) {
    return base ** exponent;
}

export function min(value: bigint, ...values: bigint[]) {
    for (const v of values)
        if (v < value) value = v;
    return value;
}

export function max(value: bigint, ...values: bigint[]) {
    for (const v of values)
        if (v > value) value = v;
    return value;
}