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

// Define estimated sizes for each component type
const getComponentSize = (item: ShowcaseItem): { width: number; height: number } => {
  // Special cases for specific components
  const sizeMap: Record<string, { width: number; height: number }> = {
    'code-modal-1': { width: 600, height: 450 },
    'search-modal-1': { width: 480, height: 400 },
    'navbar-1': { width: 750, height: 55 },
    'card-1': { width: 500, height: 340 },
    'folder-1': { width: 155, height: 155 },
  };

  if (sizeMap[item.id]) {
    return sizeMap[item.id];
  }

  // Default sizes based on category
  switch (item.category) {
    case 'Clock':
      return { width: 240, height: 240 };
    case 'Calendar':
      return { width: 215, height: 240 };
    case 'Modal':
      return { width: 400, height: 270 };
    case 'Navigation':
      return { width: 600, height: 55 };
    case 'Card':
      return { width: 480, height: 310 };
    case 'Folder':
      return { width: 155, height: 155 };
    default:
      return { width: 240, height: 240 };
  }
};

export const organizeCanvasLayout = (
  items: ShowcaseItem[],
  viewportWidth: number = 1920,
  viewportHeight: number = 1080
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
  viewportHeight: number = 1080
): Position[] => {
  const positions: Position[] = [];
  const padding = 5;
  const gap = 5;
  
  let currentX = padding;
  let currentY = padding;
  let rowMaxHeight = 0;

  console.log('🎯 Starting layout with viewport width:', viewportWidth);

  items.forEach((item, index) => {
    const size = getComponentSize(item);
    
    // Check if this component will fit in the current row
    // The component needs to fit COMPLETELY within the viewport
    const willFit = (currentX + size.width) <= viewportWidth;
    
    console.log(`📦 Item ${index} (${item.id}):`, {
      size,
      currentX,
      'currentX + width': currentX + size.width,
      viewportWidth,
      willFit
    });

    // If it won't fit and we're not at the start of a row, move to next row
    if (!willFit && currentX > padding) {
      console.log('⬇️ Moving to next row');
      currentX = padding;
      currentY += rowMaxHeight + gap;
      rowMaxHeight = 0;
    }

    positions.push({
      id: item.id,
      position: { x: currentX, y: currentY }
    });

    console.log(`✅ Placed at (${currentX}, ${currentY})`);

    currentX += size.width + gap;
    rowMaxHeight = Math.max(rowMaxHeight, size.height);
  });

  console.log('🏁 Final positions:', positions);
  return positions;
};

// Smart layout that groups by category
export const organizeCategoryLayout = (
  items: ShowcaseItem[],
  viewportWidth: number = 1920,
  viewportHeight: number = 1080
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
  categories.forEach((categoryItems, categoryName) => {
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
