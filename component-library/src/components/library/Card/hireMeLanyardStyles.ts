export const hireMeLanyardCss = `
@import url('https://fonts.googleapis.com/css2?family=Short+Stack&display=swap');

.hire-r3f-lanyard {
  position: relative;
  width: var(--hire-r3f-width, 680px);
  height: var(--hire-r3f-height, 600px);
  overflow: hidden;
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.hire-r3f-lanyard-canvas {
  position: absolute !important;
  inset: 0;
  z-index: 1;
}

.hire-badge-card {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  padding: 8px;
  border-radius: 28px;
  background: #4a90e2;
  box-shadow: 0 24px 44px rgba(0, 0, 0, 0.12);
  overflow: visible;
}

.hire-badge-card-inner {
  width: 100%;
  height: 100%;
  border-radius: 22px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5% 9% 19%;
}

.hire-badge-photo {
  width: 87%;
  max-width: 380px;
  height: auto;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

.hire-badge-name {
  margin: 0;
  margin-top: 7%;
  font-family: 'Short Stack', cursive;
  font-size: clamp(1.5rem, 2.6vw, 2.55rem);
  line-height: 0.92;
  text-align: center;
  letter-spacing: 0;
  font-weight: 400;
  color: #111111;
  -webkit-text-stroke: 1.5px #111111;
}

.hire-badge-role {
  margin: 10.5% 0 0;
  display: block;
  width: 100%;
  font-family: 'Graphik', system-ui, sans-serif;
  font-size: clamp(1rem, 1.35vw, 1.4rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
  text-align: center;
  color: #000000;
}

.hire-role-focus-text {
  display: inline-block;
  white-space: nowrap;
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.96);
  animation: hire-role-focus-enter 560ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes hire-role-focus-enter {
  65% {
    opacity: 1;
    transform: translate3d(0, -2px, 0) scale(1.02);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (max-width: 767px) {
  .hire-r3f-lanyard {
    width: 360px;
    height: 520px;
  }

  .hire-badge-card {
    border-radius: 24px;
    padding: 7px;
  }

  .hire-badge-card-inner {
    border-radius: 18px;
  }
}
`;
