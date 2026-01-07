interface Rect {
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

// Box-drawing character maps for each style
const STYLE_CHARS = {
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
} satisfies Record<string, Record<number, string>>;

type LineStyle = keyof typeof STYLE_CHARS;

const STYLES: LineStyle[] = Object.keys(STYLE_CHARS) as LineStyle[];

interface CellData {
  directions: number;
  zIndex: number; // highest z-index that touched this cell
}

export interface LogRectsOptions {
  sizePerPoint?: number;
  showLegend?: boolean;
  startWithNewLine?: boolean;
  dontLog?: boolean;
}

function findBoundaries(rectangles: Rect[]) {
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

  return { minX, minY, maxX, maxY };
}

export function logRects(
  rectangles: Rect[],
  { sizePerPoint = 10, showLegend = true, startWithNewLine = true, dontLog = false }: LogRectsOptions = {}
): string {
  if (rectangles.length === 0) {
    return "";
  }

  // Find bounding box of all rectangles
  const { minX, minY, maxX, maxY } = findBoundaries(rectangles);

  // Calculate grid dimensions based on resolution
  const gridWidth = Math.ceil((maxX - minX) / sizePerPoint);
  const gridHeight = Math.ceil((maxY - minY) / sizePerPoint);

  // Create grid to track directions and z-index at each cell
  const grid: CellData[][] = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => ({ directions: 0, zIndex: -1 }))
  );

  // Helper to set cell data with z-index awareness
  const setCell = (row: number, col: number, direction: number, zIndex: number) => {
    if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) return;
    const cell = grid[row][col];
    if (zIndex >= cell.zIndex) {
      // Higher or equal z-index takes over, reset directions
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
  rectangles.forEach((rect, zIndex) => {
    const startCol = Math.floor((rect.x - minX) / sizePerPoint);
    const startRow = Math.floor((rect.y - minY) / sizePerPoint);
    const endCol = Math.ceil((rect.x + rect.width - minX) / sizePerPoint) - 1;
    const endRow = Math.ceil((rect.y + rect.height - minY) / sizePerPoint) - 1;

    // Draw the four edges
    drawHorizontal(startRow, startCol, endCol, zIndex); // Top
    drawHorizontal(endRow, startCol, endCol, zIndex); // Bottom
    drawVertical(startCol, startRow, endRow, zIndex); // Left
    drawVertical(endCol, startRow, endRow, zIndex); // Right
  });

  // Convert cell data to characters
  const charGrid: string[][] = grid.map((row) =>
    row.map((cell) => {
      if (cell.directions === 0) return " ";
      const style = STYLES[cell.zIndex % STYLES.length];
      return STYLE_CHARS[style][cell.directions] || "?";
    })
  );

  // Build output string
  const lines: string[] = [];

  if (showLegend) {
    const topLeftLabel = `[${minX}, ${minY}]`;
    const bottomRightLabel = `[${maxX}, ${maxY}]`;
    const padding = " ".repeat(topLeftLabel.length + 1);

    lines.push(topLeftLabel);
    for (const row of charGrid) {
      lines.push(padding + row.join(""));
    }
    lines.push(padding + " ".repeat(gridWidth) + " " + bottomRightLabel);
  } else {
    for (const row of charGrid) {
      lines.push(row.join(""));
    }
  }

  if (startWithNewLine) {
    lines.unshift("");
  }

  const output = lines.join("\n");

  if (!dontLog) {
    console.info(output);
  }

  return output;
}
