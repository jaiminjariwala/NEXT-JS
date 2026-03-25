'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

const CARD_HEIGHT = 540;
const SEGMENT_HEIGHT = CARD_HEIGHT / 3;
const INITIAL_FOLD = 12;
const INITIAL_BOTTOM_FOLD = 12;
const FOLDED_FOLD = 178;
const ACTIVE_CARD_OFFSET_Y = -26;
const PILE_SCALE = 0.42;
const PILE_Y = 276;
const PILE_LEFT_X = -110;
const PILE_RIGHT_X = 110;
const PILE_ROTATE_X = 32;
const TOP_SEGMENT_EDGE_INSET = 2;
const DRAG_FOLD_DISTANCE = 190;
const DRAG_FOLD_LIMIT = 148;
const UP_DRAG_FLATTEN_DISTANCE = 120;
const DRAG_LIFT_Z = 72;
const BOTTOM_DRAG_FOLD = 18;
const BOTTOM_DRAG_LIFT_Z = 0;
const BOTTOM_DRAG_RISE_Y = 0;
const BOTTOM_HINGE_DROP = 0;
const BOTTOM_HINGE_DEPTH = 0;
const DRAG_TILT_LIMIT = 10;
const DRAG_TILT_DISTANCE = 180;
const LEFT_STACK_RETURN_DELAY = 260;
const ENTRY_MAIN_DURATION = 560;
const ENTRY_SEGMENT_DURATION = 500;
const ENTRY_BOTTOM_DURATION = 520;
const ENTRY_MID_DELAY = 20;
const ENTRY_BOTTOM_DELAY = 30;
const ENTRY_TOP_DELAY = 40;
const RESET_CASCADE_DURATION = 360;
const RESET_CASCADE_STAGGER = 55;
const MAX_PAGES = 5;
const ACTIVE_TILT_OPTIONS = [-5, -4, -3, 3, 4, 5] as const;

const getTopSegmentClipPath = (flattenProgress: number = 0) => {
  const inset = TOP_SEGMENT_EDGE_INSET * (1 - flattenProgress);
  return `polygon(${inset}% 0%, ${100 - inset}% 0%, 100% 100%, 0% 100%)`;
};

const getBottomSegmentTransform = (fold: number, offsetY: number, offsetZ: number) =>
  `translate3d(0, ${offsetY}px, ${offsetZ}px) rotateX(${fold}deg)`;

type PileSide = 'left' | 'right';
type CardState = 'active' | 'entering' | 'idle';
type NavigateResult = PileSide | 'entered';

interface Letter {
  id: number;
  greeting: string;
  signature: string;
  body: string;
}

interface ActiveLetter extends Letter {
  state: CardState;
  from: PileSide;
}

interface FoldingCardHandle {
  exit: (side: PileSide) => void;
}

interface FoldingCardProps {
  letter: Letter;
  state?: CardState;
  onNavigate: (result: NavigateResult) => void;
  isPile?: boolean;
  disableInteraction?: boolean;
  pileSide: PileSide;
  offset?: number;
  isTop?: boolean;
  currentStackHeight?: number;
  sourceStackHeight?: number;
}

interface OutgoingTransition {
  key: number;
  letter: Letter;
  exitSide: PileSide;
  pileSide: PileSide;
  currentStackHeight: number;
  startsReset?: boolean;
}

interface FullLetterLayoutProps {
  letter: Letter;
  isHidden: boolean;
}

