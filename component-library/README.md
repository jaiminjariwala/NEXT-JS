# Component Showcase Library

A Figma-style draggable component showcase with zoom and pan capabilities.

## 🚀 Quick Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✨ Features

### 1. **Smooth Dragging**
- Desktop: Click and drag
- Mobile: Long-press (200ms) then drag
- Visual feedback with ring effect

### 2. **Zoom & Pan (Figma-style)**
- **Zoom**: Ctrl/Cmd + Scroll or use zoom controls
- **Pan**: Shift + Drag or Middle Mouse Button
- **Reset**: Click reset button
- Scale range: 10% - 300%

### 3. **Code Modal**
- Frosted glass blur background (Apple-style)
- Smaller, centered modal (75% height, max-width 3xl)
- Tabs for TSX and CSS code
- Copy to clipboard

### 4. **Responsive**
- Mobile: Vertical stack
- Desktop: Grid layout

## 📁 Project Structure

```
src/
├── components/
│   ├── showcase/          # Your components go here
│   │   └── Clock/         # Example: Analog Clock
│   ├── DraggableItem/     # Makes components draggable
│   ├── Canvas/            # Main canvas with zoom/pan
│   ├── CodeModal/         # Shows code with blur effect
│   └── Navbar/            # Left sidebar
├── data/
│   └── componentsData.ts  # Register components
└── types/
    └── index.ts           # TypeScript types
```

## 🎯 How to Add Your Component

### Step 1: Create Component

```tsx
// src/components/showcase/MyComponent/MyComponent.tsx
'use client';
import './MyComponent.css';

export const MyComponent = () => {
  return <div className="my-component">Hello!</div>;
};
```

### Step 2: Register in Data

```tsx
// src/data/componentsData.ts
import { MyComponent } from '@/components/showcase/MyComponent/MyComponent';

export const showcaseItems: ShowcaseItem[] = [
  {
    id: 'my-component-1',
    name: 'My Component',
    category: 'UI',
    component: MyComponent,
    code: {
      tsx: `// Your TSX code here`,
      css: `/* Your CSS code here */`
    }
  }
];
```

### Step 3: Done! 🎉

## 🎮 Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| **Drag Item** | Click + Drag | Long-press + Drag |
| **View Code** | Click | Tap |
| **Zoom In/Out** | Ctrl/Cmd + Scroll | Zoom buttons |
| **Pan Canvas** | Shift + Drag | - |
| **Reset View** | Reset button | Reset button |

## 🎨 Current Components

- **Analog Clock**: iOS-style clock with smooth animations

## 🔧 Optimizations

- Removed unused components (ComponentCard, library/Button)
- Simplified drag logic
- Optimized re-renders
- Clean, maintainable code structure

Enjoy! 🚀
