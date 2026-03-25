import { ShowcaseItem } from "@/types";

interface ComponentSize {
  id: string;
  width: number;
  height: number;
}

interface Position {
  id: string;
  position: { x: number; y: number };
}

type SizeMap = Record<string, { width: number; height: number }>;
type LayoutPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
type LayoutOptions = {
  padding?: Partial<LayoutPadding>;
  gap?: number;
  snap?: number;
};

const GRID_PADDING = {
  top: 104,
  right: 20,
  bottom: 20,
  left: 20,
};

const GRID_GAP = 10;
const GRID_SNAP = 4;

const resolveLayoutOptions = (options: LayoutOptions = {}) => {
  const padding: LayoutPadding = {
    ...GRID_PADDING,
    ...options.padding,
  };

  return {
    padding,
    gap: options.gap ?? GRID_GAP,
    snap: options.snap ?? GRID_SNAP,
  };
};

// Define estimated sizes for each component type
export const getComponentSize = (item: ShowcaseItem): { width: number; height: number } => {
  // Special cases for specific components
  const sizeMap: Record<string, { width: number; height: number }> = {
    'figma-canvas': { width: 350, height: 255 },
    'analog-clock-1': { width: 225, height: 225 },
    'date-calendar-1': { width: 180, height: 130 },
    'flip-calendar-1': { width: 225, height: 225 },
    'card-1': { width: 520, height: 380 },
    'folding-letters-1': { width: 476, height: 532 },
    'folder-1': { width: 285, height: 285 },
    'drawer-1': { width: 235, height: 235 },
    'code-modal-1': { width: 600, height: 450 },
    'search-modal-1': { width: 480, height: 400 },
    'navbar-1': { width: 750, height: 55 },
  };

  if (sizeMap[item.id]) {
    return sizeMap[item.id];
  }

  // Default sizes based on category
  switch (item.category) {
    case 'Clock':
      return { width: 225, height: 225 };
    case 'Calendar':
      return { width: 210, height: 180 };
    case 'Modal':
      return { width: 320, height: 225 };
    case 'Navigation':
      return { width: 525, height: 80 };
    case 'Card':
      return { width: 420, height: 300 };
    case 'Folder':
      return { width: 280, height: 280 };
    case 'Canvas':
      return { width: 350, height: 255 };
    case 'Drawer':
      return { width: 235, height: 235 };
    default:
      return { width: 225, height: 225 };
  }
};

const getResolvedComponentSize = (
  item: ShowcaseItem,
  measuredSizes: SizeMap
): { width: number; height: number } => {
  return measuredSizes[item.id] ?? getComponentSize(item);
};

export const organizeCanvasLayout = (
  items: ShowcaseItem[],
  viewportWidth: number = 1920
): Position[] => {
  const positions: Position[] = [];
  const padding = 40; // Padding from edges
  const gap = 30; // Gap between components
  
  // Get sizes for all components
  const componentSizes: ComponentSize[] = items.map(item => ({
    id: item.id,
    ...getComponentSize(item)
  }));

  // Sort components by height (tallest first) for better packing
  const sortedComponents = [...componentSizes].sort((a, b) => b.height - a.height);

  // Track rows
  interface Row {
    y: number;
    height: number;
    items: { id: string; x: number; width: number; height: number }[];
    remainingWidth: number;
  }

  const rows: Row[] = [];
  let currentY = padding;

  sortedComponents.forEach(component => {
    // Try to fit in existing rows first
    let placed = false;

    for (const row of rows) {
      // Check if component fits in this row
      if (component.width <= row.remainingWidth && component.height <= row.height) {
        // Calculate X position (after last item in row)
        const lastItem = row.items[row.items.length - 1];
        const x = lastItem ? lastItem.x + lastItem.width + gap : padding;

        row.items.push({
          id: component.id,
          x,
          width: component.width,
          height: component.height
        });

        row.remainingWidth -= (component.width + gap);
        placed = true;
        break;
      }
    }

    // If not placed, create a new row
    if (!placed) {
      const newRow: Row = {
        y: currentY,
        height: component.height,
        items: [{
          id: component.id,
          x: padding,
          width: component.width,
          height: component.height
        }],
        remainingWidth: viewportWidth - padding - component.width - gap - padding
      };

      rows.push(newRow);
      currentY += component.height + gap;
    }
  });

  // Convert rows to positions
  rows.forEach(row => {
    row.items.forEach(item => {
      positions.push({
        id: item.id,
        position: { x: item.x, y: row.y }
      });
    });
  });

  return positions;
};

// Grid-based layout - FIXED VERSION
export const organizeGridLayout = (
  items: ShowcaseItem[],
  viewportWidth: number = 1920,
  measuredSizes: SizeMap = {},
  options: LayoutOptions = {}
): Position[] => {
  const positions: Position[] = [];
  const { padding, gap, snap } = resolveLayoutOptions(options);

  if (!items.length) {
    return positions;
  }

  const availableWidth = Math.max(
    viewportWidth - padding.left - padding.right,
    snap
  );
  const laneCount = Math.max(1, Math.floor(availableWidth / snap));
  const laneHeights = Array(laneCount).fill(padding.top);

  items.forEach((item) => {
    const size = getResolvedComponentSize(item, measuredSizes);
    const span = Math.min(
      laneCount,
      Math.max(1, Math.ceil((size.width + gap) / snap))
    );

    let bestLane = 0;
    let bestY = Number.POSITIVE_INFINITY;

    for (let start = 0; start <= laneCount - span; start += 1) {
      const y = Math.max(...laneHeights.slice(start, start + span));

      if (y < bestY || (y === bestY && start < bestLane)) {
        bestY = y;
        bestLane = start;
      }
    }

    const x = padding.left + bestLane * snap;

    positions.push({
      id: item.id,
      position: {
        x: Math.round(x),
        y: Math.round(bestY),
      },
    });

    const nextHeight = bestY + size.height + gap;
    for (let lane = bestLane; lane < bestLane + span; lane += 1) {
      laneHeights[lane] = nextHeight;
    }
  });

  return positions;
};

// Smart layout that groups by category
export const organizeCategoryLayout = (
  items: ShowcaseItem[],
  viewportWidth: number = 1920
): Position[] => {
  const positions: Position[] = [];
  const padding = 40;
  const gap = 30;
  const categoryGap = 80; // Extra space between categories
  
  // Group items by category
  const categories = new Map<string, ShowcaseItem[]>();
  items.forEach(item => {
    if (!categories.has(item.category)) {
      categories.set(item.category, []);
    }
    categories.get(item.category)!.push(item);
  });

  let currentY = padding;

  // Layout each category
  categories.forEach((categoryItems) => {
    let currentX = padding;
    let rowMaxHeight = 0;
    const maxRowWidth = viewportWidth - padding * 2;

    categoryItems.forEach(item => {
      const size = getComponentSize(item);

      // Check if we need to wrap to next row
      if (currentX + size.width > maxRowWidth && currentX > padding) {
        currentX = padding;
        currentY += rowMaxHeight + gap;
        rowMaxHeight = 0;
      }

      positions.push({
        id: item.id,
        position: { x: currentX, y: currentY }
      });

      currentX += size.width + gap;
      rowMaxHeight = Math.max(rowMaxHeight, size.height);
    });

    // Move to next category
    currentY += rowMaxHeight + categoryGap;
  });

  return positions;
};
