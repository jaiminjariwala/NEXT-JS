"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
import { showcaseItems } from "@/data/componentsData";
import { AnalogClock } from "@/components/library/Clock/AnalogClock/AnalogClock";
import { DateCalendar } from "@/components/library/Calendar/DateCalendar/DateCalendar";
import type { ShowcaseItem } from "@/types";
import workspaceStyles from "./LibraryWorkspace.module.css";

const codeFontFamily =
  '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace';
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
const defaultSelectedItem =
  showcaseItems.find((item) => item.id === defaultSelectedItemId) ?? showcaseItems[0];

const { ChevronRight } = LucideIcons;

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
  showcaseItems,
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
  return tsx
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
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
  const [selectedItemId, setSelectedItemId] = useState(defaultSelectedItemId);
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingPanels, setIsResizingPanels] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [codePanelWidth, setCodePanelWidth] = useState(DEFAULT_CODE_PANEL_WIDTH);
  const [editedCode, setEditedCode] = useState(defaultSelectedItem.code.tsx);
  const [fetchedCodeTsx, setFetchedCodeTsx] = useState<string | null>(
    defaultSelectedItem.code.sourcePath ? null : defaultSelectedItem.code.tsx
  );
  const [sourceLoadError, setSourceLoadError] = useState(false);
  const [previewPanelWidth, setPreviewPanelWidth] = useState(0);

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

  const selectedItem = useMemo<ShowcaseItem>(() => {
    return (
      showcaseItems.find((item) => item.id === selectedItemId) ?? showcaseItems[0]
    );
  }, [selectedItemId]);

  const displayComponent = selectedItem.hidePreview ? null : selectedItem.component;
  const hasExternalSource = Boolean(selectedItem.code.sourcePath);
  const isSourceLoading =
    hasExternalSource && fetchedCodeTsx === null && !sourceLoadError;
  const hasFullSource =
    !hasExternalSource || (!!fetchedCodeTsx && !sourceLoadError);
  const displayCodeTsx = isSourceLoading
    ? "// Loading full source..."
    : sourceLoadError
      ? "// Unable to load full source."
      : fetchedCodeTsx ?? selectedItem.code.tsx;
  const codeLanguage =
    selectedItem.code.language === "javascript" ? "javascript" : "typescript";
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
    () => buildLivePreviewCode(editedCode),
    [editedCode]
  );
  const livePreviewRuntimeScope = useMemo(
    () => ({
      ...livePreviewScope,
      PreviewComponent: displayComponent,
    }),
    [displayComponent]
  );
  const monacoModelPath = `${selectedItem.id}.${codeLanguage === "javascript" ? "jsx" : "tsx"}`;
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
        setEditedCode(displayCodeTsx);
      }
      return !currentMode;
    });
  };

  const handleCopy = async () => {
    if (!hasFullSource) return;
    await navigator.clipboard.writeText(isEditMode ? editedCode : displayCodeTsx);
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
    setIsEditMode(false);
    setEditedCode(item.code.tsx);
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
          <div className="bg-white px-4 py-4">
            <h1 className="text-[16px] font-normal leading-[1.1] tracking-[-0.01em] text-black">
              Component Library
            </h1>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
            <div className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-y-auto pr-1">
              {showcaseItems.map((item) => {
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
          <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-black/8 bg-white">
            <div ref={previewPanelRef} className={workspaceStyles.panelScroll}>
              <div className={workspaceStyles.previewCanvas}>
                {displayComponent ? (
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
                        <style>{selectedItem.code.css}</style>
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
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleEditMode}
                disabled={!hasFullSource}
                className={`flex items-center gap-2 rounded-[2px] border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  !hasFullSource
                    ? "cursor-not-allowed border-black/8 bg-[#F5F5F5] text-black/35"
                    : isEditMode
                      ? "border-black bg-black text-white shadow-md"
                      : "border-black/8 bg-[#F5F5F5] text-black hover:bg-[#F5F5F5] hover:shadow-sm active:scale-95"
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
                className={`flex items-center gap-2 rounded-[2px] border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  !hasFullSource
                    ? "cursor-not-allowed border-black/8 bg-[#F5F5F5] text-black/35"
                    : copied
                      ? "border-black bg-black text-white shadow-md"
                      : "border-black/8 bg-[#F5F5F5] text-black hover:bg-[#F5F5F5] hover:shadow-sm active:scale-95"
                }`}
              >
                {!hasFullSource ? "Wait" : copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className={workspaceStyles.monacoEditorShell}>
              <MonacoEditor
                key={`${monacoModelPath}-${displayCodeTsx.length}-${isEditMode ? "edit" : "view"}`}
                beforeMount={handleEditorBeforeMount}
                onMount={handleEditorMount}
                height="100%"
                defaultLanguage={codeLanguage}
                language={codeLanguage}
                theme={monacoThemeName}
                path={monacoModelPath}
                value={isEditMode ? editedCode : displayCodeTsx}
                onChange={(value) => {
                  if (!isEditMode) return;
                  setEditedCode(value ?? "");
                }}
                options={codeEditorOptions}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
