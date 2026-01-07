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

const STYLES: LineStyle[] = ["light", "heavy", "double", "dashed", "dashed-heavy"];

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
  dontLog?: boolean;
  startWithNewLine?: boolean;
}

export function logRects(
  rectangles: Rectangle[],
  { sizePerPoint = 10, showLegend = true, dontLog = false, startWithNewLine = true }: LogRectsOptions = {}
): string {
  if (rectangles.length === 0) {
    return "No rectangles to draw";
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
  const gridWidth = Math.ceil((maxX - minX) / sizePerPoint);
  const gridHeight = Math.ceil((maxY - minY) / sizePerPoint);

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
  rectangles.forEach((rect, zIndex) => {
    const startCol = Math.floor((rect.x - minX) / sizePerPoint);
    const startRow = Math.floor((rect.y - minY) / sizePerPoint);
    const endCol = Math.ceil((rect.x + rect.width - minX) / sizePerPoint) - 1;
    const endRow = Math.ceil((rect.y + rect.height - minY) / sizePerPoint) - 1;

    // Draw the four edges
    drawHorizontal(startRow, startCol, endCol, zIndex);
    drawHorizontal(endRow, startCol, endCol, zIndex);
    drawVertical(startCol, startRow, endRow, zIndex);
    drawVertical(endCol, startRow, endRow, zIndex);

    // Place index at center of top edge if there's room
    const indexStr = String(zIndex);
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
          if (!existing || zIndex >= existing.zIndex) {
            indexGrid[startRow][col] = { char: indexStr[i], zIndex };
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
