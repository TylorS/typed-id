# @typed/lazy-ref

A powerful, type-safe reactive state management library for Effect, combining the best of lazy evaluation and reactive programming. This library provides a way to manage state that is both efficient (computed only when needed) and reactive (automatically updates dependents when changes occur).

## Features

- 🔄 **Lazy Evaluation**: Values are computed only when needed, saving resources and improving performance
- 🎯 **Type-safe**: Full TypeScript support with precise type inference, catching errors at compile time
- 🔗 **Composable**: Combine refs using `struct`, `tuple`, and other combinators to build complex state structures
- 🎭 **Reactive**: Stream-based updates with automatic value propagation to all dependents
- 🎨 **Flexible**: Works with both `Effect` and `Stream` based computations for different use cases
- 🏷️ **Tagged**: First-class support for Effect's tagged services pattern for dependency injection
- 🔄 **Concurrency-safe Updates**: Thread-safe state updates with `runUpdates` preventing race conditions

## Installation

```bash
npm install @typed/lazy-ref
# or
yarn add @typed/lazy-ref
# or 
pnpm add @typed/lazy-ref
```

## Quick Start

Here's a simple example demonstrating the basic usage of LazyRef. This example shows how to create, read, update, and reset a reference:

```typescript
import * as LazyRef from '@typed/lazy-ref'
import { Effect } from 'effect'

// Create a simple counter
const program = Effect.gen(function* () {
  // Initialize with 0
  const counter = yield* LazyRef.of(0)
  
  // Get current value
  const initial = yield* counter
  console.log(initial) // 0
  
  // Update value
  yield* LazyRef.update(counter, x => x + 1)
  console.log(yield* counter) // 1
  
  // Reset to initial state
  yield* LazyRef.delete(counter)
  console.log(yield* counter) // 0
})

// Run the program with proper resource management
Effect.runPromise(Effect.scoped(program))
```

## Core Concepts

### LazyRef

A `LazyRef` is a reference to a value that can be lazily computed and reactively updated. Think of it as a smart container for your values that provides:

- **Lazy evaluation**: Values are only computed when someone actually needs them
- **Reactive updates**: When a value changes, all dependent computations are automatically updated
- **Resource management**: Proper cleanup of resources when they're no longer needed
- **Concurrency safety**: Thread-safe updates preventing race conditions

The interface shows the core capabilities:

```typescript
// An Effect which can retrieve the current value
interface LazyRef<A, E = never, R = never> extends Effect<A, E, R> {
  // Stream of value changes
  readonly changes: Stream<A, E, R>
  // Current version number (increments with updates)
  readonly version: Effect<number, never, R>
  // Safe concurrent updates
  readonly runUpdates: <B, E2, R2>(
    f: (ref: GetSetDelete<A, E, R>) => Effect<B, E2, R2>
  ) => Effect<B, E2, R | R2>
}
```

### Creating LazyRefs

There are several ways to create a LazyRef, each suited for different use cases:

```typescript
// From a simple value - good for initial states
const ref = LazyRef.of(initialValue)

// From an Effect - good for async computations
const ref = LazyRef.make(Effect.succeed(value))

// From a Stream - good for continuous updates
const ref = LazyRef.make(Stream.succeed(value))

// From a failing computation - good for error handling
const ref = LazyRef.fail(error)
```

### Composing LazyRefs

One of the most powerful features of LazyRef is its ability to compose multiple refs together. This allows you to build complex state structures while maintaining reactivity.

#### Struct Composition

Use struct composition when you want to combine multiple refs into an object structure:

```typescript
const program = Effect.gen(function* () {
  const a = yield* LazyRef.of(0)
  const b = yield* LazyRef.of(1)
  const c = yield* LazyRef.of(2)
  
  // Combine into an object structure
  const struct = LazyRef.struct({ a, b, c })
  
  console.log(yield* struct) // { a: 0, b: 1, c: 2 }
  
  // Updates to individual refs automatically propagate
  yield* LazyRef.update(a, x => x + 1)
  console.log(yield* struct) // { a: 1, b: 1, c: 2 }
})
```

#### Tuple Composition

Use tuple composition when you want to combine refs into an array-like structure:

```typescript
const program = Effect.gen(function* () {
  const a = yield* LazyRef.of(0)
  const b = yield* LazyRef.of(1)
  
  // Combine into a tuple
  const tuple = LazyRef.tuple(a, b)
  
  console.log(yield* tuple) // [0, 1]
  
  // Update the entire tuple atomically
  yield* LazyRef.update(tuple, ([x, y]) => [x + 1, y + 1])
  console.log(yield* tuple) // [1, 2]
})
```

### Computed Values

Computed values are derived state that automatically update when their dependencies change. This is perfect for maintaining derived state that should stay in sync with source data:

```typescript
const program = Effect.gen(function* () {
  const count = yield* LazyRef.of(0)
  // Create a computed value that's always double the count
  const doubled = LazyRef.map(count, x => x * 2)
  
  console.log(yield* doubled) // 0
  yield* LazyRef.update(count, x => x + 1)
  console.log(yield* doubled) // 2 - automatically updated!
})
```

### Tagged Services

Tagged services allow you to integrate LazyRef with Effect's dependency injection system. This is great for managing global state and dependencies and provides the same LazyRef interface just provided from Effect's Context:

```typescript
class Counter extends LazyRef.Tag('Counter')<Counter, number>() {
  // Define operations as static members for clean usage
  static increment = LazyRef.update(Counter, (x) => x + 1)
  static decrement = LazyRef.update(Counter, (x) => x - 1)
}

const program = Effect.gen(function* () {
  console.log(yield* Counter) // 0
  yield* Counter.increment
  yield* Counter.increment
  yield* Counter.decrement
  console.log(yield* Counter) // 1
}).pipe(
  Effect.provide(Counter.of(0)),
  // Alternative ways to provide the service:
  // Effect.provide(Counter.make(Effect.succeed(0)))
  // Effect.provide(Counter.make(Stream.succeed(0)))
)
```

### Updates

LazyRef provides concurrency-safe updates through the `runUpdates` method. This ensures that updates are atomic and prevent race conditions:

```typescript
const program = Effect.gen(function* () {
  const ref = yield* LazyRef.of(0)

  yield* ref.runUpdates(({ get, set }) =>
    // Runs within a Semaphore of 1 (Lock)
    Effect.gen(function* () {
      const current = yield* get
      yield* set(current + 1)
      return "Updated!"
    })
  )
})
```

## Advanced Features

### Streams

Every LazyRef comes with built-in support for reactive programming through its `changes` stream. This allows you to react to changes over time:

```typescript
const program = Effect.gen(function* () {
  const ref = yield* LazyRef.of(0)
  // Subscribe to the next 3 values
  const fiber = yield* ref.changes.pipe(
    Stream.take(3),
    Stream.runCollect,
    Effect.fork
  )
  
  // Updates are propagated to subscribers
  yield* LazyRef.update(ref, x => x + 1)
  yield* LazyRef.update(ref, x => x + 1)
  
  const values = yield* Effect.join(fiber)
  console.log(Array.from(values)) // [0, 1, 2]
})
```

### Resource Management

LazyRef integrates with Effect's resource management system. Resources are automatically cleaned up when their scope ends, but you can also manage them manually:

```typescript
const program = Effect.gen(function* () {
  const ref = yield* LazyRef.of(0)
  
  // Initiate cleanup in a background Fiber
  yield* ref.shutdown
  
  // Wait for cleanup to complete if needed
  yield* ref.awaitShutdown
})
```

## License

MIT

