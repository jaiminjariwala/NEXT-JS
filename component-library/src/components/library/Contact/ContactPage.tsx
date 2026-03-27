'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

/* ─── types ──────────────────────────────────────────────────────────────── */
type AttachmentItem = {
  id: string;
  file: File;
  previewUrl: string;
  isImage: boolean;
};

/* ─── file helpers ───────────────────────────────────────────────────────── */
function getFileExt(name = '') {
  const parts = name.split('.');
  if (parts.length < 2) return 'FILE';
  return parts.pop()?.toUpperCase() || 'FILE';
}

function finderName(name = '', startChars = 7, endChars = 6) {
  if (name.length <= startChars + endChars + 1) return name;
  return `${name.slice(0, startChars)}\u2026${name.slice(name.length - endChars)}`;
}

function isVideoAttachment(file?: File) {
  return (
    file?.type?.startsWith('video/') ||
    /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(file?.name || '')
  );
}

function isZipAttachment(file?: File) {
  const ext = getFileExt(file?.name || '').toLowerCase();
  return (
    ['zip', 'gz', 'tar', 'rar', '7z'].includes(ext) ||
    ['application/zip', 'application/x-zip-compressed'].includes(
      file?.type || '',
    )
  );
}

/* ─── icons ──────────────────────────────────────────────────────────────── */
function ZipIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f0f1f4]">
      <svg
        width="54"
        height="66"
        viewBox="0 0 54 66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 0 H38 L54 16 V62 Q54 66 50 66 H4 Q0 66 0 62 V4 Q0 0 4 0Z"
          fill="white"
          stroke="#d0d4da"
          strokeWidth="1"
        />
        <path d="M38 0 L54 16 H42 Q38 16 38 12 Z" fill="#d0d4da" />
        <rect x="23" y="10" width="8" height="44" rx="4" fill="#c8cbd0" />
        {[13, 18, 23, 28, 33, 38, 43].map((y, i) => (
          <g key={i}>
            <rect x="19" y={y} width="5" height="3.5" rx="1" fill="#8a8f9a" />
            <rect
              x="30"
              y={y + 1.5}
              width="5"
              height="3.5"
              rx="1"
              fill="#8a8f9a"
            />
          </g>
        ))}
        <circle
          cx="27"
          cy="11"
          r="4"
          fill="#6e7380"
          stroke="#555a63"
          strokeWidth="0.8"
        />
        <circle cx="27" cy="11" r="2" fill="#9ca0aa" />
        <text
          x="27"
          y="61"
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fontFamily="-apple-system,sans-serif"
          fill="#6e7380"
          letterSpacing="0.5"
        >
          ZIP
        </text>
      </svg>
    </div>
  );
}

