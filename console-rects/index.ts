interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Direction bitmasks
const UP = 1;
const DOWN = 2;
const LEFT = 4;
const RIGHT = 8;

type LineStyle = "light" | "heavy" | "double" | "dashed" | "dashed-heavy";

const STYLES: LineStyle[] = [
  //
  "heavy", // ╹╻╸╺━┃┏┓┛┗┣┫┳┻┼
  "light", // ╵╷╴╶─│┌┐└┘├┤┬┴┼
  "dashed", // ╎╎╌╌╎┌┐└┘├┤┬┴┼
  "dashed-heavy", // ╏╏╍╍╏┏┓┛┗┣┫┳┻┼
  "double", // ║║═║╔╗╚╝╠╣╦╩╬
];

// Box-drawing character maps for each style
const STYLE_CHARS: Record<LineStyle, Record<number, string>> = {
  light: {
    [UP]: "╵",
    [DOWN]: "╷",
    [LEFT]: "╴",
    [RIGHT]: "╶",
    [LEFT | RIGHT]: "─",
    [UP | DOWN]: "│",
    [DOWN | RIGHT]: "┌",
    [DOWN | LEFT]: "┐",
    [UP | RIGHT]: "└",
    [UP | LEFT]: "┘",
    [UP | DOWN | RIGHT]: "├",
    [UP | DOWN | LEFT]: "┤",
    [LEFT | RIGHT | DOWN]: "┬",
    [LEFT | RIGHT | UP]: "┴",
    [UP | DOWN | LEFT | RIGHT]: "┼",
  },
  heavy: {
    [UP]: "╹",
    [DOWN]: "╻",
    [LEFT]: "╸",
    [RIGHT]: "╺",
    [LEFT | RIGHT]: "━",
    [UP | DOWN]: "┃",
    [DOWN | RIGHT]: "┏",
    [DOWN | LEFT]: "┓",
    [UP | RIGHT]: "┗",
    [UP | LEFT]: "┛",
    [UP | DOWN | RIGHT]: "┣",
    [UP | DOWN | LEFT]: "┫",
    [LEFT | RIGHT | DOWN]: "┳",
    [LEFT | RIGHT | UP]: "┻",
    [UP | DOWN | LEFT | RIGHT]: "╋",
  },
  double: {
    [UP]: "║",
    [DOWN]: "║",
    [LEFT]: "═",
    [RIGHT]: "═",
    [LEFT | RIGHT]: "═",
    [UP | DOWN]: "║",
    [DOWN | RIGHT]: "╔",
    [DOWN | LEFT]: "╗",
    [UP | RIGHT]: "╚",
    [UP | LEFT]: "╝",
    [UP | DOWN | RIGHT]: "╠",
    [UP | DOWN | LEFT]: "╣",
    [LEFT | RIGHT | DOWN]: "╦",
    [LEFT | RIGHT | UP]: "╩",
    [UP | DOWN | LEFT | RIGHT]: "╬",
  },
  dashed: {
    [UP]: "╎",
    [DOWN]: "╎",
    [LEFT]: "╌",
    [RIGHT]: "╌",
    [LEFT | RIGHT]: "╌",
    [UP | DOWN]: "╎",
    [DOWN | RIGHT]: "┌",
    [DOWN | LEFT]: "┐",
    [UP | RIGHT]: "└",
    [UP | LEFT]: "┘",
    [UP | DOWN | RIGHT]: "├",
    [UP | DOWN | LEFT]: "┤",
    [LEFT | RIGHT | DOWN]: "┬",
    [LEFT | RIGHT | UP]: "┴",
    [UP | DOWN | LEFT | RIGHT]: "┼",
  },
  "dashed-heavy": {
    [UP]: "╏",
    [DOWN]: "╏",
    [LEFT]: "╍",
    [RIGHT]: "╍",
    [LEFT | RIGHT]: "╍",
    [UP | DOWN]: "╏",
    [DOWN | RIGHT]: "┏",
    [DOWN | LEFT]: "┓",
    [UP | RIGHT]: "┗",
    [UP | LEFT]: "┛",
    [UP | DOWN | RIGHT]: "┣",
    [UP | DOWN | LEFT]: "┫",
    [LEFT | RIGHT | DOWN]: "┳",
    [LEFT | RIGHT | UP]: "┻",
    [UP | DOWN | LEFT | RIGHT]: "╋",
  },
};