const LETTERS: Letter[] = [
  {
    id: 1,
    greeting: 'Dear Atilla,',
    signature: 'Dominik',
    body:
      "Thank you for this note and for the work behind it. I've already spent some time with the new screensaver, and I genuinely find it enchanting. It really stands out in the best possible way. In a web full of visual noise and disposable design, this feels calm, intentional, and remarkably refined.",
  },
  {
    id: 2,
    greeting: 'Hey Atilla,',
    signature: 'Jeff',
    body:
      'Just want to say this is an incredible release. Starting with the background on the installer disk image, it is clear you are about to install software that was not developed, but painstakingly crafted. I was so very thrilled to see Slate and Noir. The whole experience feels considered from edge to edge, and that restraint gives it a rare kind of confidence.',
  },
  {
    id: 3,
    greeting: 'Hi Atilla,',
    signature: 'Chris',
    body:
      'The new clock is amazing. And I loved the old version too. Thank you for your beautiful work. It makes me happy to look at it every day. You can sense immediately that someone cared deeply about proportions, color, and depth. That level of care is what makes it feel calm instead of decorative.',
  },
  {
    id: 4,
    greeting: 'Hey Atilla,',
    signature: 'Martin',
    body:
      'My favorite clock screensaver just got a major glow-up. Bauhaus Clock 2.0. Rebuilt from the ground up, insanely precise, and visually on another level. You can really feel the upgrade. Putting this level of effort into details is genuinely admirable.',
  },
  {
    id: 5,
    greeting: 'Hi Atilla,',
    signature: 'Roobhir',
    body:
      'While I did a double-take at the $19 price tag for a screensaver, it was an easy decision after the first couple of seconds. An excellently crafted product clearly made with lots of love and attention to detail. It feels premium in a way that is immediately visible and difficult to fake.',
  },
];

const PAGES = LETTERS.slice(0, MAX_PAGES);

