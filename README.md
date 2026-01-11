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

You can also use it for snapshot testing:

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

- `sizePerPoint` (default: `10`) - Controls the resolution/scale. Smaller values = higher detail.
- `showLegend` (default: `true`) - Show coordinate labels at corners.
- `startWithNewLine` (default: `true`) - Add a newline before the output.

```typescript
logRects(rectangles, {
  sizePerPoint: 20,
  showLegend: false,
  startWithNewLine: false,
});
```

## License

MIT