interface CellData {
  directions: number;
  zIndex: number;
}

interface IndexData {
  char: string;
  zIndex: number;
}

export interface LogRectsOptions {
  sizePerPoint?: number;
  showLegend?: boolean;
  listRectangles?: boolean;
  startWithNewLine?: boolean;
  adjustOutputHeight?: boolean;
}

function maxBy<T>(array: T[], selector: (item: T) => number): number {
  return array.reduce((max, item) => {
    const value = selector(item);
    return value > max ? value : max;
  }, -Infinity);
}

function createRectsDescriptions(rectangles: NamedRectangle[]) {
  const maxNameLength = maxBy(rectangles, (rect) => rect.name.length);
  const maxXLength = maxBy(rectangles, (rect) => rect.x.toString().length);
  const maxYLength = maxBy(rectangles, (rect) => rect.y.toString().length);
  const maxWidthLength = maxBy(rectangles, (rect) => rect.width.toString().length);
  const maxHeightLength = maxBy(rectangles, (rect) => rect.height.toString().length);

  const descriptions = rectangles.map((rect) => {
    const name = rect.name.padEnd(maxNameLength, " ");
    const x = rect.x.toString().padStart(maxXLength, " ");
    const y = rect.y.toString().padStart(maxYLength, " ");
    const width = rect.width.toString().padStart(maxWidthLength, " ");
    const height = rect.height.toString().padStart(maxHeightLength, " ");
    return `${name}: [${x}, ${y}, ${width}, ${height}]`;
  });

  descriptions.unshift(`Rectangles (${rectangles.length}):`);

  return descriptions;
}

function addDescriptionsToLines(lines: string[], descriptions: string[], padding: number = 5) {
  const longestLineLength = maxBy(lines, (line) => line.length);
  for (let i = 0; i < descriptions.length; i++) {
    if (i >= descriptions.length) break;

    const line = lines[i] ?? "";

    lines[i] = line.padEnd(longestLineLength + padding, " ");
    lines[i] += descriptions[i];
  }
  return lines;
}

type Maybe<T> = T | null | undefined;

export type RectsLogInput = Array<Maybe<Rectangle>> | Record<string, Maybe<Rectangle>>;

function getIsSet<T>(value: Maybe<T>): value is T {
  return value !== null && value !== undefined;
}

interface NamedRectangle extends Rectangle {
  name: string;
}

function resolveInput(input: RectsLogInput): NamedRectangle[] {
  if (Array.isArray(input)) {
    return input.filter(getIsSet).map((rect, index) => ({ ...rect, name: String(index) }));
  }

  return Object.entries(input)
    .filter(([, rect]) => !!rect)
    .map(([name, rect]) => ({ ...rect!, name }));
}

