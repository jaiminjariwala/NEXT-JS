"use client";

import { useEffect, useMemo, useState } from "react";
import { transform } from "@babel/standalone";
import type { ComponentCodeLanguage, ShowcaseCode } from "@/types";

type CommunitySandboxPreviewProps = {
  code: ShowcaseCode;
  name: string;
};

function stripClientDirective(source: string) {
  return source
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

function stripImports(source: string) {
  let isInsideImportBlock = false;

  return source
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

function findRenderTarget(source: string): string | null {
  const namedDefaultExport = source.match(
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/
  );
  if (namedDefaultExport) return namedDefaultExport[1];

  const namedExports = [
    ...source.matchAll(/export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)/g),
  ];
  if (namedExports.length > 0) {
    return namedExports[namedExports.length - 1][1];
  }

  const localDeclarations = [
    ...source.matchAll(/(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)/g),
  ];
  return localDeclarations.length > 0
    ? localDeclarations[localDeclarations.length - 1][1]
    : null;
}

function escapeScriptTag(source: string) {
  return source.replace(/<\/script/gi, "<\\/script");
}

function buildHtmlSandboxDocument(code: ShowcaseCode) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        min-height: 100%;
        background: #ffffff;
        color: #111111;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }

      body {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
      }

      ${code.css || ""}
    </style>
  </head>
  <body>
    ${code.html || ""}
    ${
      code.js
        ? `<script>${escapeScriptTag(code.js)}</script>`
        : ""
    }
  </body>
</html>`;
}

function buildReactSandboxDocument(
  source: string,
  css: string,
  language: ComponentCodeLanguage
) {
  const sanitizedSource = stripImports(stripClientDirective(source))
    .replace(/export\s+default\s+function\s+/g, "function ")
    .replace(/export\s+default\s+class\s+/g, "class ")
    .replace(/export\s+default\s+/g, "const __DefaultExport__ = ")
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+function\s+/g, "function ")
    .replace(/export\s+class\s+/g, "class ")
    .replace(/export\s+interface\s+[^{]+\{[\s\S]*?\}\n?/g, "")
    .replace(/export\s+type\s+[^;]+;?/g, "")
    .replace(/export\s+\{[^}]*\};?/g, "");

  const renderTarget = sanitizedSource.includes("__DefaultExport__")
    ? "__DefaultExport__"
    : findRenderTarget(sanitizedSource);

  if (!renderTarget) {
    throw new Error("Could not find a preview component to render.");
  }

  const executableSource = `
    const {
      useState,
      useEffect,
      useRef,
      useMemo,
      useCallback,
      useLayoutEffect,
      useReducer,
      useId
    } = React;

    ${sanitizedSource}

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(${renderTarget}));
  `;

  const compiled = transform(executableSource, {
    sourceType: "script",
    filename:
      language === "javascript"
        ? "community-component.jsx"
        : "community-component.tsx",
    presets: [
      ["react", { runtime: "classic" }],
      ...(language === "typescript"
        ? [["typescript", { allExtensions: true, isTSX: true }]]
        : []),
    ],
  }).code;

  if (!compiled) {
    throw new Error("Unable to compile the community component.");
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        min-height: 100%;
        background: #ffffff;
        color: #111111;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }

      body {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
      }

      #root {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100%;
      }

      ${css}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React from "https://esm.sh/react@19.2.0";
      import * as ReactDOM from "https://esm.sh/react-dom@19.2.0/client";

      window.addEventListener("error", (event) => {
        const root = document.getElementById("root");
        if (!root) return;
        root.innerHTML = '<pre style="margin:0;white-space:pre-wrap;color:#b91c1c;font:500 12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;">' + (event.error?.message || event.message || "Preview crashed.") + '</pre>';
      });

      try {
        ${escapeScriptTag(compiled)}
      } catch (error) {
        const root = document.getElementById("root");
        if (root) {
          root.innerHTML = '<pre style="margin:0;white-space:pre-wrap;color:#b91c1c;font:500 12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;">' + (error?.message || "Preview crashed.") + '</pre>';
        }
      }
    </script>
  </body>
</html>`;
}

export function CommunitySandboxPreview({
  code,
  name,
}: CommunitySandboxPreviewProps) {
  const [srcDoc, setSrcDoc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const previewSignature = useMemo(
    () =>
      JSON.stringify({
        tsx: code.tsx || "",
        js: code.js || "",
        html: code.html || "",
        css: code.css || "",
        language: code.language || "typescript",
      }),
    [code.css, code.html, code.js, code.language, code.tsx]
  );

  useEffect(() => {
    try {
      if (code.html?.trim()) {
        setSrcDoc(buildHtmlSandboxDocument(code));
        setError(null);
        return;
      }

      const primarySource = code.tsx?.trim() || code.js?.trim();
      if (!primarySource) {
        throw new Error("No previewable source code found for this component.");
      }

      setSrcDoc(
        buildReactSandboxDocument(
          primarySource,
          code.css || "",
          code.language || "typescript"
        )
      );
      setError(null);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Unable to render this community component."
      );
      setSrcDoc("");
    }
  }, [code, previewSignature]);

  if (error) {
    return (
      <div className="flex w-full max-w-[560px] flex-col rounded-[24px] border border-[#efc7c7] bg-white px-5 py-4 text-left">
        <div className="text-[13px] font-medium text-[#991b1b]">Sandbox preview error</div>
        <div className="mt-2 text-[12px] leading-6 text-[#b91c1c]">{error}</div>
      </div>
    );
  }

  return (
    <iframe
      title={`${name} sandbox preview`}
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      className="h-full min-h-[420px] w-full border-0 bg-white"
    />
  );
}
