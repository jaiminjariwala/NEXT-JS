"use client";

import { useEffect, useMemo, useState } from "react";
import type { ShowcaseAssetEntry } from "@/types";

type AssetsPanelProps = {
  entries: ShowcaseAssetEntry[];
  topInset?: number;
  rootLabel?: string;
};

function sortEntries(entries: ShowcaseAssetEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "folder" ? -1 : 1;
    }

    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
}

function GlassFolderGlyph() {
  return (
    <div className="relative h-[18px] w-[22px] shrink-0">
      <div
        className="absolute left-0 top-[3px] h-[4px] w-[8px] rounded-t-[3px] bg-[#8fd7f8]"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[14px] rounded-[4px] bg-gradient-to-b from-[#78cff7] via-[#60c0ec] to-[#49afdf]"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 2px rgba(12,40,63,0.18)" }}
      />
      <div
        className="absolute left-[3px] top-[5px] h-[8px] w-[6px] rounded-[2px] border border-white/80 bg-[#f7f5ea]"
        style={{ transform: "rotate(-8deg)" }}
      />
      <div
        className="absolute right-[4px] top-[4px] h-[9px] w-[7px] rounded-[2px] border border-white/80 bg-[#f7f5ea]"
        style={{ transform: "rotate(8deg)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[10px] rounded-[4px] bg-gradient-to-b from-[#76c8ef] via-[#60bbe7] to-[#4eaedd] opacity-95"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.32)" }}
      />
    </div>
  );
}

function FileGlyph({ entry }: { entry: ShowcaseAssetEntry }) {
  const extension = entry.name.split(".").pop()?.toUpperCase() ?? "FILE";
  const accent =
    extension === "PNG" || extension === "JPG" || extension === "JPEG"
      ? "bg-[#5dbb67]"
      : extension === "TTF" || extension === "OTF"
        ? "bg-[#7a6bff]"
        : extension === "TXT"
          ? "bg-[#9aa3af]"
          : "bg-[#6f97d9]";

  return (
    <div className="relative flex h-[18px] w-[15px] shrink-0 items-end">
      <div className="absolute inset-0 rounded-[3px] border border-black/10 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]" />
      <div className="absolute right-0 top-0 h-[5px] w-[5px] rounded-tr-[3px] border-l border-b border-black/10 bg-[#eef1f5]" />
      <div className={`relative mx-auto mb-[2px] rounded-[999px] px-[3px] py-[1px] text-[7px] font-semibold leading-none text-white ${accent}`}>
        {extension.slice(0, 3)}
      </div>
    </div>
  );
}

export function AssetsPanel({
  entries,
  topInset = 72,
  rootLabel = "public",
}: AssetsPanelProps) {
  const [folderStack, setFolderStack] = useState<ShowcaseAssetEntry[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  useEffect(() => {
    setFolderStack([]);
    setSelectedFilePath(null);
  }, [entries]);

  const currentFolderEntries = useMemo(() => {
    const activeEntries = folderStack.length
      ? folderStack[folderStack.length - 1]?.children ?? []
      : entries;

    return sortEntries(activeEntries);
  }, [entries, folderStack]);

  const breadcrumbs = useMemo(() => {
    const fileEntry = currentFolderEntries.find((entry) => entry.path === selectedFilePath);
    return [
      { key: rootLabel, label: rootLabel, folderDepth: 0 },
      ...folderStack.map((entry, index) => ({
        key: entry.path,
        label: entry.name,
        folderDepth: index + 1,
      })),
      ...(fileEntry
        ? [
            {
              key: fileEntry.path,
              label: fileEntry.name,
              folderDepth: -1,
            },
          ]
        : []),
    ];
  }, [currentFolderEntries, folderStack, rootLabel, selectedFilePath]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white" style={{ paddingTop: topInset }}>
      <div className="min-h-0 flex-1 px-4 pb-4">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-black/8 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-[minmax(0,1fr)_190px] border-b border-black/8 bg-[#fafafa] px-4 py-2 text-[12px] font-medium leading-none text-black/48">
            <div>Name</div>
            <div>Kind</div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {currentFolderEntries.length ? (
              currentFolderEntries.map((entry) => {
                const isSelected = selectedFilePath === entry.path;

                return (
                  <button
                    key={entry.path}
                    type="button"
                    onClick={() => {
                      if (entry.type === "folder") {
                        setFolderStack((current) => [...current, entry]);
                        setSelectedFilePath(null);
                        return;
                      }

                      setSelectedFilePath(entry.path);
                    }}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_190px] items-center gap-4 border-b border-black/6 px-4 py-[9px] text-left transition-colors ${
                      isSelected ? "bg-[#eef4ff]" : "hover:bg-[#f7f8fa]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {entry.type === "folder" ? (
                        <GlassFolderGlyph />
                      ) : (
                        <FileGlyph entry={entry} />
                      )}
                      <span className="truncate text-[14px] leading-[1.2] text-black/88">
                        {entry.name}
                      </span>
                    </div>
                    <div className="truncate text-[13px] leading-[1.2] text-black/48">
                      {entry.kind}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex h-full min-h-[180px] items-center justify-center px-6 text-center text-[14px] leading-[1.5] text-black/45">
                No assets in this folder.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-black/8 bg-[#fafafa] px-4 py-3">
        <div className="flex flex-wrap items-center gap-1 text-[12px] leading-[1.2] text-black/48">
          {breadcrumbs.map((crumb, index) => {
            const isFileCrumb = crumb.folderDepth === -1;

            return (
              <div key={crumb.key} className="flex items-center gap-1">
                {index > 0 ? <span className="text-black/28">/</span> : null}
                <button
                  type="button"
                  disabled={isFileCrumb}
                  onClick={() => {
                    if (crumb.folderDepth < 0) {
                      return;
                    }

                    setFolderStack((current) => current.slice(0, crumb.folderDepth));
                    setSelectedFilePath(null);
                  }}
                  className={`rounded-md px-[6px] py-[3px] transition-colors ${
                    isFileCrumb
                      ? "cursor-default bg-white text-black/72 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                      : "hover:bg-white hover:text-black/72"
                  }`}
                >
                  {crumb.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
