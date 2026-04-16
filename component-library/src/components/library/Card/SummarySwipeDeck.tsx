"use client";

import { useCallback, useState } from "react";
import { MoveRight } from "lucide-react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";

type SwipeDirection = -1 | 1;

type SummaryCardItem = {
  category: string;
  title: string;
  description: string;
};

const SUMMARY_ITEMS: SummaryCardItem[] = [
  {
    category: "# engineering",
    title: "Code Review Request",
    description:
      "Mike mentioned you in #engineering asking to review PR #234. The changes focus on an authentication refactor and are ready for feedback.",
  },
  {
    category: "# design",
    title: "New Mockups Available",
    description:
      "The latest design mockups for the dashboard have been uploaded. Please review and provide your thoughts by the end of the week.",
  },
  {
    category: "# marketing",
    title: "Campaign Performance Review",
    description:
      "We've gathered the data from last month's campaign. The performance metrics indicate a significant increase in engagement. Let's discuss the insights in our next meeting.",
  },
  {
    category: "# sales",
    title: "Quarterly Sales Targets",
    description:
      "Reminder to review the updated sales targets for Q4. Please ensure your teams are aligned and strategies are adjusted accordingly.",
  },
];

const TRANSITION_MS = 560;
const TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;
const SWIPE_EXIT_PX = 360;
const SWIPE_TRIGGER_PX = 86;
const SWIPE_VELOCITY = 620;
const SERIF_FONT = '"Copernicus Trial", Georgia, serif';
const NON_SELECTABLE_STYLE = {
  userSelect: "none" as const,
  WebkitUserSelect: "none" as const,
  WebkitTouchCallout: "none" as const,
};

function SlackGlyph() {
  return (
    <div className="relative h-5 w-5">
      <span className="absolute left-1/2 top-0 h-2.5 w-1.5 -translate-x-1/2 rounded-full bg-[#31C7E8]" />
      <span className="absolute bottom-0 left-1/2 h-2.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2EB67D]" />
      <span className="absolute left-0 top-1/2 h-1.5 w-2.5 -translate-y-1/2 rounded-full bg-[#E01E5A]" />
      <span className="absolute right-0 top-1/2 h-1.5 w-2.5 -translate-y-1/2 rounded-full bg-[#ECB22E]" />
      <span className="absolute left-[3px] top-[3px] h-1.5 w-1.5 rounded-full bg-[#31C7E8]" />
      <span className="absolute right-[3px] top-[3px] h-1.5 w-1.5 rounded-full bg-[#ECB22E]" />
      <span className="absolute left-[3px] bottom-[3px] h-1.5 w-1.5 rounded-full bg-[#E01E5A]" />
      <span className="absolute bottom-[3px] right-[3px] h-1.5 w-1.5 rounded-full bg-[#2EB67D]" />
    </div>
  );
}