export function getRectsLog(
  input: RectsLogInput,
  {
    sizePerPoint = 10,
    showLegend = true,
    listRectangles = true,
    startWithNewLine = true,
    adjustOutputHeight = true,
  }: LogRectsOptions = {}
): string | null {
  const rectangles = resolveInput(input);

  const xSizePerPoint = sizePerPoint;
  const ySizePerPoint = adjustOutputHeight ? sizePerPoint * 2 * 1.2 : sizePerPoint;

  if (rectangles.length === 0) {
    return null;
  }

  // Find bounding box of all rectangles
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const rect of rectangles) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  // Calculate grid dimensions based on resolution
  const gridWidth = Math.ceil((maxX - minX) / xSizePerPoint);
  const gridHeight = Math.ceil((maxY - minY) / ySizePerPoint);

  // Create grid to track directions and z-index at each cell
  const grid: CellData[][] = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => ({ directions: 0, zIndex: -1 }))
  );

  // Create index overlay grid
  const indexGrid: (IndexData | null)[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));

  // Helper to set cell data with z-index awareness
  const setCell = (row: number, col: number, direction: number, zIndex: number) => {
    if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) return;
    const cell = grid[row][col];
    if (zIndex >= cell.zIndex) {
      if (zIndex > cell.zIndex) {
        cell.directions = 0;
        cell.zIndex = zIndex;
      }
      cell.directions |= direction;
    }
  };

  // Helper to draw a horizontal line segment
  const drawHorizontal = (row: number, colStart: number, colEnd: number, zIndex: number) => {
    for (let col = colStart; col <= colEnd; col++) {
      let dirs = 0;
      if (col > colStart) dirs |= LEFT;
      if (col < colEnd) dirs |= RIGHT;
      if (dirs) setCell(row, col, dirs, zIndex);
    }
  };

  // Helper to draw a vertical line segment
  const drawVertical = (col: number, rowStart: number, rowEnd: number, zIndex: number) => {
    for (let row = rowStart; row <= rowEnd; row++) {
      let dirs = 0;
      if (row > rowStart) dirs |= UP;
      if (row < rowEnd) dirs |= DOWN;
      if (dirs) setCell(row, col, dirs, zIndex);
    }
  };

  // Draw each rectangle's outline with z-index = array index
  rectangles.forEach((rect, index) => {
    const startCol = Math.floor((rect.x - minX) / xSizePerPoint);
    const startRow = Math.floor((rect.y - minY) / ySizePerPoint);
    const endCol = Math.ceil((rect.x + rect.width - minX) / xSizePerPoint) - 1;
    const endRow = Math.ceil((rect.y + rect.height - minY) / ySizePerPoint) - 1;

    // Draw the four edges
    drawHorizontal(startRow, startCol, endCol, index);
    drawHorizontal(endRow, startCol, endCol, index);
    drawVertical(startCol, startRow, endRow, index);
    drawVertical(endCol, startRow, endRow, index);

    // Place index at center of top edge if there's room
    const indexStr = rect.name;
    const edgeWidth = endCol - startCol; // number of segments (cells - 1)

    // Need at least 1 line char on each side of the index
    // Inner width (excluding corners) = edgeWidth - 1
    // Required: innerWidth >= indexStr.length + 2
    if (edgeWidth >= indexStr.length + 3) {
      const innerWidth = edgeWidth - 1;
      const indexStart = startCol + 1 + Math.floor((innerWidth - indexStr.length) / 2);

      for (let i = 0; i < indexStr.length; i++) {
        const col = indexStart + i;
        if (col >= 0 && col < gridWidth && startRow >= 0 && startRow < gridHeight) {
          const existing = indexGrid[startRow][col];
          if (!existing || index >= existing.zIndex) {
            indexGrid[startRow][col] = { char: indexStr[i], zIndex: index };
          }
        }
      }
    }
  });

  // Convert cell data to characters, respecting z-index for both edges and indices
  const charGrid: string[][] = grid.map((row, rowIdx) =>
    row.map((cell, colIdx) => {
      const indexData = indexGrid[rowIdx][colIdx];

      // If there's an index with higher or equal z-index, use it
      if (indexData && indexData.zIndex >= cell.zIndex) {
        return indexData.char;
      }

      // Otherwise use edge character
      if (cell.directions === 0) return " ";
      const style = STYLES[cell.zIndex % STYLES.length];
      return STYLE_CHARS[style][cell.directions] || "?";
    })
  );

  const CORNER_CHAR_DOT_ASCII = "•";

  if (charGrid[0][0] === " ") {
    charGrid[0][0] = "•";
  }

  if (charGrid[charGrid.length - 1][charGrid[0].length - 1] === " ") {
    charGrid[charGrid.length - 1][charGrid[0].length - 1] = "•";
  }

  // Build output string
  let lines: string[] = [];

  if (showLegend) {
    const topLeftLabel = `[${minX}, ${minY}]`;
    const bottomRightLabel = `[${maxX}, ${maxY}]`;

    lines.push(topLeftLabel);
    for (const row of charGrid) {
      lines.push(row.join(""));
    }
    const lastPadding = Math.max(0, gridWidth - bottomRightLabel.length);
    lines.push(" ".repeat(lastPadding) + bottomRightLabel);
  } else {
    for (const row of charGrid) {
      lines.push(row.join(""));
    }
  }

  if (listRectangles) {
    const descriptions = createRectsDescriptions(rectangles);
    lines = addDescriptionsToLines(lines, descriptions);
  }

  if (startWithNewLine) {
    lines.unshift("");
  }

  const output = lines.join("\n");

  return output;
}

export function logRects(rectangles: Rectangle[], options?: LogRectsOptions): void {
  console.info(getRectsLog(rectangles, options));
}
