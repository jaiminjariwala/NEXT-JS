"use client";

import { useEffect, useRef, useState } from "react";
import { useContactDraft } from "@/components/ContactDraftContext";

function getFileExt(name = "") {
  const parts = name.split(".");
  if (parts.length < 2) return "FILE";
  return parts.pop().toUpperCase();
}

// macOS Finder style: "IMG_090…4.jpeg"
function finderName(name = "", startChars = 7, endChars = 6) {
  if (name.length <= startChars + endChars + 1) return name;
  return name.slice(0, startChars) + "\u2026" + name.slice(name.length - endChars);
}

function isPdfAttachment(file) {
  const ext = getFileExt(file?.name || "").toLowerCase();
  return file?.type === "application/pdf" || ext === "pdf";
}

function isWordAttachment(file) {
  const ext = getFileExt(file?.name || "").toLowerCase();
  return (
    ext === "doc" ||
    ext === "docx" ||
    file?.type === "application/msword" ||
    file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function ensurePromiseWithResolversPolyfill() {
  if (typeof Promise.withResolvers === "function") return;
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

function AttachmentPreview({ attachment }) {
  const [pdfThumb, setPdfThumb] = useState("");
  const [pdfError, setPdfError] = useState(false);
  const [docHtml, setDocHtml] = useState("");
  const [docError, setDocError] = useState(false);
  const isPdf = isPdfAttachment(attachment.file);
  const isWord = isWordAttachment(attachment.file);

  useEffect(() => {
    let active = true;

    const renderPdfPreview = async () => {
      if (!isPdf) {
        setPdfThumb("");
        setPdfError(false);
        return;
      }

      try {
        ensurePromiseWithResolversPolyfill();
        let pdfjs;
        try {
          pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        } catch {
          pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        }

        if (pdfjs?.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const buffer = await attachment.file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = 320;
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
        if (!context) throw new Error("Canvas context unavailable");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport, intent: "display" }).promise;

        if (!active) return;
        setPdfThumb(canvas.toDataURL("image/jpeg", 0.9));
        setPdfError(false);
      } catch {
        if (!active) return;
        setPdfError(true);
      }
    };

    renderPdfPreview();
    return () => {
      active = false;
    };
  }, [attachment.file, attachment.id, isPdf]);

  useEffect(() => {
    let active = true;

    const renderWordPreview = async () => {
      if (!isWord) return;

      try {
        const mammoth = await import("mammoth/mammoth.browser.js");
        const buffer = await attachment.file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (!active) return;
        const html = String(result.value || "").trim();
        setDocHtml(html);
        setDocError(false);
      } catch {
        if (!active) return;
        setDocError(true);
      }
    };

    renderWordPreview();
    return () => {
      active = false;
    };
  }, [attachment.file, attachment.id, isWord]);

  if (attachment.isImage && attachment.previewUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.previewUrl}
        alt={attachment.file.name}
        draggable={false}
        className="h-full w-full object-cover"
      />
    );
  }

  if (isPdf && pdfThumb) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pdfThumb}
        alt={attachment.file.name}
        draggable={false}
        className="h-full w-full object-contain bg-white"
      />
    );
  }

  if (isPdf && !pdfError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-[11px] font-medium text-[#6a7280]">
        Loading...
      </div>
    );
  }

  if (isWord) {
    if (docHtml && !docError) {
      return (
        <div className="h-full w-full overflow-hidden bg-white">
          <div
            className="doc-thumb-render origin-top-left w-[260%] scale-[0.385] text-[#1f2329]"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        </div>
      );
    }

    if (!docError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-white text-[11px] font-medium text-[#6a7280]">
          Loading...
        </div>
      );
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#f5f6f8] to-[#e0e4ea]">
      <span className="rounded-[6px] bg-white px-[10px] py-[4px] text-[12px] font-semibold tracking-[0.04em] text-[#5d6470]">
        {getFileExt(attachment.file.name)}
      </span>
    </div>
  );
}

// ── shared hand-hint helpers ────────────────────────────────────────────────
function _hhPause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function _hhAnim(el, kf, opts) {
  return new Promise((resolve) => {
    const a = el.animate(kf, opts);
    a.onfinish = resolve;
    a.oncancel = resolve;
  });
}
// Quadratic Bezier: P0=start, P1=control, P2=end, t∈[0,1]
function _hhQBez(P0, P1, P2, t) {
  const m = 1 - t;
  return { x: m * m * P0.x + 2 * m * t * P1.x + t * t * P2.x, y: m * m * P0.y + 2 * m * t * P1.y + t * t * P2.y };
}
// Build keyframes that follow the bezier arc (half-U curve)
function _hhArcFrames(P0, P1, P2, steps = 8) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = _hhQBez(P0, P1, P2, i / steps);
    return { transform: `translate(${p.x}px, ${p.y}px)` };
  });
}

