"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import MonacoEditor, {
  type BeforeMount as MonacoBeforeMount,
  type OnMount as MonacoOnMount,
} from "@monaco-editor/react";
import * as LucideIcons from "lucide-react";
import * as THREE from "three";
import { Canvas as FiberCanvas, useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { LiveError, LivePreview, LiveProvider } from "react-live";
import { createPortal } from "react-dom";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { showcaseItems as officialShowcaseItems } from "@/data/componentsData";
import { AnalogClock } from "@/components/library/Clock/AnalogClock/AnalogClock";
import { DateCalendar } from "@/components/library/Calendar/DateCalendar/DateCalendar";
import { CommunitySandboxPreview } from "./CommunitySandboxPreview";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapCommunityRowToShowcaseItem } from "@/lib/community-components";
import type { Session } from "@supabase/supabase-js";
import type {
  CommunityComponentRow,
  CommunityComponentReactionRow,
  CommunityComponentVersionRow,
  ComponentCodeLanguage,
  ShowcaseItem,
} from "@/types";
import workspaceStyles from "./LibraryWorkspace.module.css";

const codeFontFamily =
  '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace';
const geistMono = Geist_Mono({ subsets: ["latin"] });
const codeEditorPaddingTop = 72;
const codeEditorPaddingBottom = 28;
const monacoThemeName = "component-library-light";
const defaultSelectedItemId = "contact-page-1";
const DEFAULT_SIDEBAR_WIDTH = 220;
const MIN_SIDEBAR_WIDTH = 170;
const SIDEBAR_COLLAPSE_THRESHOLD = 96;
const DEFAULT_CODE_PANEL_WIDTH = 540;
const MIN_PREVIEW_PANEL_WIDTH = 360;
const MIN_CODE_PANEL_WIDTH = 400;
const RESIZE_HANDLE_WIDTH = 1;
const baseCommunityComponentSelect =
  "id, slug, owner_id, name, category, author_name, description, language, tsx, js, html, css, status, created_at, updated_at";
const extendedCommunityComponentSelect = `${baseCommunityComponentSelect}, forked_from_id, like_count, bookmark_count`;
const defaultSelectedItem =
  officialShowcaseItems.find((item) => item.id === defaultSelectedItemId) ??
  officialShowcaseItems[0];

const { Bookmark, ChevronRight, GitFork, Heart, Search } = LucideIcons;

type CodeTabId = "tsx" | "css" | "html" | "js";

type CodeTab = {
  id: CodeTabId;
  label: string;
  language: "typescript" | "javascript" | "css" | "html";
  extension: string;
  value: string;
};

type EditableCodeSegments = Partial<Record<CodeTabId, string>>;
type AuthMode = "sign-in" | "sign-up";
type ComponentStatus = "draft" | "published";
type ComponentComposerMode = "react" | "html";

type ComponentComposerState = {
  name: string;
  slug: string;
  category: string;
  description: string;
  mode: ComponentComposerMode;
  language: ComponentCodeLanguage;
  tsx: string;
  js: string;
  html: string;
  css: string;
  status: ComponentStatus;
};

const secondaryButtonClassName =
  "flex items-center rounded-lg border border-black/8 bg-[#F5F5F5] px-2 py-[5px] text-[15px] leading-[1.1] font-normal text-black transition-all duration-200 hover:bg-white active:scale-95";
const sidebarActionButtonClassName =
  secondaryButtonClassName;

function formatRelativeDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function matchesSidebarQuery(item: ShowcaseItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [item.name, item.category, item.authorName, item.description, item.status]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalizedQuery));
}

function isMissingCommunityFeatureSchemaError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";

  return /forked_from_id|like_count|bookmark_count|community_component_versions|community_component_reactions/i.test(
    message
  );
}

function slugifyComponentName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function getDefaultComponentSource(language: ComponentCodeLanguage) {
  if (language === "javascript") {
    return `export default function CommunityCard() {
  return (
    <div
      style={{
        width: 280,
        padding: 24,
        borderRadius: 24,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
        Community Component
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: "#111827" }}>
        Community Card
      </div>
      <div style={{ fontSize: 16, color: "#4b5563", marginTop: 10 }}>
        Built from the library workspace.
      </div>
    </div>
  );
}`;
  }

  return `export default function CommunityCard() {
  return (
    <div
      style={{
        width: 280,
        padding: 24,
        borderRadius: 24,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
        Community Component
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: "#111827" }}>
        Community Card
      </div>
      <div style={{ fontSize: 16, color: "#4b5563", marginTop: 10 }}>
        Built from the library workspace.
      </div>
    </div>
  );
}`;
}

function getDefaultHtmlMarkup() {
  return `<section class="community-card">
  <div class="community-card__eyebrow">Community Component</div>
  <h1 class="community-card__title">Community Card</h1>
  <p class="community-card__body">Built from the library workspace.</p>
</section>`;
}

function getDefaultHtmlCss() {
  return `.community-card {
  width: 280px;
  padding: 24px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  font-family: system-ui, sans-serif;
}

.community-card__eyebrow {
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
}

.community-card__title {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
  color: #111827;
}

.community-card__body {
  margin: 10px 0 0;
  font-size: 16px;
  color: #4b5563;
}`;
}

function createInitialComposerState(): ComponentComposerState {
  return {
    name: "",
    slug: "",
    category: "Card",
    description: "",
    mode: "react",
    language: "typescript",
    tsx: getDefaultComponentSource("typescript"),
    js: "",
    html: getDefaultHtmlMarkup(),
    css: "",
    status: "draft",
  };
}

function getCommunityRowId(itemId: string) {
  return itemId.startsWith("community-") ? itemId.slice("community-".length) : itemId;
}

function isBenignBrowserRuntimeError(value: unknown) {
  if (!value || typeof value !== "object") return false;

  const candidate = value as { name?: string; message?: string };
  const name = candidate.name || "";
  const message = candidate.message || "";

  if (
    name === "NotAllowedError" &&
    /not allowed by the user agent|denied permission|current context/i.test(message)
  ) {
    return true;
  }

  if (name === "Canceled" || message === "Canceled") {
    return true;
  }

  return false;
}

function flattenConsoleArgs(args: unknown[]): string {
  return args
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry instanceof Error) return `${entry.name}: ${entry.message}`;
      if (entry && typeof entry === "object") {
        const candidate = entry as { name?: string; message?: string };
        return [candidate.name, candidate.message].filter(Boolean).join(": ");
      }
      return String(entry ?? "");
    })
    .join(" ");
}

function isBenignBrowserConsoleError(args: unknown[]) {
  const message = flattenConsoleArgs(args);

  if (
    /NotAllowedError/i.test(message) &&
    /not allowed by the user agent|denied permission|current context/i.test(message)
  ) {
    return true;
  }

  if (/\bCanceled\b/.test(message)) {
    return true;
  }

  return false;
}

function createComposerStateFromItem(item: ShowcaseItem): ComponentComposerState {
  const language = item.code.language || "typescript";
  const mode = item.code.html?.trim() ? "html" : "react";
  return {
    name: item.name,
    slug: item.slug || slugifyComponentName(item.name),
    category: item.category,
    description: item.description || "",
    mode,
    language,
    tsx:
      item.code.tsx ||
      (mode === "react" && language === "typescript"
        ? getDefaultComponentSource("typescript")
        : ""),
    js:
      item.code.js ||
      (mode === "react" && language === "javascript"
        ? getDefaultComponentSource("javascript")
        : ""),
    html: item.code.html || getDefaultHtmlMarkup(),
    css: item.code.css || (mode === "html" ? getDefaultHtmlCss() : ""),
    status: (item.status as ComponentStatus) || "draft",
  };
}

function getComposerCodeTabs(state: ComponentComposerState): CodeTab[] {
  if (state.mode === "html") {
    return [
      {
        id: "html",
        label: "html",
        language: "html",
        extension: "html",
        value: state.html,
      },
      {
        id: "css",
        label: "css",
        language: "css",
        extension: "css",
        value: state.css,
      },
      {
        id: "js",
        label: "js",
        language: "javascript",
        extension: "js",
        value: state.js,
      },
    ];
  }

  return [
    {
      id: state.language === "javascript" ? "js" : "tsx",
      label: state.language === "javascript" ? "js" : "tsx",
      language: state.language === "javascript" ? "javascript" : "typescript",
      extension: state.language === "javascript" ? "jsx" : "tsx",
      value: state.language === "javascript" ? state.js : state.tsx,
    },
    {
      id: "css",
      label: "css",
      language: "css",
      extension: "css",
      value: state.css,
    },
  ];
}

function PreviewNavbar() {
  return null;
}

function usePreviewContactDraft() {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState([]);

  return {
    message,
    setMessage,
    attachments,
    setAttachments,
  };
}

function Short_Stack() {
  return { className: "" };
}

const livePreviewScope = {
  ...React,
  React,
  Navbar: PreviewNavbar,
  Short_Stack,
  useContactDraft: usePreviewContactDraft,
  AnalogClock,
  DateCalendar,
  ...LucideIcons,
  Image,
  THREE,
  Canvas: FiberCanvas,
  useFrame,
  useThree,
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  MeshLineGeometry,
  MeshLineMaterial,
  createPortal,
  showcaseItems: officialShowcaseItems,
};

function stripClientDirective(tsx: string): string {
  return tsx
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        !trimmed.startsWith("'use client'") &&
        !trimmed.startsWith('"use client"')
      );
    })
    .join("\n");
}

