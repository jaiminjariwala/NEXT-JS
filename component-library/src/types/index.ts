export type ComponentCodeLanguage = "typescript" | "javascript";
export type ShowcaseSource = "official" | "community";
export type ShowcasePreviewMode = "live" | "sandbox";
export type ShowcaseAssetType = "file" | "folder";

export interface ShowcaseAssetEntry {
  name: string;
  kind: string;
  path: string;
  type: ShowcaseAssetType;
  children?: ShowcaseAssetEntry[];
}

export interface ShowcaseCode {
  tsx: string;
  css: string;
  html?: string;
  js?: string;
  language?: ComponentCodeLanguage;
  sourcePath?: string;
}

export interface ComponentVersion {
  id: string;
  name: string;
  component: React.ComponentType;
  code: ShowcaseCode;
}

export interface ShowcaseItem {
  id: string;
  name: string;
  category: string;
  component: React.ComponentType;
  code: ShowcaseCode;
  assets?: ShowcaseAssetEntry[];
  hidePreview?: boolean;
  source?: ShowcaseSource;
  previewMode?: ShowcasePreviewMode;
  authorName?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string | null;
  slug?: string;
  status?: string;
  forkedFromId?: string | null;
  bookmarkCount?: number;
  viewerHasBookmarked?: boolean;
}

export interface CommunityComponentRow {
  id: string;
  slug: string;
  owner_id: string | null;
  name: string;
  category: string | null;
  author_name: string | null;
  description: string | null;
  language: ComponentCodeLanguage | null;
  tsx: string | null;
  js: string | null;
  html: string | null;
  css: string | null;
  status: string;
  forked_from_id: string | null;
  like_count: number | null;
  bookmark_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityComponentReactionRow {
  component_id: string;
  reaction_type: "like" | "bookmark";
}

export interface CommunityComponentVersionRow {
  id: string;
  component_id: string;
  owner_id: string | null;
  name: string;
  category: string | null;
  description: string | null;
  language: ComponentCodeLanguage | null;
  tsx: string | null;
  js: string | null;
  html: string | null;
  css: string | null;
  status: string;
  version_number: number;
  is_current: boolean;
  created_at: string;
}
