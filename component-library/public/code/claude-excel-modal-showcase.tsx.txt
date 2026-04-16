'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
// Component is designed for ~680px natural width (the preview panel width).
// No CSS transform scaling is applied – it renders at 1:1 like ContactPage.
const BODY_FONT =
  'Inter, var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif';
const MONO_FONT = '"SFMono-Regular", ui-monospace, Menlo, Monaco, monospace';
const SERIF_FONT = '"Copernicus Trial", Georgia, "Times New Roman", serif';
const DESKTOP_BREAKPOINT_PX = 700;
const STACKED_MODAL_MAX_WIDTH_PX = 700;
const DESKTOP_MODAL_MAX_WIDTH_PX = 980;

// Spreadsheet grid columns: row-num | A-Region | B-Q3 | C-Q4 | D-Growth | E-Contrib
const SS_GRID =
  'grid-cols-[0.42fr_1.05fr_0.95fr_0.95fr_0.95fr_0.85fr]';
const CELL =
  'border-r border-[#343434]';
const CELL_LAST = '';
const INTERACTIVE_CELL =
  'flex h-full w-full cursor-pointer items-center justify-center px-[0.28rem] py-[0.36rem] text-center outline-none transition-colors duration-150 hover:bg-[#1c3825] hover:font-semibold hover:text-[#4ecb7a] focus-visible:bg-[#1c3825] focus-visible:font-semibold focus-visible:text-[#4ecb7a]';

const BULLETS = [
  'Build financial models, analyze data, and create tables and charts with Claude directly in Excel',
  'Transform complex data tasks or messy data clean-ups into simple conversations',
  'Available with a Claude Pro, Max, Team, or Enterprise plan',
];

const ROWS = [
  {
    n: '2',
    region: 'North',
    q3: '$45.2M',
    q4: '$52.1M',
    growth: '+15.3%',
    contrib: '24.8%',
  },
  {
    n: '3',
    region: 'South',
    q3: '$38.1M',
    q4: '$41.4M',
    growth: '+8.7%',
    contrib: '19.7%',
  },
  {
    n: '4',
    region: 'East',
    q3: '$62.8M',
    q4: '$71.2M',
    growth: '+13.4%',
    contrib: '33.9%',
  },
  {
    n: '5',
    region: 'West',
    q3: '$41.5M',
    q4: '$45.3M',
    growth: '+9.2%',
    contrib: '21.6%',
  },
  {
    n: '6',
    region: 'Total',
    q3: '$187.6M',
    q4: '$210.0M',
    growth: '+11.9%',
    contrib: '100%',
  },
  { n: '7', region: '', q3: '', q4: '', growth: '', contrib: '' },
];

const CHART_DATA = [
  { label: 'North', q3: 45.2, q4: 52.1 },
  { label: 'South', q3: 38.1, q4: 41.4 },
  { label: 'East', q3: 62.8, q4: 71.2 },
  { label: 'West', q3: 41.5, q4: 45.3 },
];
const CHART_MAX = 75;

type SpreadsheetCellProps = {
  children?: ReactNode;
  isLast?: boolean;
  cellClassName?: string;
  buttonClassName?: string;
  active?: boolean;
  label: string;
};