function stripImports(tsx: string): string {
  let isInsideImportBlock = false;

  return tsx
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();

      if (!isInsideImportBlock && !trimmed.startsWith("import ")) {
        return true;
      }

      if (trimmed.startsWith("import ")) {
        const endsInline =
          trimmed.endsWith(";") ||
          (trimmed.includes(" from ") && /['"]/.test(trimmed));

        if (!endsInline) {
          isInsideImportBlock = true;
        }

        return false;
      }

      if (isInsideImportBlock) {
        if (
          trimmed.endsWith(";") ||
          (trimmed.includes(" from ") && /['"]/.test(trimmed))
        ) {
          isInsideImportBlock = false;
        }

        return false;
      }

      return true;
    })
    .join("\n");
}

function findRenderTarget(tsx: string): string | null {
  const namedDefaultExport = tsx.match(
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/
  );
  if (namedDefaultExport) return namedDefaultExport[1];

  const namedExports = [
    ...tsx.matchAll(/export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)/g),
  ];
  if (namedExports.length > 0) {
    return namedExports[namedExports.length - 1][1];
  }

  const localDeclarations = [
    ...tsx.matchAll(/(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)/g),
  ];
  return localDeclarations.length > 0
    ? localDeclarations[localDeclarations.length - 1][1]
    : null;
}

function getDeclaredIdentifiers(tsx: string): string[] {
  return [
    ...tsx.matchAll(
      /(?:^|\n)\s*(?:export\s+)?(?:const|function|class)\s+([A-Za-z_][A-Za-z0-9_]*)/g
    ),
  ].map((match) => match[1]);
}

function buildLivePreviewCode(tsx: string): string | null {
  const sanitizedTsx = stripImports(stripClientDirective(tsx));
  const normalizedTsx = sanitizedTsx
    .replace(/export\s+default\s+function\s+/g, "function ")
    .replace(/export\s+default\s+class\s+/g, "class ")
    .replace(/export\s+default\s+/g, "const __DefaultExport__ = ")
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+function\s+/g, "function ")
    .replace(/export\s+class\s+/g, "class ")
    .replace(/export\s+interface\s+/g, "interface ")
    .replace(/export\s+type\s+/g, "type ")
    .replace(/export\s+\{[^}]*\};?/g, "");

  const renderTarget = normalizedTsx.includes("__DefaultExport__")
    ? "__DefaultExport__"
    : findRenderTarget(normalizedTsx);

  if (!renderTarget) return null;

  return `${normalizedTsx}\nrender(<${renderTarget} />);`;
}

function hasStandaloneCss(css = ""): boolean {
  const trimmed = css.trim();
  if (!trimmed) return false;

  return (
    !trimmed.startsWith("/* No external CSS needed") &&
    !trimmed.startsWith("/* Styling is included inside the component")
  );
}

function getDefaultCodeTabId(code: ShowcaseItem["code"]): CodeTabId {
  if (code.html?.trim()) return "html";
  if (code.tsx?.trim()) return "tsx";
  if (code.js?.trim()) return "js";
  return "css";
}

function buildEditableCodeSegments(
  code: ShowcaseItem["code"],
  primarySource: string
): EditableCodeSegments {
  const segments: EditableCodeSegments = {};

  if (code.html?.trim()) segments.html = code.html;
  if (code.tsx?.trim() || primarySource.trim()) segments.tsx = primarySource;
  if (code.js?.trim()) segments.js = code.js;
  if (code.css.trim()) segments.css = code.css;

  return segments;
}

function buildCodeTabs(
  code: ShowcaseItem["code"],
  primarySource: string
): CodeTab[] {
  const tabs: CodeTab[] = [];

  if (code.html?.trim()) {
    tabs.push({
      id: "html",
      label: "html",
      language: "html",
      extension: "html",
      value: code.html,
    });
  }

  if (code.tsx?.trim() || primarySource.trim()) {
    tabs.push({
      id: "tsx",
      label: code.language === "javascript" ? "js" : "tsx",
      language: code.language === "javascript" ? "javascript" : "typescript",
      extension: code.language === "javascript" ? "jsx" : "tsx",
      value: primarySource,
    });
  }

  if (code.js?.trim()) {
    tabs.push({
      id: "js",
      label: "js",
      language: "javascript",
      extension: "js",
      value: code.js,
    });
  }

  if (hasStandaloneCss(code.css)) {
    tabs.push({
      id: "css",
      label: "css",
      language: "css",
      extension: "css",
      value: code.css,
    });
  }

  return tabs;
}

function getPreviewScale(itemId: string, previewPanelWidth = 0): number {
  switch (itemId) {
    case "card-v1":
      return 0.58;
    case "figma-canvas":
      if (!previewPanelWidth) return 1;
      return Math.min(Math.max((previewPanelWidth - 48) / 480, 0.62), 1.35);
    case "contact-page-1":
    case "hire-me-lanyard-1":
      return 1;
    default:
      return 0.7;
  }
}

function getPreviewFrameStyle(itemId: string): React.CSSProperties | undefined {
  switch (itemId) {
    case "hire-me-lanyard-1":
      return {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 560,
        height: 600,
        borderRadius: 28,
        background: "#ffffff",
        boxSizing: "border-box",
        ["--hire-r3f-width" as string]: "560px",
      };
    default:
      return undefined;
  }
}

