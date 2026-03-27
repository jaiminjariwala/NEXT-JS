"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { createPortal } from "react-dom";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { BaseModal } from "@/components/BaseModal";
import { showcaseItems } from "@/data/componentsData";
import modalStyles from "./CodeModal.module.css";

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: { tsx: string; css: string };
  componentName: string;
  component?: React.ComponentType;
}

const codeFontFamily =
  '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace';
const codeEditorPaddingTop = 72;
const codeEditorPaddingBottom = 28;

const { Copy, Check, Pencil, ArrowLeft, X } = LucideIcons;
const monacoThemeName = "component-library-light";

const livePreviewScope = {
  ...React,
  React,
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
  codeModalStyles: modalStyles,
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

// ─── Main CodeModal ───────────────────────────────────────────────────────────

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  code,
  componentName,
  component: Component,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  // ── Edit mode state ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState(code.tsx);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<Parameters<MonacoOnMount>[0] | null>(null);

  const displayComponent = Component;
  const displayCode = code;
  const isLanyardPreview = componentName === "Employee ID Card Lanyard";
  const previewScale =
    componentName === "Figma Canvas"
      ? 0.9
      : isLanyardPreview
        ? 1
        : 0.7;
  const previewContentStyle = isLanyardPreview
    ? ({
        ["--preview-scale" as string]: 1,
        ["--preview-content-width" as string]: "100%",
        ["--preview-content-height" as string]: "100%",
        ["--hire-r3f-width" as string]: "100%",
        ["--hire-r3f-height" as string]: "100%",
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
  const monacoModelPath = `${componentName
    .toLowerCase()
    .replace(/\s+/g, "-")}.tsx`;
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
    if (!isEditMode) return;

    requestAnimationFrame(() => {
      monacoEditorRef.current?.focus();
    });
  }, [isEditMode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      isEditMode ? editedCode : displayCode.tsx
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const width = scrollContainerRef.current.offsetWidth;
    setActiveView(scrollLeft < width / 2 ? "preview" : "code");
  };

  const scrollToView = (view: "preview" | "code") => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.offsetWidth;
    scrollContainerRef.current.scrollTo({
      left: view === "preview" ? 0 : width,
      behavior: "smooth",
    });
  };

  const toggleEditMode = () => {
    setIsEditMode((currentMode) => !currentMode);
  };

  const handleEditorBeforeMount: MonacoBeforeMount = (monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowJs: true,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      strict: false,
      noEmit: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
      noSyntaxValidation: true,
    });
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

  const handleModalClose = () => {
    setCopied(false);
    setIsEditMode(false);
    setEditedCode(displayCode.tsx);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidth="max-w-7xl"
      maxHeight="h-[88vh] max-h-[90vh]"
      verticalPosition="center"
      showHeader={false}
      shouldPreventDrag={(target) =>
        !!target.closest("button") ||
        !!target.closest(`.${modalStyles.scrollableCodeArea}`) ||
        !!target.closest(`.${modalStyles.componentPreview}`) ||
        !!target.closest(`.${modalStyles.monacoEditorShell}`)
      }
    >
      <div
        className="flex-1 px-6 pt-6 pb-6 z-10 relative overflow-hidden"
        style={{ minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        {/* Mobile dots */}
        {displayComponent && (
          <div className="md:hidden flex justify-center gap-2 mb-4">
            {(["preview", "code"] as const).map((v) => (
              <button
                key={v}
                onClick={() => scrollToView(v)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeView === v ? "bg-black w-6" : "bg-gray-300 w-2"
                }`}
                aria-label={`View ${v}`}
              />
            ))}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex flex-row md:gap-4 flex-1 min-h-0 md:overflow-x-visible snap-x snap-mandatory scroll-smooth ${modalStyles.hideScrollbar}`}
          style={{ overflowX: "auto" }}
        >
          {/* ── Preview panel ── */}
          {displayComponent && (
            <div
              className={`${modalStyles.componentPreview} ${modalStyles.mobileFullWidth}`}
              style={{
                position: "relative",
                borderRadius: "32px",
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: "inset 0 4px 12px rgba(0,0,0,0.03)",
                padding: "0.75rem",
                minHeight: "240px",
                overflow: "hidden",
                scrollSnapAlign: "start",
              }}
            >
              <div className="absolute top-4 left-6 z-30 flex items-center gap-3">
                <h2 className="text-[1rem] font-semibold tracking-[0.02em] text-black md:text-[1.125rem]">
                  {componentName}
                </h2>
                <span className="px-3 py-1 rounded-lg bg-white/70 backdrop-blur-md border border-white/60 text-[10px] font-medium uppercase tracking-widest text-black">
                  preview
                </span>
                {isEditMode && (
                  <span className="px-3 py-1 rounded-lg bg-black text-white border border-black text-[10px] font-medium uppercase tracking-widest">
                    live
                  </span>
                )}
              </div>

              <div className={modalStyles.previewStage}>
                {isEditMode && livePreviewCode ? (
                  <LiveProvider
                    code={livePreviewCode}
                    scope={livePreviewRuntimeScope}
                    noInline={true}
                    enableTypeScript={true}
                  >
                    <style>{displayCode.css}</style>
                    <LivePreview
                      Component="div"
                      className={modalStyles.livePreviewContent}
                      style={previewContentStyle}
                    />
                    <LiveError className={modalStyles.livePreviewError} />
                  </LiveProvider>
                ) : (
                  <div
                    className={modalStyles.previewStaticContent}
                    style={previewContentStyle}
                  >
                    {React.createElement(displayComponent)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Code panel ── */}
          <div
            className={`${modalStyles.mobileFullWidth}`}
            style={{
              position: "relative",
              flex: 1,
              minHeight: 0,
              borderRadius: "32px",
              background: "rgba(255,255,255,0.01)",
              border: isEditMode
                ? "1.5px solid rgba(0,0,0,0.12)"
                : "1px solid rgba(255,255,255,0.4)",
              boxShadow: "inset 0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              scrollSnapAlign: "start",
              overflow: "hidden",
            }}
          >
            {/* tsx / edit label */}
            <div className="absolute top-4 left-6 z-30 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-white/70 backdrop-blur-md border border-white/60 text-[10px] font-medium uppercase tracking-widest text-black">
                tsx
              </span>
              {isEditMode && (
                <span className="px-3 py-1 rounded-lg bg-black text-white border border-black text-[10px] font-medium uppercase tracking-widest">
                  editing
                </span>
              )}
            </div>

            {/* Top-right toolbar */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              {/* Edit / Back toggle */}
              <button
                onClick={toggleEditMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 border ${
                  isEditMode
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-white/80 text-black border-white shadow-sm hover:bg-white hover:shadow-md active:scale-95"
                }`}
              >
                {isEditMode ? (
                  <>
                    <ArrowLeft size={13} strokeWidth={2.5} /> Back
                  </>
                ) : (
                  <>
                    <Pencil size={13} strokeWidth={2.5} /> Edit
                  </>
                )}
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 border ${
                  copied
                    ? "bg-black text-white border-black scale-95 shadow-md"
                    : "bg-white/80 text-black border-white shadow-sm hover:bg-white hover:shadow-md active:scale-95"
                }`}
              >
                {copied ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={handleModalClose}
                className="flex items-center justify-center px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 border bg-white/80 text-black border-white shadow-sm hover:bg-white hover:shadow-md active:scale-95"
                aria-label="Close code modal"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <div
              className={`${modalStyles.monacoEditorShell} ${modalStyles.scrollableCodeArea}`}
            >
              <MonacoEditor
                beforeMount={handleEditorBeforeMount}
                onMount={handleEditorMount}
                height="100%"
                defaultLanguage="typescript"
                language="typescript"
                theme={monacoThemeName}
                path={monacoModelPath}
                value={isEditMode ? editedCode : displayCode.tsx}
                onChange={(value) => {
                  if (!isEditMode) return;
                  setEditedCode(value ?? "");
                }}
                options={codeEditorOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