function FullLetterLayout({ letter, isHidden }: FullLetterLayoutProps) {
  return (
    <div
      className={`pointer-events-none flex h-[540px] w-full select-none flex-col box-border px-11 py-10 text-[#1d1d1f] transition-opacity duration-300 ${
        isHidden ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="mb-5 text-[17px] font-medium">{letter.greeting}</div>
      <div className="flex-1 text-[17px] font-medium leading-[1.72] text-[#3c3c3e]">
        {letter.body}
      </div>
      <div
        className="self-start pt-3 text-[40px] leading-none"
        style={{
          fontFamily: '"Brush Script MT", "Segoe Script", cursive',
          color: '#111',
        }}
      >
        {letter.signature}
      </div>
    </div>
  );
}

const FoldingCard = forwardRef<FoldingCardHandle, FoldingCardProps>(
  function FoldingCard(
    {
      letter,
      state = 'idle',
      onNavigate,
      isPile = false,
      disableInteraction = false,
      pileSide,
      offset = 0,
      isTop = false,
      currentStackHeight = 0,
      sourceStackHeight = 0,
    },
    ref
  ) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const midRef = useRef<HTMLDivElement | null>(null);
    const topRef = useRef<HTMLDivElement | null>(null);
    const drag = useRef({
      active: false,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
    });

    const stateRef = useRef(state);
    useEffect(() => {
      stateRef.current = state;
    }, [state]);

    const activeTilt = useMemo(() => {
      if (isPile) {
        return 0;
      }

      return ACTIVE_TILT_OPTIONS[(letter.id * 17) % ACTIVE_TILT_OPTIONS.length];
    }, [isPile, letter.id]);

    const isInteractive = !isPile && !disableInteraction && state !== 'entering';
    const isHiddenText = isPile && !isTop;

    const getInitialStyles = () => {
      if (isPile) {
        const x = pileSide === 'left' ? PILE_LEFT_X : PILE_RIGHT_X;
        const scale = PILE_SCALE + offset * 0.01;
        const yOffset = offset * 12;

        return {
          transform: `translate3d(${x}px, ${PILE_Y - yOffset}px, 0) scale(${scale}) rotateX(${PILE_ROTATE_X}deg) rotateZ(0deg)`,
          fold: FOLDED_FOLD,
          bottomFold: 0,
          bottomOffsetY: 0,
          bottomOffsetZ: 0,
        };
      }

      if (state === 'entering') {
        const x = pileSide === 'left' ? PILE_LEFT_X : PILE_RIGHT_X;
        const startScale = PILE_SCALE + sourceStackHeight * 0.01;
        const startY = PILE_Y - sourceStackHeight * 12;

        return {
          transform: `translate3d(${x}px, ${startY}px, 0) scale(${startScale}) rotateX(${PILE_ROTATE_X}deg) rotateZ(0deg)`,
          fold: FOLDED_FOLD,
          bottomFold: 0,
          bottomOffsetY: 0,
          bottomOffsetZ: 0,
        };
      }

      return {
        transform: `translate3d(0, ${ACTIVE_CARD_OFFSET_Y}px, 0) scale(1) rotateX(0deg) rotateZ(${activeTilt}deg)`,
        fold: INITIAL_FOLD,
        bottomFold: INITIAL_BOTTOM_FOLD,
        bottomOffsetY: BOTTOM_HINGE_DROP,
        bottomOffsetZ: BOTTOM_HINGE_DEPTH,
      };
    };

    const initial = getInitialStyles();

    useEffect(() => {
      if (state !== 'entering' || !wrapRef.current) {
        return;
      }

      const mainAnimation = wrapRef.current.animate(
        [
          { transform: initial.transform },
          {
            transform: `translate3d(0, ${ACTIVE_CARD_OFFSET_Y}px, 0) scale(1) rotateX(0deg) rotateZ(${activeTilt}deg)`,
          },
        ],
        {
          duration: ENTRY_MAIN_DURATION,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );

      const midAnimation = midRef.current?.animate(
        [
          { transform: `rotateX(${-FOLDED_FOLD}deg)` },
          { transform: `rotateX(${-INITIAL_FOLD}deg)` },
        ],
        {
          duration: ENTRY_SEGMENT_DURATION,
          delay: ENTRY_MID_DELAY,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );

      const bottomAnimation = bottomRef.current?.animate(
        [
          { transform: getBottomSegmentTransform(0, 0, 0) },
          {
            transform: getBottomSegmentTransform(
              INITIAL_BOTTOM_FOLD,
              BOTTOM_HINGE_DROP,
              BOTTOM_HINGE_DEPTH
            ),
          },
        ],
        {
          duration: ENTRY_BOTTOM_DURATION,
          delay: ENTRY_BOTTOM_DELAY,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );

      const topAnimation = topRef.current?.animate(
        [
          { transform: `rotateX(${FOLDED_FOLD}deg)` },
          { transform: `rotateX(${INITIAL_FOLD}deg)` },
        ],
        {
          duration: ENTRY_SEGMENT_DURATION,
          delay: ENTRY_TOP_DELAY,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );

      mainAnimation.onfinish = () => {
        if (wrapRef.current) {
          wrapRef.current.style.transform = `translate3d(0, ${ACTIVE_CARD_OFFSET_Y}px, 0) scale(1) rotateX(0deg) rotateZ(${activeTilt}deg)`;
        }
        if (midRef.current) {
          midRef.current.style.transform = `rotateX(${-INITIAL_FOLD}deg)`;
        }
        if (bottomRef.current) {
          bottomRef.current.style.transform = getBottomSegmentTransform(
            INITIAL_BOTTOM_FOLD,
            BOTTOM_HINGE_DROP,
            BOTTOM_HINGE_DEPTH
          );
        }
        if (topRef.current) {
          topRef.current.style.transform = `rotateX(${INITIAL_FOLD}deg)`;
          topRef.current.style.clipPath = getTopSegmentClipPath();
        }

        mainAnimation.cancel();
        midAnimation?.cancel();
        bottomAnimation?.cancel();
        topAnimation?.cancel();
        onNavigate('entered');
      };
    }, [state, initial.transform, onNavigate, activeTilt]);

    const triggerExit = useCallback(
      (side: PileSide) => {
        if (!wrapRef.current) {
          return;
        }

      const targetX = side === 'left' ? PILE_LEFT_X : PILE_RIGHT_X;
      const targetY = PILE_Y - currentStackHeight * 12;
      const targetScale = PILE_SCALE + currentStackHeight * 0.01;

      if (topRef.current) {
        topRef.current.style.clipPath = getTopSegmentClipPath();
      }

        const mainAnimation = wrapRef.current.animate(
          [
            { transform: wrapRef.current.style.transform || 'translate3d(0, 0, 0)' },
            {
              transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale}) rotateX(${PILE_ROTATE_X}deg) rotateZ(0deg)`,
            },
          ],
          {
            duration: 800,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          }
        );

        midRef.current?.animate(
          [
            { transform: midRef.current.style.transform || 'rotateX(0deg)' },
            { transform: `rotateX(${-FOLDED_FOLD}deg)` },
          ],
          {
            duration: 700,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          }
        );

        bottomRef.current?.animate(
          [
            {
              transform:
                bottomRef.current.style.transform || getBottomSegmentTransform(0, 0, 0),
            },
            { transform: getBottomSegmentTransform(0, 0, 0) },
          ],
          {
            duration: 700,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          }
        );

        topRef.current?.animate(
          [
            { transform: topRef.current.style.transform || 'rotateX(0deg)' },
            { transform: `rotateX(${FOLDED_FOLD}deg)` },
          ],
          {
            duration: 700,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          }
        );

        mainAnimation.onfinish = () => onNavigate(side);
      },
      [currentStackHeight, onNavigate]
    );

    useImperativeHandle(ref, () => ({ exit: triggerExit }), [triggerExit]);

    const handleGlobalMove = (event: MouseEvent | TouchEvent) => {
      if (!drag.current.active) {
        return;
      }

      if ('touches' in event && event.cancelable) {
        event.preventDefault();
      }

      const point = 'touches' in event ? event.touches[0] : event;
      const deltaX = point.clientX - drag.current.startX;
      const deltaY = point.clientY - drag.current.startY;
      const positiveDeltaY = Math.max(0, deltaY);
      const upwardFlattenProgress = Math.min(
        1,
        Math.abs(Math.min(0, deltaY)) / UP_DRAG_FLATTEN_DISTANCE
      );

      drag.current.x = deltaX;
      drag.current.y = deltaY;

      const foldProgress = Math.min(1, positiveDeltaY / DRAG_FOLD_DISTANCE);
      const middleFold =
        deltaY < 0
          ? -INITIAL_FOLD * (1 - upwardFlattenProgress)
          : -INITIAL_FOLD - (DRAG_FOLD_LIMIT - INITIAL_FOLD) * foldProgress;
      const topFold =
        deltaY < 0
          ? INITIAL_FOLD * (1 - upwardFlattenProgress)
          : INITIAL_FOLD + (DRAG_FOLD_LIMIT - INITIAL_FOLD) * foldProgress;
      const dragProgress = Math.min(1, positiveDeltaY / 260);
      const dragLiftZ = DRAG_LIFT_Z * dragProgress;
      const bottomFold =
        deltaY < 0
          ? INITIAL_BOTTOM_FOLD * (1 - upwardFlattenProgress)
          : INITIAL_BOTTOM_FOLD + BOTTOM_DRAG_FOLD * foldProgress;
      const bottomLiftZ = deltaY < 0 ? 0 : BOTTOM_DRAG_LIFT_Z * foldProgress;
      const bottomRiseY = deltaY < 0 ? 0 : BOTTOM_DRAG_RISE_Y * foldProgress;
      const bottomOffsetY = BOTTOM_HINGE_DROP - bottomRiseY;
      const bottomOffsetZ = BOTTOM_HINGE_DEPTH + bottomLiftZ;
      const currentScale = 1 - dragProgress * (1 - PILE_SCALE);
      const dragDirection = deltaX === 0 ? 0 : Math.sign(deltaX);
      const dragDirectionTargetTilt =
        dragDirection === 0
          ? activeTilt
          : dragDirection * Math.max(Math.abs(activeTilt), 4);
      const horizontalTiltProgress = Math.min(
        1,
        Math.abs(deltaX) / DRAG_TILT_DISTANCE
      );
      const horizontalTiltBlend =
        horizontalTiltProgress *
        horizontalTiltProgress *
        (3 - 2 * horizontalTiltProgress);
      const dragDirectionTilt =
        activeTilt +
        (dragDirectionTargetTilt - activeTilt) * horizontalTiltBlend;
      const directionalTilt =
        dragProgress *
        Math.max(
          -DRAG_TILT_LIMIT,
          Math.min(
            DRAG_TILT_LIMIT,
            (deltaX / DRAG_TILT_DISTANCE) * DRAG_TILT_LIMIT
          )
        );
      const tiltZ = dragDirectionTilt + directionalTilt;
      const tiltX =
        deltaY < 0
          ? 0
          : Math.min(PILE_ROTATE_X, positiveDeltaY * (PILE_ROTATE_X / 260));

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${deltaX}px, ${ACTIVE_CARD_OFFSET_Y + deltaY}px, ${dragLiftZ}px) scale(${currentScale}) rotateZ(${tiltZ}deg) rotateX(${tiltX}deg)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `rotateX(${middleFold}deg)`;
      }
      if (bottomRef.current) {
        bottomRef.current.style.transform = getBottomSegmentTransform(
          bottomFold,
          bottomOffsetY,
          bottomOffsetZ
        );
      }
      if (topRef.current) {
        topRef.current.style.transform = `rotateX(${topFold}deg)`;
        topRef.current.style.clipPath = getTopSegmentClipPath(upwardFlattenProgress);
      }
    };

    const handleGlobalEnd = () => {
      if (!drag.current.active) {
        return;
      }

      drag.current.active = false;

      window.removeEventListener('mousemove', handleGlobalMove as EventListener);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove as EventListener);
      window.removeEventListener('touchend', handleGlobalEnd);

      const { x, y } = drag.current;

      if (y > 110 || Math.abs(x) > 150) {
        triggerExit(x >= 0 ? 'right' : 'left');
        return;
      }

      const mainAnimation = wrapRef.current?.animate(
        [
          { transform: wrapRef.current.style.transform },
          {
            transform: `translate3d(0, ${ACTIVE_CARD_OFFSET_Y}px, 0) scale(1) rotateX(0deg) rotateZ(${activeTilt}deg)`,
          },
        ],
        { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      midRef.current?.animate(
        [
          { transform: midRef.current.style.transform },
          { transform: `rotateX(${-INITIAL_FOLD}deg)` },
        ],
        { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      bottomRef.current?.animate(
        [
          {
            transform:
              bottomRef.current.style.transform ||
              getBottomSegmentTransform(
                INITIAL_BOTTOM_FOLD,
                BOTTOM_HINGE_DROP,
                BOTTOM_HINGE_DEPTH
              ),
          },
          {
            transform: getBottomSegmentTransform(
              INITIAL_BOTTOM_FOLD,
              BOTTOM_HINGE_DROP,
              BOTTOM_HINGE_DEPTH
            ),
          },
        ],
        { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      topRef.current?.animate(
        [
          { transform: topRef.current.style.transform },
          { transform: `rotateX(${INITIAL_FOLD}deg)` },
        ],
        { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      if (mainAnimation) {
        mainAnimation.onfinish = () => {
          if (wrapRef.current) {
            wrapRef.current.style.transform = `translate3d(0, ${ACTIVE_CARD_OFFSET_Y}px, 0) scale(1) rotateX(0deg) rotateZ(${activeTilt}deg)`;
          }
          if (midRef.current) {
            midRef.current.style.transform = `rotateX(${-INITIAL_FOLD}deg)`;
          }
          if (bottomRef.current) {
            bottomRef.current.style.transform = getBottomSegmentTransform(
              INITIAL_BOTTOM_FOLD,
              BOTTOM_HINGE_DROP,
              BOTTOM_HINGE_DEPTH
            );
          }
          if (topRef.current) {
            topRef.current.style.transform = `rotateX(${INITIAL_FOLD}deg)`;
            topRef.current.style.clipPath = getTopSegmentClipPath();
          }
        };
      }
    };

    const handleStart = (
      event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (!isInteractive || stateRef.current === 'entering') {
        return;
      }

      const point = 'touches' in event ? event.touches[0] : event;
      drag.current = {
        active: true,
        x: 0,
        y: 0,
        startX: point.clientX,
        startY: point.clientY,
      };

      window.addEventListener('mousemove', handleGlobalMove as EventListener);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove as EventListener, {
        passive: false,
      });
      window.addEventListener('touchend', handleGlobalEnd);
    };

    return (
      <div
        ref={wrapRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={`absolute left-0 top-0 h-full w-full ${
          isInteractive ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          transform: initial.transform,
          zIndex: isPile ? 50 + offset : 300,
          transformStyle: 'preserve-3d',
          touchAction: 'none',
        }}
      >
        <div
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
        <div
          ref={bottomRef}
          className="absolute bottom-0 left-0 w-full overflow-hidden bg-[#fffefb] shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
          style={{
            height: SEGMENT_HEIGHT,
            transform: getBottomSegmentTransform(
              initial.bottomFold,
              initial.bottomOffsetY,
              initial.bottomOffsetZ
            ),
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
            <div style={{ marginTop: -(SEGMENT_HEIGHT * 2) }}>
              <FullLetterLayout letter={letter} isHidden={isHiddenText} />
            </div>
          </div>

          <div
            ref={midRef}
            className="absolute left-0 w-full origin-bottom bg-[#eeeeec] shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
            style={{
              bottom: SEGMENT_HEIGHT,
              height: SEGMENT_HEIGHT,
              transform: `rotateX(${-initial.fold}deg)`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
              <div style={{ marginTop: -SEGMENT_HEIGHT }}>
                <FullLetterLayout letter={letter} isHidden={isHiddenText} />
              </div>
            </div>

            <div
              ref={topRef}
              className="absolute left-0 w-full origin-bottom bg-[#fffefb] shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
              style={{
                bottom: '100%',
                height: SEGMENT_HEIGHT,
              transform: `rotateX(${initial.fold}deg)`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              clipPath: getTopSegmentClipPath(),
            }}
          >
              <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
                <FullLetterLayout letter={letter} isHidden={isHiddenText} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

interface ResetCascadeProps {
  letters: Letter[];
  onDone?: () => void;
}

function ResetCascade({ letters, onDone }: ResetCascadeProps) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const totalTime =
        (letters.length - 1) * RESET_CASCADE_STAGGER + RESET_CASCADE_DURATION;
      await new Promise((resolve) => setTimeout(resolve, totalTime));
      if (!cancelled) {
        onDone?.();
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [letters, onDone]);

  return (
    <>
      {letters.map((letter, index) => {
        const fromIndex = letters.length - 1 - index;
        const toIndex = index;
        const fromTransform = `translate3d(${PILE_RIGHT_X}px, ${PILE_Y - fromIndex * 12}px, 0) scale(${PILE_SCALE + fromIndex * 0.01}) rotateX(${PILE_ROTATE_X}deg) rotateZ(0deg)`;
        const toTransform = `translate3d(${PILE_LEFT_X}px, ${PILE_Y - toIndex * 12}px, 0) scale(${PILE_SCALE + toIndex * 0.01}) rotateX(${PILE_ROTATE_X}deg) rotateZ(0deg)`;

        return (
          <div
            key={`reset-${letter.id}`}
            className="absolute left-0 top-0 h-full w-full"
            style={{
              animation: `resetSlideStraight ${RESET_CASCADE_DURATION}ms cubic-bezier(0.45, 0, 0.55, 1) ${index * RESET_CASCADE_STAGGER}ms forwards`,
              transform: fromTransform,
              zIndex: 500 - index,
              '--from': fromTransform,
              '--to': toTransform,
              transformStyle: 'preserve-3d',
            } as React.CSSProperties & Record<'--from' | '--to', string>}
          >
            <div
              className="relative h-full w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="absolute bottom-0 left-0 w-full overflow-hidden bg-[#fffefb] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                style={{ height: SEGMENT_HEIGHT }}
              >
                <div style={{ marginTop: -(SEGMENT_HEIGHT * 2) }}>
                  <FullLetterLayout letter={letter} isHidden={false} />
                </div>
              </div>

              <div
                className="absolute left-0 w-full origin-bottom bg-[#eeeeec] shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                style={{
                  bottom: SEGMENT_HEIGHT,
                  height: SEGMENT_HEIGHT,
                  transform: `rotateX(${-FOLDED_FOLD}deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
                  <div style={{ marginTop: -SEGMENT_HEIGHT }}>
                    <FullLetterLayout letter={letter} isHidden={false} />
                  </div>
                </div>

                <div
                  className="absolute left-0 w-full origin-bottom bg-[#fffefb] shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
                  style={{
                    bottom: '100%',
                    height: SEGMENT_HEIGHT,
                    transform: `rotateX(${FOLDED_FOLD}deg)`,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    clipPath: 'polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)',
                  }}
                >
                  <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
                    <FullLetterLayout letter={letter} isHidden={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function FoldingLetters() {
  const [leftStack, setLeftStack] = useState<Letter[]>(() => [
    ...PAGES.slice(1),
  ].reverse());
  const [rightStack, setRightStack] = useState<Letter[]>([]);
  const [activeLetter, setActiveLetter] = useState<ActiveLetter | null>(() => ({
    ...PAGES[0],
    state: 'active',
    from: 'left',
  }));
  const [outgoingTransition, setOutgoingTransition] =
    useState<OutgoingTransition | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const activeRef = useRef<FoldingCardHandle | null>(null);
  const outgoingRef = useRef<FoldingCardHandle | null>(null);
  const transitionKeyRef = useRef(0);
  const returnTimeoutRef = useRef<number | null>(null);

  const toLetter = useCallback(
    (letter: ActiveLetter | Letter): Letter => ({
      id: letter.id,
      greeting: letter.greeting,
      signature: letter.signature,
      body: letter.body,
    }),
    []
  );

  const handleNavigate = useCallback(
    (result: NavigateResult) => {
      if (result === 'entered') {
        setIsBusy(false);
        setActiveLetter((previous) =>
          previous ? { ...previous, state: 'active' } : null
        );
        return;
      }

      if (!activeLetter) {
        return;
      }

      const currentLetter = toLetter(activeLetter);

      if (result === 'right') {
        setRightStack((previous) => [...previous, currentLetter]);

        if (leftStack.length === 0) {
          setActiveLetter(null);
          window.setTimeout(() => setIsResetting(true), 150);
          return;
        }

        const nextLetter = leftStack[leftStack.length - 1];
        setLeftStack((previous) => previous.slice(0, -1));
        setActiveLetter({ ...nextLetter, state: 'entering', from: 'left' });
        return;
      }

      setLeftStack((previous) => [...previous, currentLetter]);

      const nextLetter = rightStack[rightStack.length - 1];
      if (!nextLetter) {
        setIsBusy(true);
        setActiveLetter(null);

        if (returnTimeoutRef.current !== null) {
          window.clearTimeout(returnTimeoutRef.current);
        }

        returnTimeoutRef.current = window.setTimeout(() => {
          setLeftStack((previous) => previous.slice(0, -1));
          setActiveLetter({ ...currentLetter, state: 'entering', from: 'left' });
          returnTimeoutRef.current = null;
        }, LEFT_STACK_RETURN_DELAY);
        return;
      }

      setRightStack((previous) => previous.slice(0, -1));
      setActiveLetter({ ...nextLetter, state: 'entering', from: 'right' });
    },
    [activeLetter, leftStack, rightStack, toLetter]
  );

  const finishReset = useCallback(() => {
    if (returnTimeoutRef.current !== null) {
      window.clearTimeout(returnTimeoutRef.current);
      returnTimeoutRef.current = null;
    }

    setRightStack([]);
    setLeftStack([...PAGES.slice(1)].reverse());
    setActiveLetter({ ...PAGES[0], state: 'active', from: 'left' });
    setOutgoingTransition(null);
    setIsResetting(false);
    setIsBusy(false);
  }, []);

  useEffect(() => {
    return () => {
      if (returnTimeoutRef.current !== null) {
        window.clearTimeout(returnTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!outgoingTransition) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      outgoingRef.current?.exit(outgoingTransition.exitSide);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [outgoingTransition]);

  const handleOutgoingNavigate = useCallback((result: NavigateResult) => {
    if (result === 'entered') {
      return;
    }

    setOutgoingTransition((current) => {
      if (!current || current.exitSide !== result) {
        return current;
      }

      if (current.startsReset) {
        window.setTimeout(() => setIsResetting(true), 150);
      }

      return null;
    });
  }, []);

  const startButtonTransition = useCallback(
    (side: PileSide) => {
      if (!activeLetter || isBusy || isResetting) {
        return;
      }

      const currentLetter = toLetter(activeLetter);

      if (side === 'right') {
        const nextLetter = leftStack[leftStack.length - 1];

        setIsBusy(true);
        setOutgoingTransition({
          key: transitionKeyRef.current++,
          letter: currentLetter,
          exitSide: 'right',
          pileSide: activeLetter.from,
          currentStackHeight: rightStack.length,
          startsReset: !nextLetter,
        });
        setRightStack((previous) => [...previous, currentLetter]);

        if (!nextLetter) {
          setActiveLetter(null);
          return;
        }

        setLeftStack((previous) => previous.slice(0, -1));
        setActiveLetter({ ...nextLetter, state: 'entering', from: 'left' });
        return;
      }

      const nextLetter = rightStack[rightStack.length - 1];
      if (!nextLetter) {
        return;
      }

      setIsBusy(true);
      setOutgoingTransition({
        key: transitionKeyRef.current++,
        letter: currentLetter,
        exitSide: 'left',
        pileSide: activeLetter.from,
        currentStackHeight: leftStack.length,
      });
      setLeftStack((previous) => [...previous, currentLetter]);
      setRightStack((previous) => previous.slice(0, -1));
      setActiveLetter({ ...nextLetter, state: 'entering', from: 'right' });
    },
    [activeLetter, isBusy, isResetting, leftStack, rightStack, toLetter]
  );

  const handleNext = () => {
    startButtonTransition('right');
  };

  const handlePrev = () => {
    if (rightStack.length === 0) {
      return;
    }

    startButtonTransition('left');
  };

  return (
    <div
      className="relative h-[760px] w-[680px] overflow-hidden rounded-[40px] font-sans select-none"
      style={{
        background:
          'radial-gradient(circle at top, rgba(249,249,247,1) 0%, rgba(239,239,236,1) 62%, rgba(233,233,230,1) 100%)',
      }}
    >
      <style>{`
        .card-wrap {
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        @keyframes resetSlideStraight {
          from { transform: var(--from); }
          to { transform: var(--to); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-[46%] z-[400] flex -translate-y-1/2 justify-between px-10">
        <button
          onClick={handlePrev}
          className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-white/90 shadow-[0_12px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.05)] backdrop-blur transition-all ${
            rightStack.length === 0 || isResetting || isBusy
              ? 'cursor-not-allowed opacity-20'
              : 'hover:scale-110 hover:shadow-md active:scale-95'
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#222"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-white/90 shadow-[0_12px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.05)] backdrop-blur transition-all ${
            isResetting || isBusy
              ? 'cursor-not-allowed opacity-20'
              : 'hover:scale-110 hover:shadow-md active:scale-95'
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#222"
            strokeWidth="2.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="card-wrap absolute left-1/2 top-[46%] h-[540px] w-[420px] origin-center [transform:translate(-50%,-50%)_scale(0.92)]">
        {!isResetting &&
          leftStack.map((letter, index) => (
            <FoldingCard
              key={`left-${letter.id}`}
              letter={letter}
              isPile={true}
              pileSide="left"
              offset={index}
              isTop={index === leftStack.length - 1}
              onNavigate={handleNavigate}
            />
          ))}

        {!isResetting &&
          rightStack.map((letter, index) => (
            <FoldingCard
              key={`right-${letter.id}`}
              letter={letter}
              isPile={true}
              pileSide="right"
              offset={index}
              isTop={index === rightStack.length - 1}
              onNavigate={handleNavigate}
            />
          ))}

        {isResetting && (
          <ResetCascade letters={[...PAGES].reverse()} onDone={finishReset} />
        )}

        {!isResetting && outgoingTransition && (
          <FoldingCard
            key={`outgoing-${outgoingTransition.key}-${outgoingTransition.letter.id}`}
            ref={outgoingRef}
            letter={outgoingTransition.letter}
            disableInteraction={true}
            pileSide={outgoingTransition.pileSide}
            onNavigate={handleOutgoingNavigate}
            currentStackHeight={outgoingTransition.currentStackHeight}
          />
        )}

        {!isResetting && activeLetter && (
          <FoldingCard
            key={`active-${activeLetter.id}`}
            ref={activeRef}
            letter={activeLetter}
            state={activeLetter.state}
            pileSide={activeLetter.from}
            onNavigate={handleNavigate}
            currentStackHeight={
              activeLetter.from === 'left' ? rightStack.length : leftStack.length
            }
            sourceStackHeight={
              activeLetter.from === 'left' ? leftStack.length : rightStack.length
            }
          />
        )}
      </div>
    </div>
  );
}