export function LibraryWorkspace() {
  const [publishedCommunityItems, setPublishedCommunityItems] = useState<ShowcaseItem[]>(
    []
  );
  const [ownedCommunityItems, setOwnedCommunityItems] = useState<ShowcaseItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthHydrating, setIsAuthHydrating] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerState, setComposerState] = useState<ComponentComposerState>(
    createInitialComposerState
  );
  const [composerActiveCodeTabId, setComposerActiveCodeTabId] = useState<CodeTabId>("tsx");
  const [composerTargetItem, setComposerTargetItem] = useState<ShowcaseItem | null>(null);
  const [composerForkSourceId, setComposerForkSourceId] = useState<string | null>(null);
  const [composerError, setComposerError] = useState("");
  const [isSavingComponent, setIsSavingComponent] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState<"all" | "official" | "mine" | "community">(
    "all"
  );
  const [isSidebarSearchOpen, setIsSidebarSearchOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(defaultSelectedItemId);
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeCodeTabId, setActiveCodeTabId] = useState<CodeTabId>(() =>
    getDefaultCodeTabId(defaultSelectedItem.code)
  );
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingPanels, setIsResizingPanels] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [codePanelWidth, setCodePanelWidth] = useState(DEFAULT_CODE_PANEL_WIDTH);
  const [editedCodeSegments, setEditedCodeSegments] = useState<EditableCodeSegments>(
    () => buildEditableCodeSegments(defaultSelectedItem.code, defaultSelectedItem.code.tsx)
  );
  const [isPersistingEditedCode, setIsPersistingEditedCode] = useState(false);
  const [isTogglingReaction, setIsTogglingReaction] = useState<"" | "like" | "bookmark">("");
  const [isForkingComponent, setIsForkingComponent] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<"" | "saved">("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoadingVersionHistory, setIsLoadingVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<CommunityComponentVersionRow[]>([]);
  const [versionHistoryError, setVersionHistoryError] = useState("");
  const [isRestoringVersion, setIsRestoringVersion] = useState<string | null>(null);
  const [fetchedCodeTsx, setFetchedCodeTsx] = useState<string | null>(
    defaultSelectedItem.code.sourcePath ? null : defaultSelectedItem.code.tsx
  );
  const [sourceLoadError, setSourceLoadError] = useState(false);
  const [previewPanelWidth, setPreviewPanelWidth] = useState(0);
  const [supportsCommunityFeatureSchema, setSupportsCommunityFeatureSchema] = useState(true);

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const contentPanelsRef = useRef<HTMLDivElement | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const monacoEditorRef = useRef<Parameters<MonacoOnMount>[0] | null>(null);
  const sidebarResizeStartRef = useRef({
    pointerX: 0,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  });
  const resizeStartRef = useRef({
    pointerX: 0,
    codePanelWidth: DEFAULT_CODE_PANEL_WIDTH,
  });

  const currentUserId = session?.user.id ?? null;
  const communityItems = useMemo(() => {
    if (!currentUserId) return publishedCommunityItems;

    const ownedIds = new Set(ownedCommunityItems.map((item) => item.id));
    return publishedCommunityItems.filter((item) => !ownedIds.has(item.id));
  }, [currentUserId, ownedCommunityItems, publishedCommunityItems]);
  const allShowcaseItems = useMemo(
    () => [...officialShowcaseItems, ...ownedCommunityItems, ...communityItems],
    [communityItems, ownedCommunityItems]
  );
  const filteredOfficialItems = useMemo(
    () =>
      officialShowcaseItems.filter(
        (item) =>
          (sidebarFilter === "all" || sidebarFilter === "official") &&
          matchesSidebarQuery(item, sidebarQuery)
      ),
    [sidebarFilter, sidebarQuery]
  );
  const filteredOwnedItems = useMemo(
    () =>
      ownedCommunityItems.filter(
        (item) =>
          (sidebarFilter === "all" || sidebarFilter === "mine") &&
          matchesSidebarQuery(item, sidebarQuery)
      ),
    [ownedCommunityItems, sidebarFilter, sidebarQuery]
  );
  const filteredCommunityItems = useMemo(
    () =>
      communityItems.filter(
        (item) =>
          (sidebarFilter === "all" || sidebarFilter === "community") &&
          matchesSidebarQuery(item, sidebarQuery)
      ),
    [communityItems, sidebarFilter, sidebarQuery]
  );

  const selectedItem = useMemo<ShowcaseItem>(() => {
    return (
      allShowcaseItems.find((item) => item.id === selectedItemId) ??
      allShowcaseItems[0] ??
      defaultSelectedItem
    );
  }, [allShowcaseItems, selectedItemId]);
  const isOwnedCommunityItem =
    selectedItem.source === "community" &&
    Boolean(currentUserId) &&
    selectedItem.ownerId === currentUserId;
  const isSearchActive = Boolean(sidebarQuery.trim()) || sidebarFilter !== "all";
  const selectedItemUpdatedLabel = formatRelativeDate(selectedItem.updatedAt);

  const isSandboxPreview = selectedItem.previewMode === "sandbox";
  const displayComponent =
    selectedItem.hidePreview || isSandboxPreview ? null : selectedItem.component;
  const hasExternalSource = Boolean(selectedItem.code.sourcePath);
  const isSourceLoading =
    hasExternalSource && fetchedCodeTsx === null && !sourceLoadError;
  const hasFullSource =
    !hasExternalSource || (!!fetchedCodeTsx && !sourceLoadError);
  const displayPrimaryCode = isSourceLoading
    ? "// Loading full source..."
    : sourceLoadError
      ? "// Unable to load full source."
      : fetchedCodeTsx ?? selectedItem.code.tsx;
  const availableCodeTabs = useMemo(
    () => buildCodeTabs(selectedItem.code, displayPrimaryCode),
    [displayPrimaryCode, selectedItem.code]
  );
  const activeCodeTab = useMemo(
    () => availableCodeTabs.find((tab) => tab.id === activeCodeTabId) ?? availableCodeTabs[0],
    [activeCodeTabId, availableCodeTabs]
  );
  const baseEditableCodeSegments = useMemo(
    () => buildEditableCodeSegments(selectedItem.code, displayPrimaryCode),
    [displayPrimaryCode, selectedItem.code]
  );
  const displayedCodeSegments = useMemo(
    () =>
      isEditMode
        ? {
            ...baseEditableCodeSegments,
            ...editedCodeSegments,
          }
        : baseEditableCodeSegments,
    [baseEditableCodeSegments, editedCodeSegments, isEditMode]
  );
  const activeCodeValue = activeCodeTab
    ? displayedCodeSegments[activeCodeTab.id] ?? activeCodeTab.value
    : "";
  const previewScale = getPreviewScale(selectedItem.id, previewPanelWidth);
  const previewFrameStyle = getPreviewFrameStyle(selectedItem.id);
  const previewContentStyle =
    selectedItem.id === "hire-me-lanyard-1"
      ? ({
          ["--preview-scale" as string]: 1,
          ["--preview-content-width" as string]: "100%",
          ["--preview-content-height" as string]: "100%",
          ["--hire-r3f-width" as string]: "100%",
          ["--hire-r3f-height" as string]: "100%",
        } as React.CSSProperties)
      : selectedItem.id === "contact-page-1"
        ? ({
            ["--preview-scale" as string]: 1,
            ["--preview-content-width" as string]: "100%",
          } as React.CSSProperties)
      : ({ ["--preview-scale" as string]: previewScale } as React.CSSProperties);
  const livePreviewCode = useMemo(
    () => buildLivePreviewCode((displayedCodeSegments.tsx ?? displayPrimaryCode).trim()),
    [displayPrimaryCode, displayedCodeSegments.tsx]
  );
  const livePreviewDeclaredIdentifiers = useMemo(
    () =>
      new Set(
        getDeclaredIdentifiers((displayedCodeSegments.tsx ?? displayPrimaryCode).trim())
      ),
    [displayPrimaryCode, displayedCodeSegments.tsx]
  );
  const livePreviewCss = isEditMode
    ? displayedCodeSegments.css ?? selectedItem.code.css
    : selectedItem.code.css;
  const livePreviewRuntimeScope = useMemo(
    () => {
      const scope: Record<string, unknown> = {
        ...livePreviewScope,
        PreviewComponent: displayComponent,
      };

      livePreviewDeclaredIdentifiers.forEach((identifier) => {
        delete scope[identifier];
      });

      return scope;
    },
    [displayComponent, livePreviewDeclaredIdentifiers]
  );
  const monacoModelPath = activeCodeTab
    ? `${selectedItem.id}.${activeCodeTab.extension}`
    : `${selectedItem.id}.tsx`;
  const sandboxPreviewCode = useMemo(
    () => ({
      tsx: displayedCodeSegments.tsx ?? displayPrimaryCode,
      css: displayedCodeSegments.css ?? selectedItem.code.css,
      html: displayedCodeSegments.html ?? selectedItem.code.html,
      js: displayedCodeSegments.js ?? selectedItem.code.js,
      language: selectedItem.code.language,
    }),
    [
      displayPrimaryCode,
      displayedCodeSegments.css,
      displayedCodeSegments.html,
      displayedCodeSegments.js,
      displayedCodeSegments.tsx,
      selectedItem.code.css,
      selectedItem.code.html,
      selectedItem.code.js,
      selectedItem.code.language,
    ]
  );
  const hasEditableCodeChanges = useMemo(
    () =>
      ["tsx", "css", "html", "js"].some((key) => {
        const segmentKey = key as CodeTabId;
        return (
          (displayedCodeSegments[segmentKey] ?? "") !==
          (baseEditableCodeSegments[segmentKey] ?? "")
        );
      }),
    [baseEditableCodeSegments, displayedCodeSegments]
  );
  const codeEditorOptions = useMemo(
    () => ({
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: "on" as const,
      lineNumbersMinChars: 3,
      glyphMargin: false,
      folding: false,
      renderLineHighlight: "none" as const,
      scrollBeyondLastLine: false,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      fontFamily: codeFontFamily,
      fontSize: 14,
      lineHeight: 26,
      wordWrap: "off" as const,
      tabSize: 2,
      insertSpaces: true,
      stickyScroll: { enabled: false },
      padding: {
        top: codeEditorPaddingTop,
        bottom: codeEditorPaddingBottom,
      },
      readOnly: !isEditMode,
      domReadOnly: !isEditMode,
      readOnlyMessage: { value: "" },
      renderValidationDecorations: "off" as const,
      quickSuggestions: isEditMode,
      contextmenu: isEditMode,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    }),
    [isEditMode]
  );
  const composerCodeTabs = useMemo(
    () => getComposerCodeTabs(composerState),
    [composerState]
  );
  const activeComposerCodeTab = useMemo(
    () =>
      composerCodeTabs.find((tab) => tab.id === composerActiveCodeTabId) ??
      composerCodeTabs[0],
    [composerActiveCodeTabId, composerCodeTabs]
  );

  const refreshCommunityItems = useCallback(
    async (activeSession: Session | null) => {
      const supabaseClient = getSupabaseBrowserClient();
      if (!supabaseClient) {
        setPublishedCommunityItems([]);
        setOwnedCommunityItems([]);
        return;
      }

      const fetchCommunityData = async (
        selectColumns: string,
        includeReactions: boolean
      ) => {
        const [publishedResult, ownedResult, reactionResult] = await Promise.all([
          supabaseClient
            .from("community_components")
            .select(selectColumns)
            .eq("status", "published")
            .order("created_at", { ascending: false }),
          activeSession?.user.id
            ? supabaseClient
                .from("community_components")
                .select(selectColumns)
                .eq("owner_id", activeSession.user.id)
                .order("updated_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          activeSession?.user.id && includeReactions
            ? supabaseClient
                .from("community_component_reactions")
                .select("component_id, reaction_type")
                .eq("user_id", activeSession.user.id)
            : Promise.resolve({ data: [], error: null }),
        ]);

        return {
          publishedRows: (publishedResult.data as CommunityComponentRow[] | null) ?? [],
          publishedError: publishedResult.error,
          ownedRows: (ownedResult.data as CommunityComponentRow[] | null) ?? [],
          ownedError: ownedResult.error,
          reactionRows:
            (reactionResult.data as CommunityComponentReactionRow[] | null) ?? [],
          reactionError: reactionResult.error,
        };
      };

      let communityData = await fetchCommunityData(
        supportsCommunityFeatureSchema
          ? extendedCommunityComponentSelect
          : baseCommunityComponentSelect,
        supportsCommunityFeatureSchema
      );

      if (
        supportsCommunityFeatureSchema &&
        (isMissingCommunityFeatureSchemaError(communityData.publishedError) ||
          isMissingCommunityFeatureSchemaError(communityData.ownedError) ||
          isMissingCommunityFeatureSchemaError(communityData.reactionError))
      ) {
        setSupportsCommunityFeatureSchema(false);
        communityData = await fetchCommunityData(baseCommunityComponentSelect, false);
      } else if (
        supportsCommunityFeatureSchema &&
        !communityData.publishedError &&
        !communityData.ownedError &&
        !communityData.reactionError
      ) {
        setSupportsCommunityFeatureSchema(true);
      }

      const viewerReactions = new Set(
        communityData.reactionRows.map(
          (row) => `${row.component_id}:${row.reaction_type}`
        )
      );

      if (!communityData.publishedError && communityData.publishedRows) {
        setPublishedCommunityItems(
          communityData.publishedRows.map((row) =>
            mapCommunityRowToShowcaseItem(row as CommunityComponentRow, viewerReactions)
          )
        );
      }

      if (!communityData.ownedError && communityData.ownedRows) {
        setOwnedCommunityItems(
          communityData.ownedRows.map((row) =>
            mapCommunityRowToShowcaseItem(row as CommunityComponentRow, viewerReactions)
          )
        );
      } else if (!activeSession?.user.id) {
        setOwnedCommunityItems([]);
      }
    },
    [supportsCommunityFeatureSchema]
  );

  useEffect(() => {
    const supabaseClient = getSupabaseBrowserClient();
    if (!supabaseClient) {
      setIsAuthHydrating(false);
      return;
    }

    let active = true;

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setIsAuthHydrating(false);
        void refreshCommunityItems(data.session);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setIsAuthHydrating(false);
        void refreshCommunityItems(null);
      });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setIsAuthHydrating(false);
      void refreshCommunityItems(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshCommunityItems]);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isBenignBrowserRuntimeError(event.reason)) {
        event.preventDefault();
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (
        isBenignBrowserRuntimeError(event.error) ||
        isBenignBrowserRuntimeError({
          name: event.message,
          message: event.message,
        })
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (isBenignBrowserConsoleError(args)) {
        return;
      }

      originalConsoleError(...args);
    };

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!selectedItem.code.sourcePath) {
      return () => {
        cancelled = true;
      };
    }

    fetch(selectedItem.code.sourcePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load code sample.");
        }
        return response.text();
      })
      .then((source) => {
        if (cancelled) return;
        setSourceLoadError(false);
        setFetchedCodeTsx(source);
      })
      .catch(() => {
        if (cancelled) return;
        setSourceLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedItem.code.sourcePath]);

  useEffect(() => {
    if (!isEditMode) return;

    requestAnimationFrame(() => {
      monacoEditorRef.current?.focus();
    });
  }, [isEditMode]);

  const clampSidebarWidth = useMemo(
    () => (nextWidth: number, containerWidth?: number, allowCollapse = false) => {
      const currentContainerWidth =
        containerWidth ?? workspaceRef.current?.clientWidth ?? 0;

      if (!currentContainerWidth) return nextWidth;

      const maxWidth = Math.max(
        MIN_SIDEBAR_WIDTH,
        currentContainerWidth -
          RESIZE_HANDLE_WIDTH * 2 -
          codePanelWidth -
          MIN_PREVIEW_PANEL_WIDTH
      );

      if (allowCollapse && nextWidth <= SIDEBAR_COLLAPSE_THRESHOLD) {
        return 0;
      }

      if (nextWidth === 0) return 0;

      return Math.min(Math.max(nextWidth, MIN_SIDEBAR_WIDTH), maxWidth);
    },
    [codePanelWidth]
  );

  const clampCodePanelWidth = useMemo(
    () => (nextWidth: number, containerWidth?: number) => {
      const currentContainerWidth =
        containerWidth ?? contentPanelsRef.current?.clientWidth ?? 0;

      if (!currentContainerWidth) return nextWidth;

      const maxWidth = Math.max(
        MIN_CODE_PANEL_WIDTH,
        currentContainerWidth - RESIZE_HANDLE_WIDTH - MIN_PREVIEW_PANEL_WIDTH
      );

      return Math.min(Math.max(nextWidth, MIN_CODE_PANEL_WIDTH), maxWidth);
    },
    []
  );

  useEffect(() => {
    const node = workspaceRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      setSidebarWidth((currentWidth) =>
        currentWidth === 0
          ? 0
          : clampSidebarWidth(currentWidth, entry.contentRect.width)
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [clampSidebarWidth]);

  useEffect(() => {
    if (!composerCodeTabs.some((tab) => tab.id === composerActiveCodeTabId)) {
      setComposerActiveCodeTabId(composerCodeTabs[0]?.id ?? "tsx");
    }
  }, [composerActiveCodeTabId, composerCodeTabs]);

  useEffect(() => {
    if (saveFeedback !== "saved") return;

    const timeoutId = window.setTimeout(() => {
      setSaveFeedback("");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [saveFeedback]);

  useEffect(() => {
    const node = contentPanelsRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      setCodePanelWidth((currentWidth) =>
        clampCodePanelWidth(currentWidth, entry.contentRect.width)
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [clampCodePanelWidth]);

  useEffect(() => {
    const node = previewPanelRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setPreviewPanelWidth(entry.contentRect.width);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handlePointerMove = (event: PointerEvent) => {
      const delta = event.clientX - sidebarResizeStartRef.current.pointerX;
      setSidebarWidth(
        clampSidebarWidth(
          sidebarResizeStartRef.current.sidebarWidth + delta,
          undefined,
          true
        )
      );
    };

    const handlePointerUp = () => {
      setIsResizingSidebar(false);
    };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handlePointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
    };
  }, [clampSidebarWidth, isResizingSidebar]);

  useEffect(() => {
    if (!isResizingPanels) return;

    const handlePointerMove = (event: PointerEvent) => {
      const delta = resizeStartRef.current.pointerX - event.clientX;
      setCodePanelWidth(
        clampCodePanelWidth(resizeStartRef.current.codePanelWidth + delta)
      );
    };

    const handlePointerUp = () => {
      setIsResizingPanels(false);
    };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handlePointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
    };
  }, [clampCodePanelWidth, isResizingPanels]);

  const toggleEditMode = () => {
    if (!hasFullSource) return;
    setIsEditMode((currentMode) => {
      if (!currentMode) {
        setEditedCodeSegments(
          buildEditableCodeSegments(selectedItem.code, displayPrimaryCode)
        );
      }
      return !currentMode;
    });
  };

  const handleCopy = async () => {
    if (!hasFullSource) return;
    try {
      await navigator.clipboard.writeText(activeCodeValue);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = activeCodeValue;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorBeforeMount: MonacoBeforeMount = (monaco) => {
    const compilerOptions = {
      allowJs: true,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      strict: false,
      noEmit: true,
    };

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      compilerOptions
    );
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
      compilerOptions
    );

    const diagnosticsOptions = {
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
      noSyntaxValidation: true,
    };

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
      diagnosticsOptions
    );
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
      diagnosticsOptions
    );

    monaco.editor.defineTheme(monacoThemeName, {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "94A3B8", fontStyle: "italic" },
        { token: "keyword", foreground: "C026D3" },
        { token: "string", foreground: "16A34A" },
        { token: "number", foreground: "EA580C" },
        { token: "regexp", foreground: "0EA5E9" },
        { token: "type.identifier", foreground: "0F766E" },
        { token: "identifier", foreground: "0F172A" },
        { token: "delimiter", foreground: "475569" },
        { token: "delimiter.bracket", foreground: "334155" },
        { token: "tag", foreground: "DC2626" },
        { token: "attribute.name", foreground: "2563EB" },
        { token: "attribute.value", foreground: "16A34A" },
      ],
      colors: {
        "editor.background": "#00000000",
        "editorGutter.background": "#00000000",
        "editor.lineHighlightBackground": "#00000000",
        "editor.lineHighlightBorder": "#00000000",
        "editorLineNumber.foreground": "#999999",
        "editorLineNumber.activeForeground": "#666666",
        "editor.foreground": "#0F172A",
        "editorCursor.foreground": "#111827",
        "editor.selectionBackground": "#1118271f",
        "editor.inactiveSelectionBackground": "#11182714",
        "editorBracketMatch.background": "#E0F2FE",
        "editorBracketMatch.border": "#7DD3FC",
        "scrollbar.shadow": "#00000000",
      },
    });
  };

  const handleEditorMount: MonacoOnMount = (editor) => {
    monacoEditorRef.current = editor;
    if (isEditMode) {
      editor.focus();
    }
  };

  const handleSelectItem = (item: ShowcaseItem) => {
    setSelectedItemId(item.id);
    setCopied(false);
    setSaveFeedback("");
    setIsEditMode(false);
    setEditedCodeSegments(buildEditableCodeSegments(item.code, item.code.tsx));
    setActiveCodeTabId(getDefaultCodeTabId(item.code));
    setSourceLoadError(false);
    setFetchedCodeTsx(item.code.sourcePath ? null : item.code.tsx);
  };

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizeStartRef.current = {
      pointerX: event.clientX,
      codePanelWidth,
    };
    setIsResizingPanels(true);
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCodePanelWidth((currentWidth) =>
        clampCodePanelWidth(currentWidth + 24)
      );
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCodePanelWidth((currentWidth) =>
        clampCodePanelWidth(currentWidth - 24)
      );
    }
  };

  const handleSidebarResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    sidebarResizeStartRef.current = {
      pointerX: event.clientX,
      sidebarWidth,
    };
    setIsResizingSidebar(true);
  };

  const handleSidebarResizeKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSidebarWidth((currentWidth) =>
        clampSidebarWidth(currentWidth - 24, undefined, true)
      );
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSidebarWidth((currentWidth) =>
        currentWidth === 0
          ? DEFAULT_SIDEBAR_WIDTH
          : clampSidebarWidth(currentWidth + 24)
      );
    }
  };

  const reopenSidebar = () => {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
  };

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthMessage("");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError("");
    setAuthMessage("");
  };

  const openComposer = (item?: ShowcaseItem) => {
    const nextState = item ? createComposerStateFromItem(item) : createInitialComposerState();
    setComposerTargetItem(item ?? null);
    setComposerForkSourceId(item?.forkedFromId ?? null);
    setComposerState(nextState);
    setComposerActiveCodeTabId(
      nextState.mode === "html"
        ? "html"
        : nextState.language === "javascript"
          ? "js"
          : "tsx"
    );
    setComposerError("");
    setIsSlugManuallyEdited(Boolean(item?.slug));
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerTargetItem(null);
    setComposerForkSourceId(null);
    setComposerError("");
    setIsSavingComponent(false);
  };

  const handleAuthSubmit = async (mode: AuthMode) => {
    const supabaseClient = getSupabaseBrowserClient();
    if (!supabaseClient) {
      setAuthError("Supabase is not configured in this app.");
      return;
    }

    const trimmedEmail = authEmail.trim();
    if (!trimmedEmail) {
      setAuthError("Email is required.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: mode === "sign-up",
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) throw error;

      setAuthMessage(
        mode === "sign-up"
          ? "Check your email for the account link. Open it in this browser to finish creating your account."
          : "Check your email for the sign-in link. Open it in this browser to continue."
      );
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    const supabaseClient = getSupabaseBrowserClient();
    if (!supabaseClient) return;

    await supabaseClient.auth.signOut();
  };

  const handleDeleteComponent = async (item: ShowcaseItem) => {
    const supabaseClient = getSupabaseBrowserClient();
    if (
      !supabaseClient ||
      !session?.user.id ||
      item.source !== "community" ||
      item.ownerId !== session.user.id ||
      !item.id
    ) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete "${item.name}" from your components?`
    );
    if (!shouldDelete) return;

    const { error } = await supabaseClient
      .from("community_components")
      .delete()
      .eq("id", getCommunityRowId(item.id))
      .eq("owner_id", session.user.id);

    if (error) {
      window.alert(error.message);
      return;
    }

    setOwnedCommunityItems((current) =>
      current.filter((currentItem) => currentItem.id !== item.id)
    );
    setPublishedCommunityItems((current) =>
      current.filter((currentItem) => currentItem.id !== item.id)
    );

    if (selectedItem.id === item.id) {
      handleSelectItem(defaultSelectedItem);
    }
  };

  const upsertCommunityItem = useCallback((nextItem: ShowcaseItem) => {
    setOwnedCommunityItems((current) => {
      const nextItems = current.filter((item) => item.id !== nextItem.id);
      return nextItem.ownerId === currentUserId ? [nextItem, ...nextItems] : nextItems;
    });

    setPublishedCommunityItems((current) => {
      const nextItems = current.filter((item) => item.id !== nextItem.id);
      return nextItem.status === "published" ? [nextItem, ...nextItems] : nextItems;
    });
  }, [currentUserId]);

  const patchCommunityItem = useCallback(
    (itemId: string, updater: (item: ShowcaseItem) => ShowcaseItem) => {
      setOwnedCommunityItems((current) =>
        current.map((item) => (item.id === itemId ? updater(item) : item))
      );
      setPublishedCommunityItems((current) =>
        current.map((item) => (item.id === itemId ? updater(item) : item))
      );
    },
    []
  );

  const handlePersistEditedCode = async () => {
    const supabaseClient = getSupabaseBrowserClient();
    if (!supabaseClient || !session?.user.id || !isOwnedCommunityItem || !hasEditableCodeChanges) {
      return;
    }

    const payload = {
      tsx: (displayedCodeSegments.tsx ?? "").trim() || null,
      js: (displayedCodeSegments.js ?? "").trim() || null,
      html: (displayedCodeSegments.html ?? "").trim() || null,
      css: displayedCodeSegments.css ?? "",
    };

    setIsPersistingEditedCode(true);
    setSaveFeedback("");

    try {
      const { data, error } = await supabaseClient
        .from("community_components")
        .update(payload)
        .eq("id", getCommunityRowId(selectedItem.id))
        .eq("owner_id", session.user.id)
        .select(
          supportsCommunityFeatureSchema
            ? extendedCommunityComponentSelect
            : baseCommunityComponentSelect
        )
        .single();

      if (error || !data) {
        throw error || new Error("Unable to save code changes.");
      }

      const nextItem = {
        ...mapCommunityRowToShowcaseItem(data as unknown as CommunityComponentRow),
        viewerHasLiked: selectedItem.viewerHasLiked,
        viewerHasBookmarked: selectedItem.viewerHasBookmarked,
      };
      upsertCommunityItem(nextItem);
      setEditedCodeSegments(buildEditableCodeSegments(nextItem.code, nextItem.code.tsx));
      setFetchedCodeTsx(nextItem.code.tsx);
      setSaveFeedback("saved");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save code changes.");
    } finally {
      setIsPersistingEditedCode(false);
    }
  };

  const handleToggleReaction = async (reactionType: "like" | "bookmark") => {
    const supabaseClient = getSupabaseBrowserClient();
    if (
      !supabaseClient ||
      !session?.user.id ||
      selectedItem.source !== "community" ||
      !supportsCommunityFeatureSchema
    ) {
      return;
    }

    const itemId = selectedItem.id;
    const rowId = getCommunityRowId(itemId);
    const currentlyActive =
      reactionType === "like"
        ? Boolean(selectedItem.viewerHasLiked)
        : Boolean(selectedItem.viewerHasBookmarked);

    setIsTogglingReaction(reactionType);

    try {
      if (currentlyActive) {
        const { error } = await supabaseClient
          .from("community_component_reactions")
          .delete()
          .eq("component_id", rowId)
          .eq("user_id", session.user.id)
          .eq("reaction_type", reactionType);

        if (error) throw error;
      } else {
        const { error } = await supabaseClient
          .from("community_component_reactions")
          .insert({
            component_id: rowId,
            user_id: session.user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }

      patchCommunityItem(itemId, (item) => ({
        ...item,
        viewerHasLiked:
          reactionType === "like" ? !currentlyActive : item.viewerHasLiked,
        viewerHasBookmarked:
          reactionType === "bookmark" ? !currentlyActive : item.viewerHasBookmarked,
        likeCount:
          reactionType === "like"
            ? Math.max(0, (item.likeCount ?? 0) + (currentlyActive ? -1 : 1))
            : item.likeCount,
        bookmarkCount:
          reactionType === "bookmark"
            ? Math.max(0, (item.bookmarkCount ?? 0) + (currentlyActive ? -1 : 1))
            : item.bookmarkCount,
      }));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to update this reaction."
      );
    } finally {
      setIsTogglingReaction("");
    }
  };

  const handleForkSelectedComponent = async () => {
    if (!session?.user.id || selectedItem.source !== "community") {
      return;
    }

    setIsForkingComponent(true);
    try {
      const nextState = createComposerStateFromItem(selectedItem);
      nextState.name = `${selectedItem.name} Copy`;
      nextState.slug = slugifyComponentName(`${selectedItem.slug || selectedItem.name}-copy`);
      nextState.status = "draft";
      setComposerTargetItem(null);
      setComposerForkSourceId(getCommunityRowId(selectedItem.id));
      setComposerState(nextState);
      setComposerActiveCodeTabId(
        nextState.mode === "html"
          ? "html"
          : nextState.language === "javascript"
            ? "js"
            : "tsx"
      );
      setIsSlugManuallyEdited(true);
      setComposerError("");
      setIsComposerOpen(true);
    } finally {
      setIsForkingComponent(false);
    }
  };

  const handleOpenVersionHistory = async () => {
    const supabaseClient = getSupabaseBrowserClient();
    if (
      !supabaseClient ||
      !session?.user.id ||
      !isOwnedCommunityItem ||
      !supportsCommunityFeatureSchema
    ) {
      return;
    }

    setIsHistoryModalOpen(true);
    setIsLoadingVersionHistory(true);
    setVersionHistoryError("");

    const { data, error } = await supabaseClient
      .from("community_component_versions")
      .select(
        "id, component_id, owner_id, name, category, description, language, tsx, js, html, css, status, version_number, created_at"
      )
      .eq("component_id", getCommunityRowId(selectedItem.id))
      .order("version_number", { ascending: false });

    if (error) {
      setVersionHistory([]);
      setVersionHistoryError(error.message);
      setIsLoadingVersionHistory(false);
      return;
    }

    setVersionHistory((data as CommunityComponentVersionRow[] | null) ?? []);
    setIsLoadingVersionHistory(false);
  };

  const handleRestoreVersion = async (version: CommunityComponentVersionRow) => {
    const supabaseClient = getSupabaseBrowserClient();
    if (
      !supabaseClient ||
      !session?.user.id ||
      !isOwnedCommunityItem ||
      !supportsCommunityFeatureSchema
    ) {
      return;
    }

    setIsRestoringVersion(version.id);

    try {
      const { data, error } = await supabaseClient
        .from("community_components")
        .update({
          name: version.name,
          category: version.category,
          description: version.description,
          language: version.language || "typescript",
          tsx: version.tsx,
          js: version.js,
          html: version.html,
          css: version.css || "",
          status: version.status,
        })
        .eq("id", version.component_id)
        .eq("owner_id", session.user.id)
        .select(extendedCommunityComponentSelect)
        .single();

      if (error || !data) {
        throw error || new Error("Unable to restore this version.");
      }

      const nextItem = {
        ...mapCommunityRowToShowcaseItem(data as unknown as CommunityComponentRow),
        viewerHasLiked: selectedItem.viewerHasLiked,
        viewerHasBookmarked: selectedItem.viewerHasBookmarked,
      };
      upsertCommunityItem(nextItem);
      handleSelectItem(nextItem);
      setIsHistoryModalOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to restore this version.");
    } finally {
      setIsRestoringVersion(null);
    }
  };

  const handleComposerFieldChange = <K extends keyof ComponentComposerState>(
    key: K,
    value: ComponentComposerState[K]
  ) => {
    setComposerState((current) => {
      const nextState = { ...current, [key]: value };

      if (key === "name" && !isSlugManuallyEdited) {
        nextState.slug = slugifyComponentName(String(value));
      }

      if (key === "language") {
        const nextLanguage = value as ComponentCodeLanguage;
        if (nextLanguage === "typescript" && !nextState.tsx.trim()) {
          nextState.tsx = getDefaultComponentSource("typescript");
        }
        if (nextLanguage === "javascript" && !nextState.js.trim()) {
          nextState.js = getDefaultComponentSource("javascript");
        }
      }

      if (key === "mode") {
        const nextMode = value as ComponentComposerMode;
        if (nextMode === "html") {
          if (!nextState.html.trim()) {
            nextState.html = getDefaultHtmlMarkup();
          }
          if (!nextState.css.trim()) {
            nextState.css = getDefaultHtmlCss();
          }
        } else if (nextState.language === "typescript" && !nextState.tsx.trim()) {
          nextState.tsx = getDefaultComponentSource("typescript");
        } else if (nextState.language === "javascript" && !nextState.js.trim()) {
          nextState.js = getDefaultComponentSource("javascript");
        }
      }

      return nextState;
    });
  };

  const handleComposerCodeChange = (tabId: CodeTabId, value: string) => {
    if (tabId === "css") {
      handleComposerFieldChange("css", value);
      return;
    }

    if (tabId === "html") {
      handleComposerFieldChange("html", value);
      return;
    }

    if (tabId === "js") {
      handleComposerFieldChange("js", value);
      return;
    }

    handleComposerFieldChange("tsx", value);
  };

  const handleSaveComponent = async () => {
    const supabaseClient = getSupabaseBrowserClient();
    if (!supabaseClient || !session?.user.id) {
      setComposerError("Sign in before creating a component.");
      return;
    }

    const trimmedName = composerState.name.trim();
    const trimmedSlug = composerState.slug.trim() || slugifyComponentName(trimmedName);
    const trimmedTsx = composerState.tsx.trim();
    const trimmedJs = composerState.js.trim();
    const trimmedHtml = composerState.html.trim();
    const trimmedCss = composerState.css;
    const trimmedPrimarySource =
      composerState.mode === "html"
        ? trimmedHtml
        : composerState.language === "javascript"
          ? trimmedJs
          : trimmedTsx;

    if (!trimmedName) {
      setComposerError("Component name is required.");
      return;
    }

    if (!trimmedSlug) {
      setComposerError("Slug is required.");
      return;
    }

    if (!trimmedPrimarySource) {
      setComposerError(
        composerState.mode === "html"
          ? "HTML markup is required."
          : "Primary component code is required."
      );
      return;
    }

    setIsSavingComponent(true);
    setComposerError("");

    const isEditingOwnedItem =
      Boolean(composerTargetItem) && composerTargetItem?.ownerId === session.user.id;

    const authorName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] ||
      "Community";

    const payload = {
      owner_id: session.user.id,
      slug: trimmedSlug,
      name: trimmedName,
      category: composerState.category.trim() || null,
      author_name: authorName,
      description: composerState.description.trim() || null,
      language: composerState.mode === "html" ? "javascript" : composerState.language,
      tsx:
        composerState.mode === "react" && composerState.language === "typescript"
          ? trimmedTsx
          : null,
      js:
        composerState.mode === "html"
          ? trimmedJs || null
          : composerState.language === "javascript"
            ? trimmedJs
            : null,
      html: composerState.mode === "html" ? trimmedHtml : null,
      css: trimmedCss,
      status: composerState.status,
    };
    const payloadWithFork =
      supportsCommunityFeatureSchema &&
      (isEditingOwnedItem
        ? Boolean(composerTargetItem?.forkedFromId)
        : Boolean(composerForkSourceId))
        ? {
            ...payload,
            forked_from_id: isEditingOwnedItem
              ? composerTargetItem?.forkedFromId || null
              : composerForkSourceId,
          }
        : payload;

    try {
      const result = isEditingOwnedItem
        ? await supabaseClient
            .from("community_components")
            .update(payloadWithFork)
            .eq("id", getCommunityRowId(composerTargetItem.id))
            .eq("owner_id", session.user.id)
            .select(
              supportsCommunityFeatureSchema
                ? extendedCommunityComponentSelect
                : baseCommunityComponentSelect
            )
            .single()
        : await supabaseClient
            .from("community_components")
            .insert(payloadWithFork)
            .select(
              supportsCommunityFeatureSchema
                ? extendedCommunityComponentSelect
                : baseCommunityComponentSelect
            )
            .single();

      if (result.error || !result.data) {
        throw result.error || new Error("Unable to save component.");
      }

      const nextItem = {
        ...mapCommunityRowToShowcaseItem(result.data as unknown as CommunityComponentRow),
        viewerHasLiked: composerTargetItem?.viewerHasLiked ?? false,
        viewerHasBookmarked: composerTargetItem?.viewerHasBookmarked ?? false,
      };

      upsertCommunityItem(nextItem);

      handleSelectItem(nextItem);
      setIsComposerOpen(false);
    } catch (error) {
      setComposerError(error instanceof Error ? error.message : "Unable to save component.");
    } finally {
      setIsSavingComponent(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f3f5f7] text-black">
      <div ref={workspaceRef} className="relative flex h-full min-w-[1180px]">
        {sidebarWidth === 0 && (
          <button
            type="button"
            onClick={reopenSidebar}
            className="absolute left-0 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-r-xl border border-black/8 border-l-0 bg-white text-black shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-colors hover:bg-[#f8fafc]"
            aria-label="Open sidebar"
          >
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        )}

        <aside
          className={`flex min-h-0 shrink-0 flex-col overflow-hidden bg-white ${
            isResizingSidebar ? "" : "transition-[width] duration-150"
          }`}
          style={{ width: sidebarWidth }}
        >
          <div className="bg-white px-3 pt-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <h1 className="min-w-0 text-[16px] font-normal leading-[1.1] tracking-[-0.01em] text-black">
                Component Library
              </h1>
              <button
                type="button"
                onClick={() => setIsSidebarSearchOpen((current) => !current)}
                className={`flex items-center gap-1 rounded-lg border px-2 py-[5px] text-[13px] leading-[1.1] transition-all duration-200 ${
                  isSidebarSearchOpen || isSearchActive
                    ? "border-black/8 bg-white text-black"
                    : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white"
                }`}
              >
                <Search size={13} strokeWidth={1.8} />
                {isSearchActive ? "Filter" : "Search"}
              </button>
            </div>
          </div>

          <div className="px-3 pb-3">
            {isSidebarSearchOpen || isSearchActive ? (
              <div className="rounded-lg border border-black/8 bg-[#fafafa] p-2">
                <input
                  type="text"
                  value={sidebarQuery}
                  onChange={(event) => setSidebarQuery(event.target.value)}
                  placeholder="Search components"
                  className="w-full rounded-lg border border-black/8 bg-white px-3 py-2 text-[14px] leading-[1.2] text-black outline-none transition-colors focus:border-black/20"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["all", "official", "mine", "community"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSidebarFilter(filter)}
                      className={`rounded-lg border px-2 py-[5px] text-[13px] leading-[1.1] transition-all duration-200 ${
                        sidebarFilter === filter
                          ? "border-black/8 bg-white text-black"
                          : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarQuery("");
                      setSidebarFilter("all");
                      setIsSidebarSearchOpen(false);
                    }}
                    className="rounded-lg border border-black/8 bg-[#F5F5F5] px-2 py-[5px] text-[13px] leading-[1.1] text-black transition-all duration-200 hover:bg-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : isAuthHydrating ? (
              <div className="rounded-lg border border-black/8 bg-[#fafafa] p-2">
                <div className="text-[13px] leading-[1.4] text-black/45">
                  Restoring session...
                </div>
              </div>
            ) : session ? (
              <div className="rounded-lg border border-black/8 bg-[#fafafa] p-2">
                <div className="truncate text-[13px] leading-[1.3] text-black/72">
                  {session.user.email}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openComposer()}
                    className={secondaryButtonClassName}
                  >
                    Add component
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={secondaryButtonClassName}
                  >
                    Sign out
                  </button>
                </div>
                {authMessage ? (
                  <div className="mt-2 text-[12px] leading-[1.4] text-black/55">
                    {authMessage}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-black/8 bg-[#fafafa] p-2">
                <div className="text-[13px] leading-[1.4] text-black/62">
                  Sign in to create drafts and publish your own components.
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal("sign-in")}
                    className={secondaryButtonClassName}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal("sign-up")}
                    className={secondaryButtonClassName}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <div className="flex flex-col gap-[2px]">
                <div
                  className={`${geistMono.className} px-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-black/35`}
                >
                  Official
                </div>
                {filteredOfficialItems.map((item) => {
                  const isSelected = item.id === selectedItem.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className={`rounded-lg px-2 py-[5px] text-left text-[15px] leading-[1.1] transition-all duration-200 ${
                        isSelected
                          ? "bg-[#F3F4F4] text-black"
                          : "text-black hover:bg-[#F3F4F4]"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {session ? (
                <div className="flex flex-col gap-[2px]">
                  <div
                    className={`${geistMono.className} px-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-black/35`}
                  >
                    My Components
                  </div>
                  {filteredOwnedItems.length ? (
                    filteredOwnedItems.map((item) => {
                      const isSelected = item.id === selectedItem.id;

                      return (
                        <div
                          key={item.id}
                          className={`group rounded-lg px-2 py-[6px] transition-all duration-200 ${
                            isSelected
                              ? "bg-[#F3F4F4] text-black"
                              : "text-black hover:bg-[#F3F4F4]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectItem(item)}
                              className="min-w-0 flex-1 text-left text-[15px] leading-[1.1]"
                            >
                              <span className="block truncate">{item.name}</span>
                            </button>
                            <span className="shrink-0 rounded-md bg-white px-1.5 py-[2px] text-[11px] leading-none text-black/45">
                              {item.status}
                            </span>
                          </div>
                          <div
                            className={`mt-1 flex items-center gap-1 transition-opacity ${
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => openComposer(item)}
                              className={sidebarActionButtonClassName}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteComponent(item)}
                              className={sidebarActionButtonClassName}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-2 py-1 text-[13px] leading-[1.4] text-black/45">
                      {sidebarQuery || sidebarFilter !== "all"
                        ? "No matching personal components."
                        : "No personal components yet."}
                    </div>
                  )}
                </div>
              ) : null}

              {filteredCommunityItems.length ? (
                <div className="flex flex-col gap-[2px]">
                  <div
                    className={`${geistMono.className} px-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-black/35`}
                  >
                    Community
                  </div>
                  {filteredCommunityItems.map((item) => {
                    const isSelected = item.id === selectedItem.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className={`rounded-lg px-2 py-[5px] text-left text-[15px] leading-[1.1] transition-all duration-200 ${
                          isSelected
                            ? "bg-[#F3F4F4] text-black"
                            : "text-black hover:bg-[#F3F4F4]"
                        }`}
                      >
                        {item.name}
                      </button>
                  );
                })}
                </div>
              ) : null}

              {!filteredOfficialItems.length &&
              !filteredOwnedItems.length &&
              !filteredCommunityItems.length ? (
                <div className="px-2 py-1 text-[13px] leading-[1.4] text-black/45">
                  No components match this search.
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize sidebar and preview panels"
          aria-orientation="vertical"
          onPointerDown={handleSidebarResizeStart}
          onKeyDown={handleSidebarResizeKeyDown}
          className={`relative shrink-0 bg-black/8 transition-colors focus:outline-none ${
            isResizingSidebar ? "bg-black/20" : "hover:bg-black/14"
          }`}
          style={{ width: RESIZE_HANDLE_WIDTH }}
        >
          <div className="absolute -left-[6px] top-0 h-full w-[13px] cursor-col-resize" />
        </div>

        <div ref={contentPanelsRef} className="flex min-w-0 flex-1">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
            {selectedItem.source === "community" ? (
              <div className="border-b border-black/8 px-4 py-3">
                <div className="text-[15px] leading-[1.1] text-black">
                  {selectedItem.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] leading-[1.4] text-black/48">
                  <span>{selectedItem.authorName || "Community"}</span>
                  <span>{selectedItem.category}</span>
                  <span>{selectedItem.status || "published"}</span>
                  {selectedItemUpdatedLabel ? <span>Updated {selectedItemUpdatedLabel}</span> : null}
                </div>
                {selectedItem.description ? (
                  <div className="mt-2 text-[13px] leading-[1.5] text-black/62">
                    {selectedItem.description}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleToggleReaction("like")}
                    disabled={
                      !session ||
                      !supportsCommunityFeatureSchema ||
                      isTogglingReaction === "like"
                    }
                    className={`flex items-center gap-1 rounded-lg border px-2 py-[5px] text-[13px] leading-[1.1] transition-all duration-200 ${
                      selectedItem.viewerHasLiked
                        ? "border-black bg-black text-white"
                        : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white"
                    } ${!session || !supportsCommunityFeatureSchema ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <Heart size={13} strokeWidth={1.8} />
                    {selectedItem.likeCount ?? 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleReaction("bookmark")}
                    disabled={
                      !session ||
                      !supportsCommunityFeatureSchema ||
                      isTogglingReaction === "bookmark"
                    }
                    className={`flex items-center gap-1 rounded-lg border px-2 py-[5px] text-[13px] leading-[1.1] transition-all duration-200 ${
                      selectedItem.viewerHasBookmarked
                        ? "border-black bg-black text-white"
                        : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white"
                    } ${!session || !supportsCommunityFeatureSchema ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <Bookmark size={13} strokeWidth={1.8} />
                    {selectedItem.bookmarkCount ?? 0}
                  </button>
                  {session ? (
                    <button
                      type="button"
                      onClick={() => void handleForkSelectedComponent()}
                      disabled={isForkingComponent}
                      className="flex items-center gap-1 rounded-lg border border-black/8 bg-[#F5F5F5] px-2 py-[5px] text-[13px] leading-[1.1] text-black transition-all duration-200 hover:bg-white"
                    >
                      <GitFork size={13} strokeWidth={1.8} />
                      {isForkingComponent ? "Forking" : "Fork"}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div ref={previewPanelRef} className={workspaceStyles.panelScroll}>
              <div className={workspaceStyles.previewCanvas}>
                {isSandboxPreview ? (
                  <div
                    className={workspaceStyles.previewFrame}
                    style={previewFrameStyle}
                  >
                    <div
                      className={workspaceStyles.previewStaticContent}
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: "none",
                      }}
                    >
                      <CommunitySandboxPreview
                        code={sandboxPreviewCode}
                        name={selectedItem.name}
                      />
                    </div>
                  </div>
                ) : displayComponent ? (
                  <div
                    className={workspaceStyles.previewFrame}
                    style={previewFrameStyle}
                  >
                    {isEditMode && livePreviewCode ? (
                      <LiveProvider
                        code={livePreviewCode}
                        scope={livePreviewRuntimeScope}
                        noInline={true}
                        enableTypeScript={true}
                      >
                        <style>{livePreviewCss}</style>
                        <LivePreview
                          Component="div"
                          className={workspaceStyles.livePreviewContent}
                          style={previewContentStyle}
                        />
                        <LiveError className={workspaceStyles.livePreviewError} />
                      </LiveProvider>
                    ) : (
                      <div
                        className={workspaceStyles.previewStaticContent}
                        style={previewContentStyle}
                      >
                        {React.createElement(displayComponent)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-black/12 bg-[#f8fafc] px-6 py-10 text-center text-sm text-black/55">
                    Preview unavailable for this component.
                  </div>
                )}
              </div>
            </div>
          </section>

          <div
            role="separator"
            tabIndex={0}
            aria-label="Resize preview and code panels"
            aria-orientation="vertical"
            onPointerDown={handleResizeStart}
            onKeyDown={handleResizeKeyDown}
            className={`relative shrink-0 bg-black/8 transition-colors focus:outline-none ${
              isResizingPanels ? "bg-black/20" : "hover:bg-black/14"
            }`}
            style={{ width: RESIZE_HANDLE_WIDTH }}
          >
            <div className="absolute -left-[6px] top-0 h-full w-[13px] cursor-col-resize" />
          </div>

          <section
            className="relative flex min-h-0 shrink-0 flex-col bg-white"
            style={{ width: codePanelWidth }}
          >
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              {availableCodeTabs.map((tab) => {
                const isActive = tab.id === activeCodeTab?.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCodeTabId(tab.id)}
                    className={`flex items-center rounded-lg border px-2 py-[5px] text-[15px] leading-[1.1] font-normal transition-all duration-200 ${
                      isActive
                        ? "border-black/8 bg-white text-black"
                        : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white active:scale-95"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
              {isOwnedCommunityItem ? (
                <button
                  type="button"
                  onClick={() => void handleOpenVersionHistory()}
                  disabled={!supportsCommunityFeatureSchema}
                  className={`flex items-center rounded-lg border px-2 py-[5px] text-[15px] leading-[1.1] font-normal transition-all duration-200 ${
                    supportsCommunityFeatureSchema
                      ? "border-black/8 bg-[#F5F5F5] text-black hover:bg-white active:scale-95"
                      : "cursor-not-allowed border-black/8 bg-[#F5F5F5] text-black/35"
                  }`}
                >
                  History
                </button>
              ) : null}

              {isOwnedCommunityItem && isEditMode ? (
                <button
                  type="button"
                  onClick={() => void handlePersistEditedCode()}
                  disabled={!hasFullSource || !hasEditableCodeChanges || isPersistingEditedCode}
                  className={`flex items-center rounded-lg border px-2 py-[5px] text-[15px] leading-[1.1] font-normal transition-all duration-200 ${
                    !hasFullSource || !hasEditableCodeChanges
                      ? "cursor-not-allowed border-black/8 bg-[#F5F5F5] text-black/35"
                      : saveFeedback === "saved"
                        ? "border-black bg-black text-white shadow-md"
                        : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white active:scale-95"
                  }`}
                >
                  {isPersistingEditedCode
                    ? "Saving"
                    : saveFeedback === "saved"
                      ? "Saved"
                      : "Save"}
                </button>
              ) : null}

              <button
                type="button"
                onClick={toggleEditMode}
                disabled={!hasFullSource}
                className={`flex items-center rounded-lg border px-2 py-[5px] text-[15px] leading-[1.1] font-normal transition-all duration-200 ${
                  !hasFullSource
                    ? "cursor-not-allowed border-black/8 bg-[#F5F5F5] text-black/35"
                    : isEditMode
                      ? "border-black bg-black text-white shadow-md"
                      : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white active:scale-95"
                }`}
              >
                {!hasFullSource ? (
                  "Loading"
                ) : isEditMode ? (
                  "Back"
                ) : (
                  "Edit"
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!hasFullSource}
                className={`flex items-center rounded-lg border px-2 py-[5px] text-[15px] leading-[1.1] font-normal transition-all duration-200 ${
                  !hasFullSource
                    ? "cursor-not-allowed border-black/8 bg-[#F5F5F5] text-black/35"
                    : copied
                      ? "border-black bg-black text-white shadow-md"
                      : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white active:scale-95"
                }`}
              >
                {!hasFullSource ? "Wait" : copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className={workspaceStyles.monacoEditorShell}>
              <MonacoEditor
                key={monacoModelPath}
                beforeMount={handleEditorBeforeMount}
                onMount={handleEditorMount}
                height="100%"
                defaultLanguage={activeCodeTab?.language ?? "typescript"}
                language={activeCodeTab?.language ?? "typescript"}
                theme={monacoThemeName}
                path={monacoModelPath}
                value={activeCodeValue}
                onChange={(value) => {
                  if (!isEditMode || !activeCodeTab) return;
                  setEditedCodeSegments((current) => ({
                    ...current,
                    [activeCodeTab.id]: value ?? "",
                  }));
                }}
                options={codeEditorOptions}
              />
            </div>
          </section>
        </div>
      </div>

      {isAuthModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/12 px-6"
          onClick={closeAuthModal}
        >
          <div
            className="w-full max-w-[420px] rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[18px] leading-none text-black">
                  {authMode === "sign-in" ? "Sign in" : "Sign up"}
                </div>
                <div className="mt-2 text-[13px] leading-[1.45] text-black/55">
                  {authMode === "sign-in"
                    ? "Use a passwordless email link to create and manage components without browser Touch ID or saved-password issues."
                    : "Create an account with a passwordless email link, then save drafts and publish components."}
                </div>
              </div>
              <button
                type="button"
                onClick={closeAuthModal}
                className={secondaryButtonClassName}
              >
                Close
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              autoComplete="off"
              onSubmit={(event) => {
                event.preventDefault();
                void handleAuthSubmit(authMode);
              }}
            >
              <label className="block">
                <div className="mb-2 text-[13px] leading-none text-black/55">Email</div>
                <input
                  type="text"
                  inputMode="email"
                  name="component-library-email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                  placeholder="you@example.com"
                />
              </label>
            </form>

            {authError ? (
              <div className="mt-4 rounded-lg border border-[#efc7c7] bg-[#fff7f7] px-3 py-2 text-[13px] leading-[1.5] text-[#b91c1c]">
                {authError}
              </div>
            ) : null}

            {authMessage ? (
              <div className="mt-4 rounded-lg border border-black/8 bg-[#fafafa] px-3 py-2 text-[13px] leading-[1.5] text-black/62">
                {authMessage}
              </div>
            ) : null}

            <div className="mt-4 text-[12px] leading-[1.5] text-black/45">
              Open the email link in this same browser so the session can be restored here.
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleAuthSubmit(authMode)}
                disabled={isAuthenticating}
                className={secondaryButtonClassName}
              >
                {isAuthenticating
                  ? authMode === "sign-in"
                    ? "Sending..."
                    : "Sending..."
                  : authMode === "sign-in"
                    ? "Send sign-in link"
                    : "Send sign-up link"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setAuthMode((current) =>
                    current === "sign-in" ? "sign-up" : "sign-in"
                  )
                }
                className={secondaryButtonClassName}
              >
                {authMode === "sign-in" ? "Need an account?" : "Have an account?"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isHistoryModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/12 px-6 py-8"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[18px] border border-black/8 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/8 px-5 py-4">
              <div>
                <div className="text-[18px] leading-none text-black">Version history</div>
                <div className="mt-2 text-[13px] leading-[1.45] text-black/55">
                  Restore any previous saved version of this component.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className={secondaryButtonClassName}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {isLoadingVersionHistory ? (
                <div className="text-[14px] leading-[1.5] text-black/55">Loading history...</div>
              ) : versionHistoryError ? (
                <div className="rounded-lg border border-[#efc7c7] bg-[#fff7f7] px-3 py-2 text-[13px] leading-[1.5] text-[#b91c1c]">
                  {versionHistoryError}
                </div>
              ) : versionHistory.length ? (
                <div className="space-y-3">
                  {versionHistory.map((version) => (
                    <div
                      key={version.id}
                      className="rounded-xl border border-black/8 bg-[#fafafa] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[15px] leading-[1.1] text-black">
                            Version {version.version_number}
                          </div>
                          <div className="mt-1 text-[12px] leading-[1.45] text-black/48">
                            {formatRelativeDate(version.created_at) || "Unknown date"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleRestoreVersion(version)}
                          disabled={isRestoringVersion === version.id}
                          className={secondaryButtonClassName}
                        >
                          {isRestoringVersion === version.id ? "Restoring" : "Restore"}
                        </button>
                      </div>
                      <div className="mt-2 text-[13px] leading-[1.5] text-black/55">
                        {version.description || version.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[14px] leading-[1.5] text-black/55">
                  No saved versions yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isComposerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/12 px-6 py-8"
          onClick={closeComposer}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[18px] border border-black/8 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/8 px-5 py-4">
              <div>
                <div className="text-[18px] leading-none text-black">
                  {composerTargetItem ? "Edit component" : "Add component"}
                </div>
                <div className="mt-2 text-[13px] leading-[1.45] text-black/55">
                  {composerTargetItem
                    ? "Update your saved draft or published community component."
                    : "Save a private draft or publish a new community component."}
                </div>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className={secondaryButtonClassName}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Name
                  </div>
                  <input
                    type="text"
                    value={composerState.name}
                    onChange={(event) =>
                      handleComposerFieldChange("name", event.target.value)
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                    placeholder="Community Card"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Slug
                  </div>
                  <input
                    type="text"
                    value={composerState.slug}
                    onChange={(event) => {
                      setIsSlugManuallyEdited(true);
                      handleComposerFieldChange("slug", slugifyComponentName(event.target.value));
                    }}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                    placeholder="community-card"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Category
                  </div>
                  <input
                    type="text"
                    value={composerState.category}
                    onChange={(event) =>
                      handleComposerFieldChange("category", event.target.value)
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                    placeholder="Card"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Status
                  </div>
                  <select
                    value={composerState.status}
                    onChange={(event) =>
                      handleComposerFieldChange(
                        "status",
                        event.target.value as ComponentStatus
                      )
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                  <div className="mt-2 text-[12px] leading-[1.5] text-black/48">
                    `draft` means only you should see it in My Components. `published`
                    means everyone can see it in the public community list.
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.5] text-black/48">
                    For now, choose `draft` first while testing. Once you&apos;re happy,
                    use `published`.
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Format
                  </div>
                  <select
                    value={composerState.mode}
                    onChange={(event) =>
                      handleComposerFieldChange(
                        "mode",
                        event.target.value as ComponentComposerMode
                      )
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                  >
                    <option value="react">react component</option>
                    <option value="html">html / css / js</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Language
                  </div>
                  <select
                    value={composerState.language}
                    onChange={(event) =>
                      handleComposerFieldChange(
                        "language",
                        event.target.value as ComponentCodeLanguage
                      )
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                    disabled={composerState.mode === "html"}
                  >
                    <option value="typescript">typescript</option>
                    <option value="javascript">javascript</option>
                  </select>
                  <div className="mt-2 text-[12px] leading-[1.5] text-black/48">
                    {composerState.mode === "html"
                      ? "HTML mode uses html, css, and optional javascript."
                      : "React mode uses tsx or js as the primary code tab."}
                  </div>
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-[13px] leading-none text-black/55">
                    Description
                  </div>
                  <input
                    type="text"
                    value={composerState.description}
                    onChange={(event) =>
                      handleComposerFieldChange("description", event.target.value)
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] leading-[1.2] text-black outline-none transition-colors focus:border-black/25"
                    placeholder="A short description for the sidebar and future component pages"
                  />
                  <div className="mt-2 text-[12px] leading-[1.5] text-black/48">
                    Description is optional.
                  </div>
                </label>

                <div className="block md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-[13px] leading-none text-black/55">
                      Component code
                    </div>
                    <div className="flex items-center gap-2">
                      {composerCodeTabs.map((tab) => {
                        const isActive = tab.id === activeComposerCodeTab?.id;

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setComposerActiveCodeTabId(tab.id)}
                            className={`flex items-center rounded-lg border px-2 py-[5px] text-[15px] leading-[1.1] font-normal transition-all duration-200 ${
                              isActive
                                ? "border-black/8 bg-white text-black"
                                : "border-black/8 bg-[#F5F5F5] text-black hover:bg-white active:scale-95"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <textarea
                    value={activeComposerCodeTab?.value ?? ""}
                    onChange={(event) =>
                      activeComposerCodeTab
                        ? handleComposerCodeChange(activeComposerCodeTab.id, event.target.value)
                        : undefined
                    }
                    className="min-h-[280px] w-full rounded-lg border border-black/10 bg-white px-3 py-3 font-mono text-[13px] leading-6 text-black outline-none transition-colors focus:border-black/25"
                    spellCheck={false}
                    placeholder={
                      activeComposerCodeTab?.id === "css"
                        ? "Optional CSS for your component"
                        : activeComposerCodeTab?.id === "html"
                          ? "HTML markup for your component"
                          : "Component source"
                    }
                  />
                </div>
              </div>

              {composerError ? (
                <div className="mt-4 rounded-lg border border-[#efc7c7] bg-[#fff7f7] px-3 py-2 text-[13px] leading-[1.5] text-[#b91c1c]">
                  {composerError}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 border-t border-black/8 px-5 py-4">
              <button
                type="button"
                onClick={handleSaveComponent}
                disabled={isSavingComponent}
                className={secondaryButtonClassName}
              >
                {isSavingComponent
                  ? "Saving..."
                  : composerTargetItem
                    ? "Update component"
                    : "Save component"}
              </button>
              <button
                type="button"
                onClick={closeComposer}
                className={secondaryButtonClassName}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
