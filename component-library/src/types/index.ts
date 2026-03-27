export interface ComponentVersion {
  id: string;
  name: string;
  component: React.ComponentType;
  code: {
    tsx: string;
    css: string;
  };
}

export interface ShowcaseItem {
  id: string;
  name: string;
  category: string;
  component: React.ComponentType;
  code: {
    tsx: string;
    css: string;
  };
  hidePreview?: boolean;
}