// ── First-visit hand cursor hint for Add file button ────────────────────────
function AddFileHint({ addFileBtnRef, sentinelRef }) {
  const cursorRef = useRef(null);
  const deadRef = useRef(false);
  const [active, setActive] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [pos, setPos] = useState(null);

  const dismiss = () => {
    deadRef.current = true;
    setShowTip(false);
    setActive(false);
    try {
      localStorage.setItem("cp-hint-seen", "1");
    } catch {}
  };

  useEffect(() => {
    try {
      if (localStorage.getItem("cp-hint-seen")) return;
    } catch {
      return;
    }
    const t = setTimeout(() => {
      const btn = addFileBtnRef?.current;
      const sen = sentinelRef?.current;
      if (!btn || !sen) return;
      const r = btn.getBoundingClientRect();
      const s = sen.getBoundingClientRect();
      const tx = r.left + r.width * 0.28;
      const ty = r.top + r.height * 0.5;
      const P0 = { x: tx + 130, y: ty + 90 };
      const P1 = { x: tx + 30, y: ty + 110 };
      const P2 = { x: tx, y: ty };
      setPos({ P0, P1, P2, tx, ty, ttx: r.left, tty: s.top + 10 });
      setActive(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [addFileBtnRef, sentinelRef]);

  useEffect(() => {
    if (!active) return;
    const btn = addFileBtnRef?.current;
    if (!btn) return;
    btn.addEventListener("mouseenter", dismiss);
    return () => btn.removeEventListener("mouseenter", dismiss);
  }, [active, addFileBtnRef]);

  useEffect(() => {
    if (!active || !pos) return;
    deadRef.current = false;
    const cursor = cursorRef.current;
    if (!cursor) return;
    const { P0, P1, P2, tx, ty } = pos;
    (async () => {
      cursor.style.opacity = "0";
      cursor.style.transform = `translate(${P0.x}px, ${P0.y}px)`;
      await _hhPause(40);
      if (deadRef.current) return;
      await _hhAnim(cursor, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });
      if (deadRef.current) return;
      await _hhAnim(cursor, _hhArcFrames(P0, P1, P2, 8), { duration: 900, easing: "ease-in-out", fill: "forwards" });
      if (deadRef.current) return;
      await _hhAnim(
        cursor,
        [{ transform: `translate(${tx}px,${ty}px) scale(1)` }, { transform: `translate(${tx}px,${ty + 5}px) scale(0.82)` }],
        { duration: 100, easing: "ease-in", fill: "forwards" }
      );
      if (deadRef.current) return;
      setShowTip(true);
      await _hhAnim(
        cursor,
        [{ transform: `translate(${tx}px,${ty + 5}px) scale(0.82)` }, { transform: `translate(${tx}px,${ty}px) scale(1)` }],
        { duration: 130, easing: "ease-out", fill: "forwards" }
      );
      if (deadRef.current) return;
      await _hhPause(2800);
      if (deadRef.current) return;
      setShowTip(false);
      await _hhAnim(cursor, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" });
      setActive(false);
      try {
        localStorage.setItem("cp-hint-seen", "1");
      } catch {}
    })();
    return () => {
      deadRef.current = true;
    };
  }, [active, pos]);

  if (!active || !pos) return null;
  return (
    <>
      <style>{`@keyframes hh-in{from{opacity:0;transform:translateY(5px) scale(0.94)}to{opacity:1;transform:none}}`}</style>
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: "none",
          userSelect: "none",
          willChange: "transform,opacity",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.30))",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hand-cursor.png" alt="" draggable={false} style={{ width: "34px", height: "auto", display: "block" }} />
      </div>
      {showTip && (
        <div
          aria-hidden="true"
          style={{ position: "fixed", top: pos.tty, left: pos.ttx, zIndex: 9999, pointerEvents: "none", whiteSpace: "nowrap", animation: "hh-in 0.2s ease forwards" }}
          className="rounded-[4px] bg-white/95 px-3 py-2 text-[18px] leading-[1.3] tracking-[-0.01em] text-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.16)] md:text-[15px]"
        >
          Try adding photos or files
        </div>
      )}
    </>
  );
}

// ── Sending: 3 pulsing dots (grow+darken left→right) ──
function SendingDots() {
  return (
    <span
      aria-label="Sending"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        height: "1em",
        verticalAlign: "middle",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.55)",
            animation: `cp-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes cp-dot-pulse {
          0%,100% { transform: scale(0.6);  background-color: rgba(255,255,255,0.45); }
          50%      { transform: scale(1.35); background-color: rgba(255,255,255,1);    }
        }
      `}</style>
    </span>
  );
}

