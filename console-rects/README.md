# console-rects

A utility to visualize rectangles in the console using box-drawing characters. Perfect for debugging geometry code, visualizing overlapping rectangles, or drawing rectangles in the terminal. Created at Screen Studio to help debug geometry code when things get complex.

**Use cases:** Debug rectangle collisions, visualize layout calculations, log rectangles to console, debug geometry code, visualize overlapping rectangles in terminal.

## Installation

```bash
npm install console-rects
yarn install console-rects
```

## Usage

```typescript
import { logRects, getRectsLog } from "console-rects";

const rectangles = [
  { x: 0, y: 0, width: 100, height: 100 }, // light
  { x: 40, y: 40, width: 100, height: 100 }, // heavy
  { x: 80, y: 80, width: 100, height: 100 }, // double
];

logRects(rectangles);
getRectsLog(rectangles); // returns the string without logging to console
```

This will output a visual representation of the rectangles in your console:

```
[0, 0]                 Rectangles (3):
┏━━━0━━━━┓             0: [ 0,  0, 100, 100]
┃   ┌───1────┐         1: [40, 40, 100, 100]
┃   │    ┃   │         2: [80, 80, 100, 100]
┃   │   ┌╌╌╌2╌╌╌╌┐
┗━━━│━━━╎┛   │   ╎
    └───╎────┘   ╎
        ╎        ╎
        └╌╌╌╌╌╌╌╌┘
        [180, 180]
```

Each rectangle gets a different line style (light, heavy, double, dashed, dashed-heavy) based on its position in the array.

You can also pass a record of rectangles:

```ts
const rectangles = {
  foo: { x: 0, y: 0, width: 100, height: 100 },
  bar: { x: 40, y: 40, width: 100, height: 100 },
  baz: { x: 80, y: 80, width: 100, height: 100 },
};

getRectsLog(rectangles);
```

This will output named rectangles:

```
[0, 0]                 Rectangles (3):
┏━━foo━━━┓             foo: [ 0,  0, 100, 100]
┃   ┌───bar──┐         bar: [40, 40, 100, 100]
┃   │    ┃   │         baz: [80, 80, 100, 100]
┃   │   ┌╌╌baz╌╌╌┐
┗━━━│━━━╎┛   │   ╎
    └───╎────┘   ╎
        ╎        ╎
        └╌╌╌╌╌╌╌╌┘
        [180, 180]
```

You can also use it for snapshot testing:

Note that next to visual representation, the list of exact coordinates is also included so the test snapshot is never ambiguous.

```ts
expect(testLayout(layout)).toMatchInlineSnapshot(`
  "
  [0, 0]                                                                  Rectangles (3):
  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌camera╌╌╌╌╌╌╌╌╌╌╌╌╌┐───────────recording────────────┐     recording: [100, 0, 100, 100]
  ╎                                ╎                                │     camera   : [  0, 0, 100, 100]
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  ╎                                ╎                                │
  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘────────────────────────────────┘
                                                            [200, 100]"
`);
```

## Options

```ts
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LogRectsOptions {
  sizePerPoint?: number;
  showLegend?: boolean;
  listRectangles?: boolean;
  startWithNewLine?: boolean;
  adjustOutputHeight?: boolean;
}

type Maybe<T> = T | null | undefined;

export type RectsLogInput = Array<Maybe<Rectangle>> | Record<string, Maybe<Rectangle>>;

export function getRectsLog(input: RectsLogInput, options?: LogRectsOptions): string | null;
export function logRects(rectangles: Rectangle[], options?: LogRectsOptions): void;
```

- `sizePerPoint` (default: `10`) - Controls the resolution/scale. Smaller values = higher detail.
- `showLegend` (default: `true`) - Show coordinate labels at corners.
- `listRectangles` (default: `true`) - List rectangles in the output.
- `startWithNewLine` (default: `true`) - Add a newline before the output.

```typescript
logRects(rectangles, {
  sizePerPoint: 20,
  showLegend: false,
  startWithNewLine: false,
});
```

```ts
const logString = getRectsLog(rectangles, { listRectangles: false });
console.log(logString);
```

## License

MIT