function FileIcon({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4f5f7]">
      <svg
        width="50"
        height="62"
        viewBox="0 0 50 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 0 H34 L50 16 V58 Q50 62 46 62 H4 Q0 62 0 58 V4 Q0 0 4 0Z"
          fill="white"
          stroke="#d0d4da"
          strokeWidth="1"
        />
        <path d="M34 0 L50 16 H38 Q34 16 34 12 Z" fill="#d0d4da" />
        <text
          x="25"
          y="42"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fontFamily="-apple-system,sans-serif"
          fill="#6e7380"
          letterSpacing="0.5"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ─── attachment preview (no external deps) ──────────────────────────────── */
function AttachmentPreview({ attachment }: { attachment: AttachmentItem }) {
  const _isVideo = isVideoAttachment(attachment.file);
  const _isZip = isZipAttachment(attachment.file);

  if (attachment.isImage && attachment.previewUrl)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.previewUrl}
        alt={attachment.file.name}
        draggable={false}
        className="h-full w-full object-cover"
      />
    );

  if (_isVideo && attachment.previewUrl)
    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        <video
          src={attachment.previewUrl}
          className="h-full w-full object-cover"
          muted
          preload="metadata"
          style={{ pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-[7px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 2L11 7L3 12V2Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    );

  if (_isZip) return <ZipIcon />;

  return <FileIcon label={getFileExt(attachment.file?.name || '')} />;
}

/* ─── animated send states ──────────────────────────────────────────────── */
function SendingDots() {
  return (
    <span
      aria-label="Sending"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        height: '1em',
        verticalAlign: 'middle',
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.55)',
            animation: `cp-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function SentText() {
  const elRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    el.style.animation =
      'cp-sent-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards';
  }, []);
  return (
    <span ref={elRef} style={{ display: 'inline-block', opacity: 0 }}>
      Sent
    </span>
  );
}

/* ─── constants ──────────────────────────────────────────────────────────── */
const MIN_LINES = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── main component ─────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [from, setFrom] = useState('');
  const [fromError, setFromError] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDraggingAttachments, setIsDraggingAttachments] = useState(false);
  const [allMessageSelected, setAllMessageSelected] = useState(false);
  const [lineCount, setLineCount_] = useState(MIN_LINES);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addFileBtnRef = useRef<HTMLButtonElement | null>(null);
  const attachmentsStripRef = useRef<HTMLDivElement | null>(null);
  const attachmentsDragRef = useRef({
    dragging: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const linesContainerRef = useRef<HTMLDivElement | null>(null);
  const lineCountRef = useRef(MIN_LINES);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const allMessageSelectedRef = useRef(false);
  const updateMessageFromDOMRef = useRef<(() => string) | null>(null);
  const reflowLinesRef = useRef<(() => boolean) | null>(null);

  const setLineCount = (n: number | ((prev: number) => number)) => {
    const val = typeof n === 'function' ? n(lineCountRef.current) : n;
    lineCountRef.current = val;
    setLineCount_(val);
  };

  const fromHasText = from.length > 0;
  const fromIsInvalidFormat = fromHasText && !EMAIL_RE.test(from.trim());

  /* ── caret helpers ── */
  const getCaretOffset = (el: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length;
  };

  const setCaretOffset = (el: HTMLElement | null, offset: number) => {
    if (!el) return;
    el.focus();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let remaining = offset;
    let node: Node | null;
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

  const updateMessageFromDOM = useCallback(() => {
    const parts: string[] = [];
    for (let j = 0; j < lineCountRef.current; j++)
      parts.push(lineRefs.current[j]?.innerText ?? '');
    const msg = parts.join('\n');
    setMessage(msg);
    return msg;
  }, []);

  const setWholeMessageSelected = (value: boolean) => {
    allMessageSelectedRef.current = value;
    setAllMessageSelected(value);
  };

  const scrollLineIntoView = (lineEl: HTMLElement | null) => {
    const container = linesContainerRef.current;
    if (!container || !lineEl) return;
    const row = (lineEl.closest('.cp-line-row') as HTMLElement) ?? lineEl;
    const rowRect = row.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    if (rowRect.bottom > contRect.bottom)
      container.scrollTop += rowRect.bottom - contRect.bottom + 2;
    else if (rowRect.top < contRect.top)
      container.scrollTop -= contRect.top - rowRect.top + 2;
  };

  const clearEditor = useCallback(() => {
    for (let j = 0; j < lineCountRef.current; j++) {
      if (lineRefs.current[j]) lineRefs.current[j]!.innerText = '';
    }
    setLineCount(MIN_LINES);
    setMessage('');
    setWholeMessageSelected(false);
  }, []);

  const splitOverflowLine = useCallback(
    (i: number, el: HTMLElement) => {
      if (el.scrollWidth <= el.offsetWidth) return;
      const fullText = el.innerText ?? '';
      let lo = 0,
        hi = fullText.length;
      while (lo < hi - 1) {
        const mid = Math.floor((lo + hi) / 2);
        el.innerText = fullText.slice(0, mid);
        if (el.scrollWidth > el.offsetWidth) hi = mid;
        else lo = mid;
      }
      const breakAt = fullText.lastIndexOf(' ', lo);
      const splitAt = breakAt > 0 ? breakAt + 1 : lo;
      const before = fullText.slice(0, splitAt).trimEnd();
      const after = fullText.slice(splitAt);
      el.innerText = before;
      const n = lineCountRef.current;
      const savedAfter: string[] = [];
      for (let j = i + 1; j < n; j++)
        savedAfter.push(lineRefs.current[j]?.innerText ?? '');
      const newCount = Math.max(n + 1, MIN_LINES, i + 2);
      setLineCount(newCount);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (lineRefs.current[i + 1]) {
            lineRefs.current[i + 1]!.innerText =
              after + (savedAfter[0] ? ' ' + savedAfter[0] : '');
          }
          savedAfter.slice(1).forEach((t, idx) => {
            if (lineRefs.current[i + 2 + idx])
              lineRefs.current[i + 2 + idx]!.innerText = t;
          });
          if (lineRefs.current[i + 1]) {
            setCaretOffset(lineRefs.current[i + 1], after.length);
            scrollLineIntoView(lineRefs.current[i + 1]);
            if (
              lineRefs.current[i + 1]!.scrollWidth >
              lineRefs.current[i + 1]!.offsetWidth
            )
              splitOverflowLine(i + 1, lineRefs.current[i + 1]!);
          }
          updateMessageFromDOM();
        }),
      );
    },
    [updateMessageFromDOM],
  );

  const reflowLinesForCurrentWidth = useCallback(() => {
    for (let i = 0; i < lineCountRef.current; i++) {
      const el = lineRefs.current[i];
      if (!el) continue;
      if (el.scrollWidth > el.offsetWidth) {
        splitOverflowLine(i, el);
        return true;
      }
    }
    return false;
  }, [splitOverflowLine]);

  updateMessageFromDOMRef.current = updateMessageFromDOM;
  reflowLinesRef.current = reflowLinesForCurrentWidth;

  const handleLineInput = (i: number, e: React.FormEvent<HTMLDivElement>) => {
    setWholeMessageSelected(false);
    const el = e.currentTarget;
    const rawText = el.innerText ?? '';
    if (rawText.includes('\n')) {
      const parts = rawText.split('\n');
      el.innerText = parts[0];
      const extraLines = parts.slice(1);
      const n = lineCountRef.current;
      const savedAfter: string[] = [];
      for (let j = i + 1; j < n; j++)
        savedAfter.push(lineRefs.current[j]?.innerText ?? '');
      setLineCount(
        Math.max(n + extraLines.length, MIN_LINES, i + 1 + extraLines.length),
      );
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          extraLines.forEach((part, idx) => {
            if (lineRefs.current[i + 1 + idx])
              lineRefs.current[i + 1 + idx]!.innerText = part;
          });
          savedAfter.forEach((t, idx) => {
            if (lineRefs.current[i + 1 + extraLines.length + idx])
              lineRefs.current[i + 1 + extraLines.length + idx]!.innerText = t;
          });
          const lastEl = lineRefs.current[i + extraLines.length];
          if (lastEl) {
            setCaretOffset(
              lastEl,
              (extraLines[extraLines.length - 1] ?? '').length,
            );
            scrollLineIntoView(lastEl);
          }
          const msg = updateMessageFromDOM();
          if (messageError && msg.replace(/\n/g, '').trim())
            setMessageError(false);
        }),
      );
      return;
    }
    if (el.scrollWidth > el.offsetWidth) {
      splitOverflowLine(i, el);
      return;
    }
    const msg = updateMessageFromDOM();
    if (messageError && msg.replace(/\n/g, '').trim()) setMessageError(false);
  };

  const handleLineKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      setWholeMessageSelected(true);
      return;
    }
    if (
      allMessageSelectedRef.current &&
      (e.key === 'Backspace' || e.key === 'Delete')
    ) {
      e.preventDefault();
      clearEditor();
      requestAnimationFrame(() => lineRefs.current[0]?.focus());
      return;
    }
    if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key !== 'Shift')
      setWholeMessageSelected(false);

    if (e.key === 'Enter') {
      e.preventDefault();
      const el = lineRefs.current[i];
      if (!el) return;
      const offset = getCaretOffset(el);
      const text = el.innerText ?? '';
      const before = text.slice(0, offset);
      const after = text.slice(offset);
      const n = lineCountRef.current;
      el.innerText = before;
      const savedAfter: string[] = [];
      for (let j = i + 1; j < n; j++)
        savedAfter.push(lineRefs.current[j]?.innerText ?? '');
      setLineCount(Math.max(n, i + 2));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (lineRefs.current[i + 1])
            lineRefs.current[i + 1]!.innerText = after;
          savedAfter.forEach((t, idx) => {
            if (lineRefs.current[i + 2 + idx])
              lineRefs.current[i + 2 + idx]!.innerText = t;
          });
          if (lineRefs.current[i + 1]) {
            setCaretOffset(lineRefs.current[i + 1], 0);
            scrollLineIntoView(lineRefs.current[i + 1]);
          }
          updateMessageFromDOM();
        }),
      );
      return;
    }
    if (e.key === 'Backspace') {
      const el = lineRefs.current[i];
      if (!el) return;
      const offset = getCaretOffset(el);
      if (offset === 0 && i > 0) {
        e.preventDefault();
        const prevEl = lineRefs.current[i - 1];
        const prevText = prevEl?.innerText ?? '';
        const currText = el.innerText ?? '';
        const merged = prevText + currText;
        const n = lineCountRef.current;
        const savedAfter: string[] = [];
        for (let j = i + 1; j < n; j++)
          savedAfter.push(lineRefs.current[j]?.innerText ?? '');
        setLineCount(Math.max(MIN_LINES, n - 1));
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (prevEl) {
              prevEl.innerText = merged;
              setCaretOffset(prevEl, prevText.length);
              scrollLineIntoView(prevEl);
            }
            savedAfter.forEach((t, idx) => {
              if (lineRefs.current[i + idx])
                lineRefs.current[i + idx]!.innerText = t;
            });
            updateMessageFromDOM();
          }),
        );
        return;
      }
    }
    if (e.key === 'ArrowUp' && i > 0) {
      e.preventDefault();
      lineRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowDown' && i < lineCountRef.current - 1) {
      e.preventDefault();
      lineRefs.current[i + 1]?.focus();
    }
  };

  /* ── image compression ── */
  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const MAX_PX = 1920,
        QUALITY = 0.85;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { naturalWidth: w, naturalHeight: h } = img;
        if (w <= MAX_PX && h <= MAX_PX && file.size < 1.5 * 1024 * 1024) {
          resolve(file);
          return;
        }
        const scale = Math.min(1, MAX_PX / Math.max(w, h));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(
              new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() },
              ),
            );
          },
          'image/jpeg',
          QUALITY,
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    event.target.value = '';

    const processed = await Promise.all(
      files.map(async (file, index) => {
        const isImage = file.type.startsWith('image/');
        const isVid = isVideoAttachment(file);
        const finalFile = isImage ? await compressImage(file) : file;
        return {
          id: `${file.name}-${file.size}-${Date.now()}-${index}`,
          file: finalFile,
          isImage,
          previewUrl: isImage || isVid ? URL.createObjectURL(finalFile) : '',
        };
      }),
    );

    setAttachments((prev) => [...prev, ...processed]);
    if (messageError) setMessageError(false);
  };

  const removeAttachment = (idToRemove: string) => {
    setAttachments((prev) => {
      const toRemove = prev.find((a) => a.id === idToRemove);
      if (toRemove?.previewUrl) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((a) => a.id !== idToRemove);
    });
  };

  const clearAllAttachments = () => {
    setAttachments((prev) => {
      prev.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
      return [];
    });
  };

  useEffect(() => {
    if (attachments.length === 0 && isDialogOpen) setIsDialogOpen(false);
  }, [attachments.length, isDialogOpen]);

  useEffect(() => {
    if (attachments.length === 0) return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const changed = reflowLinesRef.current?.();
      if (changed) requestAnimationFrame(run);
      else updateMessageFromDOMRef.current?.();
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
    return () => { cancelled = true; };
  }, [attachments.length]);

  /* ── send ── */
  const onSend = async () => {
    if (!from.trim()) {
      setFromError('Please enter a valid email address.');
      setError('');
      return;
    }
    if (!EMAIL_RE.test(from.trim())) {
      setFromError('Please enter a valid email address.');
      setError('');
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      setMessageError(true);
      setError('');
      return;
    }
    setMessageError(false);
    setError('');
    setSending(true);
    setSent(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const formData = new FormData();
      formData.set('from', from.trim());
      formData.set('message', message.trim());
      attachments.forEach((att) => formData.append('attachments', att.file));

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const backendError = String(payload.error || '');
        if (
          backendError === 'From email is required.' ||
          backendError === 'Please enter a valid email in From.'
        ) {
          setFromError('Please enter a valid email address.');
          setError('');
          return;
        }
        setError(backendError || 'Unable to send right now. Please try again.');
        return;
      }

      clearEditor();
      clearAllAttachments();
      setIsDialogOpen(false);
      setSent(true);
      setTimeout(() => setSent(false), 2200);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Request timed out — try with fewer or smaller attachments.');
      } else {
        setError('Unable to send right now. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setSending(false);
    }
  };

  const onCancel = () => {
    setFrom('');
    setFromError('');
    setMessageError(false);
    clearEditor();
    clearAllAttachments();
    setError('');
    setSent(false);
    setIsDialogOpen(false);
  };

  /* ── attachment strip drag ── */
  const stopAttachmentsDrag = () => {
    if (!attachmentsDragRef.current.dragging) return;
    attachmentsDragRef.current.dragging = false;
    setIsDraggingAttachments(false);
  };

  const onAttachmentsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    const strip = attachmentsStripRef.current;
    if (!strip) return;
    attachmentsDragRef.current = {
      dragging: true,
      startX: e.clientX,
      startScrollLeft: strip.scrollLeft,
    };
    setIsDraggingAttachments(true);
    e.preventDefault();
  };

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      const strip = attachmentsStripRef.current;
      if (!strip || !attachmentsDragRef.current.dragging) return;
      strip.scrollLeft =
        attachmentsDragRef.current.startScrollLeft -
        (e.clientX - attachmentsDragRef.current.startX);
      e.preventDefault();
    };
    const mu = () => stopAttachmentsDrag();
    window.addEventListener('mousemove', mm, { passive: false });
    window.addEventListener('mouseup', mu);
    window.addEventListener('blur', mu);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('blur', mu);
    };
  }, []);

  useEffect(() => {
    if (!isDialogOpen) stopAttachmentsDrag();
  }, [isDialogOpen]);

  /* ─────────────────────────────── render ──────────────────────────────── */
  return (
    <section className="w-full bg-white text-black">
      <style>{`
        .cp-from-input::placeholder { -webkit-text-stroke: 0 transparent !important; }
        .cp-from-input::selection,
        .cp-line-inner::selection { background: #73c951 !important; color: #000 !important; }
        .cp-from-input::-moz-selection,
        .cp-line-inner::-moz-selection { background: #73c951 !important; color: #000 !important; }
        .cp-lines-container { scrollbar-width: none; -ms-overflow-style: none; }
        .cp-lines-container::-webkit-scrollbar { display: none; }
        .cp-att-strip { scrollbar-width: none; -ms-overflow-style: none; }
        .cp-att-strip::-webkit-scrollbar { display: none; }
        @keyframes cp-dot-pulse {
          0%,100% { transform: scale(0.6);  background-color: rgba(255,255,255,0.45); }
          50%      { transform: scale(1.35); background-color: rgba(255,255,255,1); }
        }
        @keyframes cp-sent-pop {
          from { transform: scale(0.05); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-[689px] flex-col px-[10px] pb-[18px] pt-[22px]">
        <div className="flex flex-col">

          {/* ── Mail card ── */}
          <div className="overflow-visible rounded-[16px] border border-[#cfd4dd] bg-[#f9f9f8] shadow-[0_4px_10px_rgba(0,0,0,0.08)]">

            {/* toolbar */}
            <div className="grid grid-cols-[120px_1fr_120px] items-center bg-transparent px-[12px] py-[12px]">
              <button
                type="button"
                onClick={onCancel}
                disabled={sending}
                className="rounded-[8px] border border-[#c9cfda] bg-[#f9f9f8] px-[18px] py-[10px] text-[22px] font-black leading-none tracking-[-0.01em] text-[#000000] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(164,174,188,0.32)] transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{ WebkitTextStroke: '0.3px #000' }}
              >
                Cancel
              </button>

              <div
                className="text-center text-[22px] font-semibold tracking-[-0.02em] text-[#404040]"
                style={{ WebkitTextStroke: '0.3px #404040' }}
              >
                Mail
              </div>

              <button
                type="button"
                onClick={onSend}
                disabled={sending}
                className="rounded-[8px] border border-[#6f97d9] bg-gradient-to-b from-[#8FC0FF] via-[#5C9CF4] to-[#2F72E2] px-[18px] py-[10px] text-[22px] font-black leading-none text-[#ffffff] shadow-[inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(25,67,154,0.45),0_1px_1px_rgba(29,72,157,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{ WebkitTextStroke: '0.6px #fff' }}
              >
                {sending ? <SendingDots /> : sent ? <SentText /> : 'Send'}
              </button>
            </div>

            {/* red gradient separator */}
            <div className="h-[2px] bg-gradient-to-r from-[#f1c0c0] via-[#eb9a9a] to-[#f1c0c0]" />

            {/* From row */}
            <div className="flex items-center border-b border-[rgba(188,195,207,0.44)] px-[12px] py-[7px]">
              <span
                className="shrink-0 pr-[6px] text-[24px] font-semibold tracking-[-0.01em] text-[#1f2329]"
                style={{ WebkitTextStroke: '0.3px #000' }}
              >
                From:
              </span>
              <input
                type="email"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  if (fromError && EMAIL_RE.test(e.target.value.trim()))
                    setFromError('');
                }}
                onBlur={() => {
                  if (from.trim() && !EMAIL_RE.test(from.trim()))
                    setFromError('Please enter a valid email address.');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    lineRefs.current[0]?.focus();
                  }
                }}
                placeholder={
                  fromError && !from.trim() ? fromError : 'your@email.com'
                }
                className={`cp-from-input flex-1 appearance-none border-0 bg-transparent text-[24px] tracking-[-0.01em] outline-none ${
                  fromError && !from.trim()
                    ? 'placeholder:text-[#d53030]'
                    : 'placeholder:text-[#a1a8b3]'
                }`}
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  color: fromIsInvalidFormat ? '#C00707' : '#1f2329',
                  WebkitTextStroke: fromIsInvalidFormat
                    ? '0.3px #C00707'
                    : fromHasText
                      ? '0.3px #000'
                      : '0px transparent',
                }}
              />
            </div>

            {/* message area — line editor */}
            <div className="relative overflow-visible">
              <div
                ref={linesContainerRef}
                className="cp-lines-container overflow-y-auto"
                style={{ height: '170px', position: 'relative' }}
                onClick={(e) => {
                  setWholeMessageSelected(false);
                  if (e.target === e.currentTarget)
                    lineRefs.current[lineCountRef.current - 1]?.focus();
                }}
              >
                {/* placeholder */}
                {!message.replace(/\n/g, '').trim() && (
                  <span
                    className="pointer-events-none absolute select-none tracking-[-0.01em]"
                    style={{
                      left: '10px',
                      top: '4px',
                      fontSize: '24px',
                      lineHeight: '1.12em',
                      color: messageError ? '#d53030' : '#a1a8b3',
                    }}
                  >
                    {messageError
                      ? "Don't forget to add your message or files…"
                      : 'Write your message…'}
                  </span>
                )}

                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    className="cp-line-row"
                    style={{
                      borderBottom: '1px solid rgba(188,195,207,0.44)',
                      paddingTop: '5px',
                      paddingBottom: '6px',
                      paddingLeft: '10px',
                      paddingRight: attachments.length > 0 ? '116px' : '10px',
                      backgroundColor:
                        allMessageSelected &&
                        (message.split('\n')[i] ?? '').trim()
                          ? 'rgba(115,201,81,0.32)'
                          : 'transparent',
                    }}
                  >
                    <div
                      ref={(el) => { lineRefs.current[i] = el; }}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      className="cp-line-inner tracking-[-0.01em] text-[#1f2329] outline-none"
                      style={{
                        fontSize: '24px',
                        lineHeight: '1.12em',
                        WebkitTextStroke: '0.3px #000',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        minHeight: '1.12em',
                      }}
                      onFocus={() => setWholeMessageSelected(false)}
                      onInput={(e) => handleLineInput(i, e)}
                      onKeyDown={(e) => handleLineKeyDown(i, e)}
                    />
                  </div>
                ))}
              </div>

              {/* stacked attachment fan + paperclip */}
              {attachments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDialogOpen((p) => !p)}
                  className="absolute top-[12px] right-[10px] overflow-visible appearance-none border-0 bg-transparent p-0 shadow-none outline-none h-[96px] w-[96px] cursor-pointer"
                  aria-label={
                    isDialogOpen ? 'Close attachments' : 'Open attachments'
                  }
                >
                  <div className="relative h-full w-full overflow-visible">
                    {attachments
                      .slice(-3)
                      .reverse()
                      .map((att, index) => {
                        const rotate =
                          index === 0 ? 4 : index === 1 ? -6 : 10;
                        const shift = index * 4;
                        return (
                          <div
                            key={att.id}
                            className="absolute inset-0 overflow-hidden rounded-[4px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                            style={{
                              transform: `rotate(${rotate}deg) translate(${shift}px,${-shift}px)`,
                              zIndex: 10 - index,
                            }}
                          >
                            <AttachmentPreview attachment={att} />
                          </div>
                        );
                      })}

                    <div className="pointer-events-none absolute -right-[30px] -top-[22px] z-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/paper-clip.png"
                        alt=""
                        aria-hidden="true"
                        className="h-[68px] w-auto object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.22)]"
                      />
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Add file bar */}
            <div
              className="relative flex items-center justify-start bg-transparent px-[12px] py-[9px]"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}
            >
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-[132px]"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.11) 28%, rgba(0,0,0,0.05) 56%, rgba(0,0,0,0) 86%)',
                }}
              />
              <button
                ref={addFileBtnRef}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative z-[1] inline-flex items-center rounded-[7px] border border-[#c9cfda] bg-[#ebebeb] px-[12px] py-[7px] text-[18px] font-medium leading-none tracking-[-0.01em] text-[#3a3a3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(164,174,188,0.32)] transition-transform active:scale-[0.98] cursor-pointer"
                style={{ WebkitAppearance: 'none', appearance: 'none', WebkitTextStroke: '0.3px #3a3a3a' }}
              >
                Add file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.pages,.numbers,.key,.zip,.gz,.tar,.rar,.7z,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>

          {/* attachments dialog */}
          {isDialogOpen && attachments.length > 0 && (
            <div className="mt-[10px] w-full overflow-visible rounded-[14px]">
              <div className="pb-[12px]">
                <div
                  ref={attachmentsStripRef}
                  onMouseDown={onAttachmentsMouseDown}
                  onDragStart={(e) => e.preventDefault()}
                  className="cp-att-strip overflow-x-auto overflow-y-visible select-none"
                  style={{
                    touchAction: 'pan-x',
                    WebkitOverflowScrolling: 'touch' as any,
                    overscrollBehaviorX: 'contain',
                    cursor: isDraggingAttachments ? 'grabbing' : 'grab',
                  }}
                >
                  <div className="flex w-max gap-[10px] pt-[12px]">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative w-[178px] shrink-0 rounded-[8px] border border-[#d2d8e1] bg-white p-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                      >
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="absolute -top-[9px] -right-[9px] z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#6f97d9] bg-gradient-to-b from-[#8FC0FF] via-[#5C9CF4] to-[#2F72E2] text-[14px] leading-none text-[#ffffff] shadow-[inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(25,67,154,0.45),0_1px_1px_rgba(29,72,157,0.28)] cursor-pointer"
                          style={{ WebkitTextStroke: '0.9px #fff' }}
                          aria-label={`Remove ${att.file.name}`}
                        >
                          ×
                        </button>
                        <div className="h-[112px] w-full overflow-hidden rounded-[5px] bg-white">
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
          )}

          {error && (
            <p className="mt-[10px] text-[14px] leading-none tracking-[-0.01em] text-[#d53030]">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
