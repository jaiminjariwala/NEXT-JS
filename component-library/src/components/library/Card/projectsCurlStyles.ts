export const projectsCurlCss = `
@import url('https://fonts.googleapis.com/css2?family=Short+Stack&display=swap');

/* Centering wrapper so the notebook page sits nicely inside any container. */
.projects-embed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 560px;
  padding: 28px;
  box-sizing: border-box;
  background: #ffffff;
}

/* Notebook "page" stage. Keeps the 438/581 page aspect and scales its
   on-page content with the page width via container query units. */
.projects-stage {
  position: relative;
  height: 100%;
  /* Ease the page down a touch so it doesn't fill the whole preview.
     We size it down (rather than transform: scale) so the curl texture,
     which measures the live DOM, stays pixel-accurate and the text
     doesn't misbehave during the page turn. */
  max-height: 84%;
  aspect-ratio: 438 / 581;
  perspective: 1500px;
  container-type: inline-size;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* Each project page in the stack. The interactive page (front) is dragged up
   to curl it away; a WebGL canvas renders the actual curl/turn. */
.projects-card {
  position: absolute;
  inset: 0;
  z-index: 5;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* Interactive page face. Drag it up to turn the page. */
.projects-curl-face {
  cursor: grab;
}

.projects-curl-face:active {
  cursor: grabbing;
}

/* Each text line is its own block so the curl texture can measure it. */
.pc-line {
  display: block;
}

/* WebGL curl overlay — larger than the page (so the lifted curl isn't clipped)
   and centered on the stage. Sits above the faces but below the pin head so the
   pin still reads as threaded through the page. */
.projects-curl-canvas {
  position: absolute;
  top: -120%;
  left: -120%;
  width: 340%;
  height: 340%;
  z-index: 7;
  pointer-events: none;
}

.projects-curl-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* Sits exactly behind the current page (no outward extension); revealed as
   the top page curls away. */
.projects-card-behind {
  z-index: 4;
  touch-action: auto;
  filter: brightness(0.985);
}

.projects-page-img {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.projects-pin {
  position: absolute;
  top: -13%;
  left: -19%;
  width: 48%;
  height: auto;
  z-index: 1;
  transform: rotate(-20deg);
  filter: drop-shadow(0 4px 7px rgba(0, 0, 0, 0.28));
  pointer-events: none;
}

/* Front copy: same pin, but sits ABOVE the page and is clipped to only the
   head end, so the head stays on top of the page while the bar (from the
   base copy behind the page) reads as threaded underneath it. */
.projects-pin-front {
  z-index: 9;
  clip-path: inset(0 0 0 55%);
  filter: none;
}

/* Soft curved shadow where the pin pierces into the page. */
.projects-pin-pierce {
  position: absolute;
  z-index: 8;
  top: 7.5%;
  left: 8%;
  width: 18px;
  height: 16px;
  border-radius: 50%;
  border-left: 9px solid rgba(0, 0, 0, 0.42);
  transform: rotate(-20deg);
  filter: blur(5px);
  pointer-events: none;
}

.projects-page-caption {
  position: absolute;
  top: 60%;
  left: 18%;
  width: 76%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.projects-page-title {
  margin: 0;
  font-family: 'Short Stack', cursive;
  font-size: 5.7cqw;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #111111;
  -webkit-text-stroke: 0.4px #111111;
}

.projects-desc-row {
  display: flex;
  align-items: center;
  gap: 1.4cqw;
  width: 100%;
}

.projects-page-desc {
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  font-family: 'Short Stack', cursive;
  font-size: 4.4cqw;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #333333;
}

.projects-github-link {
  flex: 0 0 auto;
  font-family: 'Short Stack', cursive;
  font-size: 4.4cqw;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #111111;
  -webkit-text-stroke: 0.7px #111111;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.projects-shot-wrap {
  position: absolute;
  top: 14%;
  left: 9%;
  width: 86%;
  z-index: 3;
}

.projects-shot-link {
  position: relative;
  display: block;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.projects-shot-tape {
  position: absolute;
  width: 26%;
  height: auto;
  opacity: 0.82;
  z-index: 6;
  pointer-events: none;
}

.projects-shot-tape-tl {
  top: -8%;
  left: -10%;
  transform: rotate(-45deg);
}

.projects-shot-tape-br {
  bottom: -5%;
  right: -7%;
  transform: rotate(-45deg);
}

.projects-shot-img {
  display: block;
  width: 100%;
  height: auto;
}
`;