function SpreadsheetCell({
  children,
  isLast = false,
  cellClassName = '',
  buttonClassName = '',
  active = false,
  label,
}: SpreadsheetCellProps) {
  return (
    <div className={`${isLast ? CELL_LAST : CELL} ${cellClassName}`}>
      <button
        type="button"
        aria-label={label}
        className={`${INTERACTIVE_CELL} ${
          active ? 'bg-[#1c3825] font-semibold text-[#4ecb7a]' : ''
        } ${buttonClassName}`}
      >
        {children}
      </button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export const ClaudeExcelModalShowcase = () => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }

    const updateLayout = (width: number) => {
      setIsDesktop(width >= DESKTOP_BREAKPOINT_PX);
    };

    updateLayout(node.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      updateLayout(entry.contentRect.width);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="flex w-full items-center justify-center px-3 py-3"
    >
      <div
        className="w-full overflow-hidden rounded-[24px] bg-white shadow-[0_20px_64px_rgba(0,0,0,0.2)]"
        style={{
          maxWidth: isDesktop
            ? `${DESKTOP_MODAL_MAX_WIDTH_PX}px`
            : `${STACKED_MODAL_MAX_WIDTH_PX}px`,
        }}
      >
        <div
          className={`grid w-full overflow-hidden rounded-[24px] bg-white ${
            isDesktop ? 'grid-cols-[0.44fr_0.56fr]' : ''
          }`}
        >
          {/* ── LEFT PANEL ── */}
          <section
            className={`flex flex-col bg-white ${
              isDesktop
                ? 'px-[1.5rem] pb-[1.7rem] pt-[1.7rem]'
                : 'px-[1.35rem] pb-[1.4rem] pt-[1.45rem]'
            }`}
            style={{ fontFamily: BODY_FONT }}
          >
            {/* NEW badge */}
            <span className="inline-flex w-fit items-center rounded-[7px] bg-[#e8f0fb] px-[0.6rem] py-[0.22rem] text-[0.64rem] font-semibold uppercase tracking-[0.06em] text-[#2563eb]">
              NEW
            </span>

            {/* Heading */}
            <h2
              className={`mt-[1rem] leading-[1.07] tracking-[-0.01em] text-[#111111] ${
                isDesktop ? 'text-[1.75rem]' : 'text-[1.52rem]'
              }`}
              style={{ fontFamily: SERIF_FONT, fontWeight: 600 }}
            >
              Supercharge your spreadsheets with Claude in Excel
            </h2>

            {/* Bullet list */}
            <ul
              className={`mt-[1rem] space-y-[0.65rem] leading-[1.45] text-[#3e3e3e] ${
                isDesktop ? 'text-[0.78rem]' : 'text-[0.76rem]'
              }`}
            >
              {BULLETS.map((text) => (
                <li key={text} className="flex items-start gap-[0.55rem]">
                  <span className="mt-[0.42rem] h-[0.27rem] w-[0.27rem] shrink-0 rounded-full bg-[#383838]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* CTA buttons – pushed to bottom */}
            <div className="mt-auto flex flex-col gap-[0.48rem] pt-[1.4rem]">
              <button
                type="button"
                className="flex h-[40px] w-full items-center justify-center rounded-[10px] bg-[#1a1a1a] text-[0.8rem] font-medium text-white outline-none transition-[background-color,box-shadow] hover:bg-black focus:ring-[2px] focus:ring-[#3b82f6] focus:ring-offset-[2px] focus:ring-offset-white"
              >
                Get Claude in Excel
              </button>
              <button
                type="button"
                className="flex h-[40px] w-full items-center justify-center rounded-[10px] border border-[#d5d5d2] bg-white text-[0.8rem] font-medium text-[#232323] transition-colors hover:bg-[#fafafa]"
              >
                Maybe later
              </button>
            </div>
          </section>

          {/* ── RIGHT PANEL ── */}
          <section
            className={`relative flex items-center justify-center overflow-hidden bg-[#239654] ${
              isDesktop
                ? 'px-[1rem] py-[1.1rem]'
                : 'px-[0.9rem] py-[0.95rem]'
            }`}
          >
            {/* Radial glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(78,214,128,0.26),transparent)]" />

            {/* Close button */}
            <button
              type="button"
              aria-label="Close"
              className="absolute right-[0.85rem] top-[0.85rem] z-20 flex h-[1.85rem] w-[1.85rem] items-center justify-center rounded-full bg-white text-[#807d79] shadow transition-transform hover:scale-105"
            >
              <X size={14} strokeWidth={1.6} />
            </button>

            {/* Spreadsheet window */}
            <div
              className="relative z-10 w-full overflow-hidden rounded-[15px] bg-[#1e1e1e] shadow-[0_16px_44px_rgba(0,0,0,0.42)]"
              style={{ fontFamily: MONO_FONT }}
            >
                {/* macOS title bar */}
                <div className="flex items-center gap-[5px] bg-[#2d2c2b] px-[14px] py-[0.5rem]">
                  <span className="h-[9px] w-[9px] rounded-full bg-[#FF5F56]" />
                  <span className="h-[9px] w-[9px] rounded-full bg-[#FFBD2E]" />
                  <span className="h-[9px] w-[9px] rounded-full bg-[#27C93F]" />
                </div>

                {/* Window body */}
                <div className="space-y-[7px] px-[9px] pb-[9px] pt-[7px]">
                  {/* Spreadsheet table */}
                  <div className="overflow-hidden rounded-[8px] border border-[#2d2d2d] bg-[#212121]">
                    {/* Column-letter row */}
                    <div
                      className={`grid ${SS_GRID} border-b border-[#333] bg-[#292929] text-[0.57rem] font-semibold text-[#686868]`}
                    >
                      <SpreadsheetCell
                        label="Top left empty spreadsheet corner"
                        buttonClassName="text-transparent"
                      />
                      {['A', 'B', 'C', 'D', 'E'].map((col, i) => (
                        <SpreadsheetCell
                          key={col}
                          isLast={i === 4}
                          label={`Column ${col}`}
                        >
                          {col}
                        </SpreadsheetCell>
                      ))}
                    </div>

                    {/* Header row (row 1) */}
                    <div
                      className={`grid ${SS_GRID} border-b border-[#333] bg-[#252525] text-[0.6rem] font-semibold text-[#dcdcdc]`}
                    >
                      <SpreadsheetCell
                        label="Row 1"
                        buttonClassName="text-[0.54rem] text-[#717171]"
                      >
                        1
                      </SpreadsheetCell>
                      <SpreadsheetCell label="Header Region">Region</SpreadsheetCell>
                      <SpreadsheetCell label="Header Q3 Revenue">
                        Q3 Rev
                      </SpreadsheetCell>
                      <SpreadsheetCell label="Header Q4 Revenue">
                        Q4 Rev
                      </SpreadsheetCell>
                      <SpreadsheetCell label="Header Growth">Growth</SpreadsheetCell>
                      <SpreadsheetCell isLast label="Header Contribution">
                        Contrib %
                      </SpreadsheetCell>
                    </div>

                    {/* Data rows 2-7 */}
                    {ROWS.map(({ n, region, q3, q4, growth, contrib }) => (
                      <div
                        key={n}
                        className={`grid ${SS_GRID} border-b border-[#2b2b2b] text-[0.58rem] last:border-b-0`}
                      >
                        <SpreadsheetCell
                          label={`Row ${n}`}
                          buttonClassName="text-[0.54rem] font-medium text-[#636363]"
                        >
                          {n}
                        </SpreadsheetCell>
                        <SpreadsheetCell
                          label={`Region ${region || 'blank'}`}
                          buttonClassName={`font-semibold ${
                            !region ? 'text-transparent' : 'text-[#d4d4d4]'
                          }`}
                        >
                          {region || '·'}
                        </SpreadsheetCell>
                        <SpreadsheetCell
                          label={`Q3 revenue ${q3 || 'blank'}`}
                          buttonClassName="font-medium text-[#c4c4c4]"
                        >
                          {q3}
                        </SpreadsheetCell>
                        <SpreadsheetCell
                          label={`Q4 revenue ${q4 || 'blank'}`}
                          buttonClassName="font-medium text-[#c4c4c4]"
                        >
                          {q4}
                        </SpreadsheetCell>
                        <SpreadsheetCell
                          label={`Growth ${growth || 'blank'}`}
                          active={Boolean(growth)}
                          buttonClassName={growth ? '' : 'text-transparent'}
                        >
                          {growth || '·'}
                        </SpreadsheetCell>
                        <SpreadsheetCell
                          isLast
                          label={`Contribution ${contrib || 'blank'}`}
                          buttonClassName="font-semibold text-[#c4c4c4]"
                        >
                          {contrib}
                        </SpreadsheetCell>
                      </div>
                    ))}

                    {/* Row 8 – IRR */}
                    <div
                      className={`grid ${SS_GRID} border-b border-[#2b2b2b] text-[0.58rem]`}
                    >
                      <SpreadsheetCell
                        label="Row 8"
                        buttonClassName="text-[0.54rem] font-medium text-[#636363]"
                      >
                        8
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="IRR label"
                        buttonClassName="font-semibold text-[#878787]"
                      >
                        IRR
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="IRR formula"
                        buttonClassName="font-semibold text-[#5da4ff]"
                      >
                        =XIRR(...)
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="IRR value 18.2 percent"
                        active
                      >
                        18.2%
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="Empty IRR helper cell"
                        buttonClassName="text-transparent"
                      />
                      <SpreadsheetCell
                        isLast
                        label="Empty IRR trailing cell"
                        buttonClassName="text-transparent"
                      />
                    </div>

                    {/* Row 9 – MOIC */}
                    <div className={`grid ${SS_GRID} text-[0.58rem]`}>
                      <SpreadsheetCell
                        label="Row 9"
                        buttonClassName="text-[0.54rem] font-medium text-[#636363]"
                      >
                        9
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="MOIC label"
                        buttonClassName="font-semibold text-[#878787]"
                      >
                        MOIC
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="MOIC formula"
                        buttonClassName="font-semibold text-[#5da4ff]"
                      >
                        =D6/B6
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="MOIC value 2.3x"
                        active
                      >
                        2.3x
                      </SpreadsheetCell>
                      <SpreadsheetCell
                        label="Empty MOIC helper cell"
                        buttonClassName="text-transparent"
                      />
                      <SpreadsheetCell
                        isLast
                        label="Empty MOIC trailing cell"
                        buttonClassName="text-transparent"
                      />
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="rounded-[8px] bg-[#262626] px-[9px] pb-[9px] pt-[8px]">
                    <p className="text-[0.54rem] font-semibold uppercase tracking-[0.08em] text-[#6a6a6a]">
                      Revenue by Region ($M)
                    </p>

                    <div className="mt-[9px] flex items-end justify-between gap-2">
                      {CHART_DATA.map(({ label, q3, q4 }) => (
                        <div
                          key={label}
                          className="flex flex-1 flex-col items-center gap-[7px]"
                        >
                          <div className="flex h-[3.5rem] items-end gap-[3px]">
                            <span
                              className="w-[7px] rounded-t-[2px] bg-[#4f5f7e]"
                              style={{ height: `${(q3 / CHART_MAX) * 100}%` }}
                            />
                            <span
                              className="w-[7px] rounded-t-[2px] bg-[#5bd87c]"
                              style={{ height: `${(q4 / CHART_MAX) * 100}%` }}
                            />
                          </div>
                          <span className="text-[0.5rem] font-semibold text-[#7a7a7a]">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-[8px] flex items-center justify-center gap-[12px] text-[0.5rem] font-medium text-[#757575]">
                      <span className="flex items-center gap-[3px]">
                        <span className="h-[5px] w-[5px] rounded-full bg-[#4f5f7e]" />
                        Q3 2024
                      </span>
                      <span className="flex items-center gap-[3px]">
                        <span className="h-[5px] w-[5px] rounded-full bg-[#5bd87c]" />
                        Q4 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
      </div>
    </div>
  );
};

export default ClaudeExcelModalShowcase;
