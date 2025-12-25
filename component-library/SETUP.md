# Component Library Project

## 🚀 Setup Complete!

Your Next.js + TypeScript component library is ready to go!

## 📦 Install Required Dependencies

Run this command to install the necessary packages:

```bash
npm install framer-motion lucide-react
```

## 🏃 Run the Project

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with layout
│   └── globals.css       # Global styles
├── components/
│   ├── Navbar/           # Vertical left sidebar
│   ├── Canvas/           # Figma-style draggable canvas
│   ├── ComponentCard/    # Individual draggable component cards
│   ├── CodeModal/        # Modal showing code with copy button
│   └── library/          # Your UI components
│       └── Button/       # Example Button component
├── data/
│   └── componentsData.ts # Component registry
└── types/
    └── index.ts          # TypeScript type definitions
```

## ✨ Features

- **Vertical Left Navbar**: Navigation sidebar with icons
- **Draggable Canvas**: Figma-style workspace with grid background
- **Component Cards**: Each card shows a preview of the component
- **Code Modal**: Click any card to see its code with syntax highlighting
- **Copy to Clipboard**: One-click code copying

## 🎯 How to Add New Components

1. Create a new component in `src/components/library/YourComponent/`
2. Add it to `src/data/componentsData.ts`
3. It will automatically appear on the canvas!

Example:
```typescript
{
  id: 'your-component-1',
  name: 'YourComponent',
  category: 'Category',
  description: 'Component description',
  code: '// your code here',
  component: YourComponent
}
```

## 🛠️ Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Drag and drop animations
- **Lucide React** - Icons

Enjoy building your component library! 🎨