function SummaryCard({ item }: { item: SummaryCardItem }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[36px] bg-white shadow-[0_26px_48px_rgba(216,216,210,0.92)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(252,252,249,0.96))]" />
      <div className="relative flex h-full flex-col px-8 pb-8 pt-7">
        <div className="flex items-start justify-between">
          <SlackGlyph />
          <span className="rounded-full bg-[#f7f7f5] px-3 py-1 text-[13px] leading-none text-black/28">
            Today
          </span>
        </div>

        <div className="mt-4 flex flex-col items-start gap-2">
          <span className="rounded-full bg-[#f5f5f2] px-3 py-1 text-[13px] leading-none text-black/32">
            {item.category}
          </span>
          <span className="rounded-md bg-[#e3effa] px-3 py-1 text-[13px] font-medium leading-none text-[#7aa3c8]">
            You were mentioned
          </span>
        </div>

        <div className="mt-6 max-w-[84%]">
          <h3
            className="text-[36px] leading-[0.96] tracking-[-0.055em] text-black/90"
            style={{ fontFamily: SERIF_FONT, fontWeight: 600 }}
          >
            {item.title}
          </h3>
          <p
            className="mt-5 text-[19px] leading-[1.33] tracking-[-0.02em] text-black/72"
            style={{ fontFamily: SERIF_FONT, fontWeight: 400 }}
          >
            {item.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-10 text-black/58">
          <span className="text-[18px] leading-none">Read more</span>
          <MoveRight className="h-[18px] w-[18px] -rotate-45" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

export default function SummarySwipeDeck() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragX = useMotionValue(0);
  const swipeProgress = useTransform(dragX, (value) =>
    Math.min(Math.abs(value) / SWIPE_EXIT_PX, 1)
  );
  const cardRotate = useTransform(
    dragX,
    [-SWIPE_EXIT_PX, 0, SWIPE_EXIT_PX],
    [-10.5, 0, 10.5]
  );
  const currentCardY = useTransform(swipeProgress, [0, 1], [0, -6]);
  const currentCardScale = useTransform(swipeProgress, [0, 1], [1, 0.992]);
  const currentCardOpacity = useTransform(
    swipeProgress,
    [0, 0.52, 1],
    [1, 0.8, 0.18]
  );
  const currentCardBlur = useTransform(swipeProgress, [0, 1], [0, 10]);
  const currentCardFilter = useMotionTemplate`blur(${currentCardBlur}px)`;
  const underCardY = useTransform(swipeProgress, [0, 1], [18, 0]);
  const underCardScale = useTransform(swipeProgress, [0, 1], [0.972, 1]);
  const underCardOpacity = useTransform(swipeProgress, [0, 1], [0.42, 1]);
  const underCardBlur = useTransform(swipeProgress, [0, 1], [13, 0]);
  const underCardFilter = useMotionTemplate`blur(${underCardBlur}px)`;

  const currentItem = SUMMARY_ITEMS[activeIndex];
  const nextItem = SUMMARY_ITEMS[(activeIndex + 1) % SUMMARY_ITEMS.length];

  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (isAnimating) {
        return;
      }

      if (prefersReducedMotion) {
        dragX.set(0);
        setActiveIndex((current) => (current + 1) % SUMMARY_ITEMS.length);
        return;
      }

      setIsAnimating(true);

      animate(dragX, direction * SWIPE_EXIT_PX, {
        duration: TRANSITION_MS / 1000,
        ease: TRANSITION_EASE,
        onComplete: () => {
          setActiveIndex((current) => (current + 1) % SUMMARY_ITEMS.length);
          dragX.set(0);
          setIsAnimating(false);
        },
      });
    },
    [dragX, isAnimating, prefersReducedMotion]
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const shouldAdvance =
        Math.abs(info.offset.x) > SWIPE_TRIGGER_PX ||
        Math.abs(info.velocity.x) > SWIPE_VELOCITY;

      if (!shouldAdvance) {
        animate(dragX, 0, {
          type: "spring",
          stiffness: 460,
          damping: 34,
          mass: 0.9,
        });
        return;
      }

      commitSwipe(info.offset.x < 0 ? -1 : 1);
    },
    [commitSwipe, dragX]
  );

  return (
    <div
      className="flex items-center justify-center p-6 sm:p-10 select-none"
      style={NON_SELECTABLE_STYLE}
    >
      <div className="relative w-[410px] max-w-[calc(100vw-3rem)] aspect-[0.78] overflow-visible">
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            y: underCardY,
            scale: underCardScale,
            opacity: underCardOpacity,
            filter: underCardFilter,
          }}
        >
          <SummaryCard item={nextItem} />
        </motion.div>

        <motion.div
          drag={isAnimating ? false : "x"}
          dragElastic={0.14}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          onSelectCapture={(event) => event.preventDefault()}
          className="absolute inset-0 z-20 cursor-grab touch-pan-y active:cursor-grabbing select-none"
          style={{
            ...NON_SELECTABLE_STYLE,
            x: dragX,
            y: currentCardY,
            scale: currentCardScale,
            rotate: cardRotate,
            opacity: currentCardOpacity,
            filter: currentCardFilter,
            transformOrigin: "50% 72%",
          }}
        >
          <SummaryCard item={currentItem} />
        </motion.div>
      </div>
    </div>
  );
}