// ── Sent: text pops in from a tiny point via GSAP (with CSS fallback) ──
function SentText() {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let tween;

    import("gsap")
      .then(({ gsap }) => {
        // GSAP is installed — use it
        tween = gsap.fromTo(
          el,
          { scale: 0.05, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.42, ease: "back.out(2.2)", clearProps: "all" }
        );
      })
      .catch(() => {
        // GSAP not installed — fall back to CSS keyframe animation
        el.style.animation = "cp-sent-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards";
      });

    return () => tween?.kill();
  }, []);

  return (
    <>
      <style>{`
        @keyframes cp-sent-pop {
          from { transform: scale(0.05); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
      <span ref={elRef} style={{ display: "inline-block", opacity: 0 }}>
        Sent
      </span>
    </>
  );
}

export default function ContactPage() {
  const { message, setMessage, attachments, setAttachments } = useContactDraft();
  const [from, setFrom] = useState("");
  const [fromError, setFromError] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sentinelRef = useRef(null);
  const fileInputRef = useRef(null);
  const addFileBtnRef = useRef(null);
  const attachmentsStripRef = useRef(null);
  const attachmentsDragRef = useRef({
    dragging: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const [isDraggingAttachments, setIsDraggingAttachments] = useState(false);
  const MIN_LINES = 5;
  const [lineCount, setLineCount_] = useState(MIN_LINES);
  const [allMessageSelected, setAllMessageSelected] = useState(false);
  const lineCountRef = useRef(MIN_LINES);
  const lineRefs = useRef([]);
  const linesContainerRef = useRef(null);
  const allMessageSelectedRef = useRef(false);
  const updateMessageFromDOMRef = useRef(null);
  const reflowLinesForCurrentWidthRef = useRef(null);
  const setLineCount = (n) => {
    const val = typeof n === "function" ? n(lineCountRef.current) : n;
    lineCountRef.current = val;
    setLineCount_(val);
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fromHasText = from.length > 0;
  const fromIsInvalidFormat = fromHasText && !EMAIL_RE.test(from.trim());

  // ── Line editor helpers ──
  const getCaretOffset = (el) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length;
  };

  const setCaretOffset = (el, offset) => {
    if (!el) return;
    el.focus();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let remaining = offset;
    let node;
    while ((node = walker.nextNode())) {
      const len = node.textContent?.length ?? 0;
      if (remaining <= len) {
        const range = document.createRange();
        range.setStart(node, remaining);
        range.collapse(true);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(range);
        return;
      }
      remaining -= len;
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  };

  const updateMessageFromDOM = () => {
    const parts = [];
    for (let j = 0; j < lineCountRef.current; j++) {
      parts.push(lineRefs.current[j]?.innerText ?? "");
    }
    const msg = parts.join("\n");
    setMessage(msg);
    return msg;
  };

  const setWholeMessageSelected = (value) => {
    allMessageSelectedRef.current = value;
    setAllMessageSelected(value);
  };

  const selectAllMessageLines = () => {
    setWholeMessageSelected(true);
  };

  const scrollLineIntoView = (lineEl) => {
    const container = linesContainerRef.current;
    if (!container || !lineEl) return;
    const row = lineEl.closest(".cp-line-row") ?? lineEl;
    const rowRect = row.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    if (rowRect.bottom > contRect.bottom) {
      container.scrollTop += rowRect.bottom - contRect.bottom + 2;
    } else if (rowRect.top < contRect.top) {
      container.scrollTop -= contRect.top - rowRect.top + 2;
    }
  };

  const clearEditor = () => {
    for (let j = 0; j < lineCountRef.current; j++) {
      if (lineRefs.current[j]) lineRefs.current[j].innerText = "";
    }
    setLineCount(MIN_LINES);
    setMessage("");
    setWholeMessageSelected(false);
  };

  const splitOverflowLine = (i, el) => {
    if (el.scrollWidth <= el.offsetWidth) return;
    const fullText = el.innerText ?? "";
    // binary search for the last char that fits
    let lo = 0;
    let hi = fullText.length;
    while (lo < hi - 1) {
      const mid = Math.floor((lo + hi) / 2);
      el.innerText = fullText.slice(0, mid);
      if (el.scrollWidth > el.offsetWidth) hi = mid;
      else lo = mid;
    }
    // try to break at last word boundary
    const breakAt = fullText.lastIndexOf(" ", lo);
    const splitAt = breakAt > 0 ? breakAt + 1 : lo;
    const before = fullText.slice(0, splitAt).trimEnd();
    const after = fullText.slice(splitAt);
    el.innerText = before;
    const n = lineCountRef.current;
    const savedAfter = [];
    for (let j = i + 1; j < n; j++) savedAfter.push(lineRefs.current[j]?.innerText ?? "");
    const newCount = Math.max(n + 1, MIN_LINES, i + 2);
    setLineCount(newCount);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (lineRefs.current[i + 1]) {
          lineRefs.current[i + 1].innerText = after + (savedAfter[0] ? " " + savedAfter[0] : "");
        }
        savedAfter.slice(1).forEach((t, idx) => {
          if (lineRefs.current[i + 2 + idx]) lineRefs.current[i + 2 + idx].innerText = t;
        });
        if (lineRefs.current[i + 1]) {
          setCaretOffset(lineRefs.current[i + 1], after.length);
          scrollLineIntoView(lineRefs.current[i + 1]);
          // recurse in case new line also overflows
          if (lineRefs.current[i + 1].scrollWidth > lineRefs.current[i + 1].offsetWidth) {
            splitOverflowLine(i + 1, lineRefs.current[i + 1]);
          }
        }
        updateMessageFromDOM();
      })
    );
  };

  const reflowLinesForCurrentWidth = () => {
    for (let i = 0; i < lineCountRef.current; i += 1) {
      const el = lineRefs.current[i];
      if (!el) continue;
      if (el.scrollWidth > el.offsetWidth) {
        splitOverflowLine(i, el);
        return true;
      }
    }
    return false;
  };

  updateMessageFromDOMRef.current = updateMessageFromDOM;
  reflowLinesForCurrentWidthRef.current = reflowLinesForCurrentWidth;

  const handleLineInput = (i, e) => {
    setWholeMessageSelected(false);
    const el = e.currentTarget;
    const rawText = el.innerText ?? "";
    if (rawText.includes("\n")) {
      const parts = rawText.split("\n");
      el.innerText = parts[0];
      const extraLines = parts.slice(1);
      const n = lineCountRef.current;
      const savedAfter = [];
      for (let j = i + 1; j < n; j++) savedAfter.push(lineRefs.current[j]?.innerText ?? "");
      setLineCount(Math.max(n + extraLines.length, MIN_LINES, i + 1 + extraLines.length));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          extraLines.forEach((part, idx) => {
            if (lineRefs.current[i + 1 + idx]) lineRefs.current[i + 1 + idx].innerText = part;
          });
          savedAfter.forEach((t, idx) => {
            if (lineRefs.current[i + 1 + extraLines.length + idx]) lineRefs.current[i + 1 + extraLines.length + idx].innerText = t;
          });
          const lastEl = lineRefs.current[i + extraLines.length];
          if (lastEl) {
            setCaretOffset(lastEl, (extraLines[extraLines.length - 1] ?? "").length);
            scrollLineIntoView(lastEl);
          }
          const msg = updateMessageFromDOM();
          if (messageError && msg.replace(/\n/g, "").trim()) setMessageError(false);
        })
      );
      return;
    }
    // check overflow and auto-wrap
    if (el.scrollWidth > el.offsetWidth) {
      splitOverflowLine(i, el);
      return;
    }
    const msg = updateMessageFromDOM();
    if (messageError && msg.replace(/\n/g, "").trim()) setMessageError(false);
  };

  const handleLineKeyDown = (i, e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      selectAllMessageLines();
      return;
    }

    if (allMessageSelectedRef.current && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      clearEditor();
      requestAnimationFrame(() => {
        lineRefs.current[0]?.focus();
      });
      return;
    }

    if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key !== "Shift") {
      setWholeMessageSelected(false);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const el = lineRefs.current[i];
      if (!el) return;
      const offset = getCaretOffset(el);
      const text = el.innerText ?? "";
      const before = text.slice(0, offset);
      const after = text.slice(offset);
      const n = lineCountRef.current;
      el.innerText = before;
      const savedAfter = [];
      for (let j = i + 1; j < n; j++) savedAfter.push(lineRefs.current[j]?.innerText ?? "");
      // only add 1 new line, never jump by more
      const newN = Math.max(n, i + 2);
      setLineCount(newN);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (lineRefs.current[i + 1]) lineRefs.current[i + 1].innerText = after;
          savedAfter.forEach((t, idx) => {
            if (lineRefs.current[i + 2 + idx]) lineRefs.current[i + 2 + idx].innerText = t;
          });
          if (lineRefs.current[i + 1]) {
            setCaretOffset(lineRefs.current[i + 1], 0);
            scrollLineIntoView(lineRefs.current[i + 1]);
          }
          updateMessageFromDOM();
        })
      );
      return;
    }
    if (e.key === "Backspace") {
      const el = lineRefs.current[i];
      if (!el) return;
      const offset = getCaretOffset(el);
      if (offset === 0 && i > 0) {
        e.preventDefault();
        const prevEl = lineRefs.current[i - 1];
        const prevText = prevEl?.innerText ?? "";
        const currText = el.innerText ?? "";
        const merged = prevText + currText;
        const n = lineCountRef.current;
        const savedAfter = [];
        for (let j = i + 1; j < n; j++) savedAfter.push(lineRefs.current[j]?.innerText ?? "");
        setLineCount(Math.max(MIN_LINES, n - 1));
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (prevEl) {
              prevEl.innerText = merged;
              setCaretOffset(prevEl, prevText.length);
              scrollLineIntoView(prevEl);
            }
            savedAfter.forEach((t, idx) => {
              if (lineRefs.current[i + idx]) lineRefs.current[i + idx].innerText = t;
            });
            updateMessageFromDOM();
          })
        );
        return;
      }
    }
    if (e.key === "ArrowUp" && i > 0) {
      e.preventDefault();
      lineRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowDown" && i < lineCountRef.current - 1) {
      e.preventDefault();
      lineRefs.current[i + 1]?.focus();
    }
  };

  const compressImage = (file) =>
    new Promise((resolve) => {
      const MAX_PX = 1920;
      const QUALITY = 0.85;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { naturalWidth: w, naturalHeight: h } = img;
        // skip compression if already small enough
        if (w <= MAX_PX && h <= MAX_PX && file.size < 1.5 * 1024 * 1024) {
          resolve(file);
          return;
        }
        const scale = Math.min(1, MAX_PX / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // keep original filename, use jpeg mime
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/jpeg",
          QUALITY
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });

  const onFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    event.target.value = "";

    const processed = await Promise.all(
      files.map(async (file, index) => {
        const isImage = file.type.startsWith("image/");
        const finalFile = isImage ? await compressImage(file) : file;
        return {
          id: `${file.name}-${file.size}-${Date.now()}-${index}`,
          file: finalFile,
          isImage,
          previewUrl: isImage ? URL.createObjectURL(finalFile) : "",
        };
      })
    );

    setAttachments((prev) => [...prev, ...processed]);
    if (messageError) setMessageError(false);
  };

  const removeAttachment = (idToRemove) => {
    setAttachments((prev) => {
      const toRemove = prev.find((att) => att.id === idToRemove);
      if (toRemove?.previewUrl) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((att) => att.id !== idToRemove);
    });
  };

  useEffect(() => {
    if (attachments.length === 0 && isDialogOpen) {
      setIsDialogOpen(false);
    }
  }, [attachments.length, isDialogOpen]);

  useEffect(() => {
    if (attachments.length === 0) return;

    let cancelled = false;

    const runReflow = () => {
      if (cancelled) return;
      const changed = reflowLinesForCurrentWidthRef.current?.();
      if (changed) {
        requestAnimationFrame(runReflow);
      } else {
        updateMessageFromDOMRef.current?.();
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(runReflow);
    });

    return () => {
      cancelled = true;
    };
  }, [attachments.length]);

  const clearAllAttachments = () => {
    setAttachments((prev) => {
      prev.forEach((att) => {
        if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
      });
      return [];
    });
  };

  const onFromChange = (e) => {
    const val = e.target.value;
    setFrom(val);
    if (fromError && EMAIL_RE.test(val.trim())) setFromError("");
  };

  const onFromBlur = () => {
    if (from.trim() && !EMAIL_RE.test(from.trim())) {
      setFromError("Please enter a valid email address.");
    }
  };

  const onSend = async () => {
    if (!from.trim()) {
      setFromError("Please enter a valid email address.");
      setError("");
      return;
    }

    if (from.trim() && !EMAIL_RE.test(from.trim())) {
      setFromError("Please enter a valid email address.");
      setError("");
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      setMessageError(true);
      setError("");
      return;
    }

    setMessageError(false);
    setError("");
    setSending(true);
    setSent(false);

    // Abort the request after 60 s so the Send button never stays stuck forever.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const formData = new FormData();
      formData.set("from", from.trim());
      formData.set("message", message.trim());
      attachments.forEach((att) => {
        formData.append("attachments", att.file);
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const backendError = String(payload.error || "");
        if (
          backendError === "From email is required." ||
          backendError === "Please enter a valid email in From."
        ) {
          setFromError("Please enter a valid email address.");
          setError("");
          return;
        }
        setError(backendError || "Unable to send right now. Please try again.");
        return;
      }

      clearEditor();
      clearAllAttachments();
      setIsDialogOpen(false);
      setSent(true);
      setTimeout(() => setSent(false), 2200);
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("Request timed out — try with fewer or smaller attachments.");
      } else {
        setError("Unable to send right now. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setSending(false);
    }
  };

  const onCancel = () => {
    setFrom("");
    setFromError("");
    setMessageError(false);
    clearEditor();
    clearAllAttachments();
    setError("");
    setSent(false);
    setIsDialogOpen(false);
  };

  const stopAttachmentsDrag = () => {
    if (!attachmentsDragRef.current.dragging) return;
    attachmentsDragRef.current.dragging = false;
    setIsDraggingAttachments(false);
  };

  const onAttachmentsMouseDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("button")) return;

    const strip = attachmentsStripRef.current;
    if (!strip) return;

    attachmentsDragRef.current.dragging = true;
    attachmentsDragRef.current.startX = event.clientX;
    attachmentsDragRef.current.startScrollLeft = strip.scrollLeft;
    setIsDraggingAttachments(true);
    event.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      const strip = attachmentsStripRef.current;
      if (!strip || !attachmentsDragRef.current.dragging) return;

      const deltaX = event.clientX - attachmentsDragRef.current.startX;
      strip.scrollLeft = attachmentsDragRef.current.startScrollLeft - deltaX;
      event.preventDefault();
    };

    const handleMouseUp = () => {
      stopAttachmentsDrag();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!isDialogOpen) {
      stopAttachmentsDrag();
    }
  }, [isDialogOpen]);

  return (
    <>
      {/* Desktop overrides — bypasses Tailwind JIT for guaranteed rendering */}
      <style>{`
        .cp-from-input::placeholder,
        .cp-textarea::placeholder {
          -webkit-text-stroke: 0 transparent !important;
        }

        .cp-from-input::selection,
        .cp-line-inner::selection {
          background: #73c951 !important;
          color: #000000 !important;
        }

        .cp-from-input::-moz-selection,
        .cp-line-inner::-moz-selection {
          background: #73c951 !important;
          color: #000000 !important;
        }

        .doc-thumb-render {
          transform-origin: top left;
          line-height: 1.25;
        }

        .doc-thumb-render p,
        .doc-thumb-render li {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .doc-thumb-render h1,
        .doc-thumb-render h2,
        .doc-thumb-render h3,
        .doc-thumb-render h4,
        .doc-thumb-render h5,
        .doc-thumb-render h6 {
          margin: 0 0 10px;
          font-size: 18px;
          line-height: 1.15;
        }

        @media (min-width: 768px) {
          .cp-from-row        { padding-top: 5px !important; padding-bottom: 6px !important; }
          .cp-from-label      { font-size: 24px !important; }
          .cp-from-input      { font-size: 24px !important; line-height: 1.12em !important; }
          .cp-lines-container { height: 198px !important; overflow-y: auto !important; }
          .cp-line-inner      { font-size: 24px !important; line-height: 1.12em !important; min-height: 1.12em !important; overflow: visible !important; }
          .cp-line-row        { padding-left: 12px !important; }
          .cp-line-row-att    { padding-right: 178px !important; }
          .cp-att-btn         { width: 150px !important; height: 150px !important; top: -8px !important; right: 18px !important; }
          .cp-paperclip-wrap  { right: -46px !important; top: -36px !important; }
          .cp-paperclip-img   { height: 110px !important; }
          .cp-textarea-pr-att { padding-right: 178px !important; }
        }
      `}</style>

      <div className="w-full text-black">
        <div className="flex flex-col">
          <div
            className="overflow-visible rounded-[8px] border border-[#cfd4dd] bg-[#f9f9f8] shadow-[0_4px_10px_rgba(0,0,0,0.08)] md:rounded-[16px]"
            data-sr-skip="true"
          >
            {/* ── Toolbar ── */}
            <div className="grid grid-cols-[80px_1fr_80px] items-center bg-transparent px-[8px] py-[8px] md:grid-cols-[120px_1fr_120px] md:px-[12px] md:py-[12px]">
              <button
                type="button"
                onClick={onCancel}
                disabled={sending}
                className="h-auto rounded-[7px] border border-[#c9cfda] bg-[#f9f9f8] px-[10px] py-[8px] text-[18px] font-black leading-none tracking-[-0.01em] text-[#000000] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(164,174,188,0.32)] transition-transform active:scale-[0.98] disabled:opacity-60 md:h-auto md:rounded-[8px] md:px-[18px] md:py-[10px] md:text-[22px] md:font-black md:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(164,174,188,0.32)]"
              >
                Cancel
              </button>

              <div
                className="text-center font-black tracking-[-0.02em] [-webkit-text-stroke:0.3px_#404040]"
                style={{
                  fontSize: "clamp(18px, 6vw, 22px)",
                  fontWeight: 600,
                  color: "#404040",
                }}
              >
                Mail
              </div>

              <button
                type="button"
                onClick={onSend}
                disabled={sending}
                className="h-auto rounded-[7px] border border-[#6f97d9] bg-gradient-to-b from-[#8FC0FF] via-[#5C9CF4] to-[#2F72E2] px-[10px] py-[8px] text-[18px] text-[#ffffff] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(25,67,154,0.45),0_1px_1px_rgba(29,72,157,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60 md:h-auto md:rounded-[8px] md:px-[18px] md:py-[10px] md:text-[22px] md:font-black"
              >
                {sending ? (
                  <SendingDots />
                ) : sent ? (
                  <SentText />
                ) : (
                  "Send"
                )}
              </button>
            </div>

            <div className="h-[2px] bg-gradient-to-r from-[#f1c0c0] via-[#eb9a9a] to-[#f1c0c0]" />

            {/* ── From row ── */}
            <div
              className="cp-from-row flex items-center border-b border-[rgba(188,195,207,0.44)] px-[10px] md:px-[12px]"
              style={{ paddingTop: "5px", paddingBottom: "6px" }}
            >
              <span
                className="cp-from-label shrink-0 pr-[6px] font-semibold tracking-[-0.01em] text-[#1f2329] [-webkit-text-stroke:0.3px_#000000]"
                style={{ fontSize: "clamp(21px, 3.5vw, 24px)", lineHeight: "1.12em" }}
              >
                From:
              </span>
              <input
                type="email"
                value={from}
                onChange={onFromChange}
                onBlur={onFromBlur}
                writingsuggestions="false"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    lineRefs.current[0]?.focus();
                  }
                }}
                placeholder={fromError && !from.trim() ? fromError : "your@email.com"}
                className={`cp-from-input flex-1 appearance-none border-0 bg-transparent tracking-[-0.01em] outline-none ring-0 focus:outline-none focus:ring-0 ${
                  fromError && !from.trim() ? "placeholder:text-[#d53030]" : "placeholder:text-[#a1a8b3]"
                }`}
                style={{
                  border: "none",
                  boxShadow: "none",
                  fontSize: "clamp(21px, 3.5vw, 24px)",
                  lineHeight: "1.12em",
                  color: fromIsInvalidFormat ? "#C00707" : "#1f2329",
                  WebkitTextStroke: fromIsInvalidFormat ? "0.3px #C00707" : fromHasText ? "0.3px #000000" : "0px transparent",
                }}
              />
            </div>

            {/* ── Message area ── */}
            <div className="relative overflow-visible">
              <div
                ref={linesContainerRef}
                className="cp-lines-container overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ height: "170px", position: "relative" }}
                onClick={(e) => {
                  setWholeMessageSelected(false);
                  if (e.target === e.currentTarget) lineRefs.current[lineCountRef.current - 1]?.focus();
                }}
              >
                {/* Placeholder */}
                {!message.replace(/\n/g, "").trim() && (
                  <span
                    className="pointer-events-none absolute select-none tracking-[-0.01em]"
                    style={{
                      left: "10px",
                      top: "4px",
                      fontSize: "clamp(21px, 3.5vw, 24px)",
                      lineHeight: "1.12em",
                      color: messageError ? "#d53030" : "#a1a8b3",
                    }}
                  >
                    {messageError ? "Don't forget to add your message or files..." : "Write your message..."}
                  </span>
                )}

                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    className={`cp-line-row${attachments.length > 0 ? " cp-line-row-att" : ""}`}
                    style={{
                      borderBottom: "1px solid rgba(188,195,207,0.44)",
                      paddingTop: "5px",
                      paddingBottom: "6px",
                      paddingLeft: "10px",
                      paddingRight: attachments.length > 0 ? "116px" : "10px",
                      backgroundColor:
                        allMessageSelected && (message.split("\n")[i] ?? "").trim()
                          ? "rgba(115, 201, 81, 0.32)"
                          : "transparent",
                    }}
                  >
                    <div
                      ref={(el) => {
                        lineRefs.current[i] = el;
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      writingsuggestions="false"
                      className="cp-line-inner tracking-[-0.01em] text-[#1f2329] outline-none"
                      style={{
                        fontSize: "clamp(21px, 3.5vw, 24px)",
                        lineHeight: "1.12em",
                        WebkitTextStroke: "0.3px #000000",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        minHeight: "1.12em",
                      }}
                      onFocus={() => setWholeMessageSelected(false)}
                      onInput={(e) => handleLineInput(i, e)}
                      onKeyDown={(e) => handleLineKeyDown(i, e)}
                    />
                  </div>
                ))}
              </div>

              {attachments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDialogOpen((prev) => !prev)}
                  className="cp-att-btn absolute top-[12px] right-[10px] overflow-visible appearance-none border-0 bg-transparent p-0 shadow-none outline-none h-[96px] w-[96px]"
                  aria-label={isDialogOpen ? "Close attachments" : "Open attachments"}
                >
                  <div className="relative h-full w-full overflow-visible">
                    {attachments.slice(-3).reverse().map((att, index) => {
                      const rotate = index === 0 ? 4 : index === 1 ? -6 : 10;
                      const shift = index * 4;

                      return (
                        <div
                          key={att.id}
                          className="absolute inset-0 overflow-hidden rounded-[4px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                          style={{
                            transform: `rotate(${rotate}deg) translate(${shift}px, ${-shift}px)`,
                            zIndex: 10 - index,
                          }}
                        >
                          <AttachmentPreview attachment={att} />
                        </div>
                      );
                    })}

                    <div className="cp-paperclip-wrap pointer-events-none absolute -right-[30px] -top-[22px] z-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/paper-clip.png"
                        alt=""
                        aria-hidden="true"
                        className="cp-paperclip-img h-[68px] w-auto object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.22)]"
                      />
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* ── Add file bar ── */}
            <div
              className="relative flex items-center justify-start overflow-hidden rounded-b-[8px] bg-transparent px-[10px] py-[7px] md:rounded-b-[16px] md:px-[12px] md:py-[9px]"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
              }}
            >
              <button
                ref={addFileBtnRef}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative z-[1] inline-flex items-center rounded-[7px] border border-[#c9cfda] bg-[#ebebeb] px-[12px] py-[7px] text-[18px] font-medium leading-none tracking-[-0.01em] text-[#3a3a3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(164,174,188,0.32)] transition-transform active:scale-[0.98] [-webkit-text-stroke:0.3px_#3a3a3a]"
                style={{ WebkitAppearance: "none", appearance: "none" }}
              >
                Add file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
          {/* Sentinel — placed after the full card including Add file bar */}
          <div ref={sentinelRef} />

          {/* ── Attachments dialog ── */}
          {isDialogOpen && attachments.length > 0 ? (
            <div className="mt-[10px] w-full overflow-visible rounded-[14px]">
              <div className="pb-[12px]">
                <div
                  ref={attachmentsStripRef}
                  onMouseDown={onAttachmentsMouseDown}
                  onDragStart={(event) => event.preventDefault()}
                  className={`overflow-x-auto overflow-y-visible select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                    isDraggingAttachments ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    touchAction: "pan-x",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehaviorX: "contain",
                  }}
                >
                  <div className="flex w-max gap-[10px] pt-[12px]">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative w-[130px] shrink-0 rounded-[8px] border border-[#d2d8e1] bg-white p-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] md:w-[178px]"
                      >
                        {/* × outside the image, on top-right edge of the card */}
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="absolute -top-[9px] -right-[9px] z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#6f97d9] bg-gradient-to-b from-[#8FC0FF] via-[#5C9CF4] to-[#2F72E2] text-[14px] leading-none text-[#ffffff] shadow-[inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(25,67,154,0.45),0_1px_1px_rgba(29,72,157,0.28)] [-webkit-text-stroke:0.9px_#ffffff]"
                          aria-label={`Remove ${att.file.name}`}
                        >
                          ×
                        </button>
                        <div className="h-[82px] w-full overflow-hidden rounded-[5px] bg-white md:h-[112px]">
                          <AttachmentPreview attachment={att} />
                        </div>
                        <div className="mt-[6px] text-[12px] font-medium leading-none tracking-[-0.01em] text-[#2d333c]">
                          {finderName(att.file.name)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-[10px] text-[14px] leading-none tracking-[-0.01em] text-[#d53030]">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <AddFileHint addFileBtnRef={addFileBtnRef} sentinelRef={sentinelRef} />
    </>
  );
}
