import React, { useState } from 'react';

const RefinedGlassFolder: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div 
        style={styles.folderAnchor}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. THE MAIN BODY (Backplate) */}
        <div style={styles.backPlate} />

        {/* 2. DYNAMIC IMAGE CARDS - Horizontally Stacked & Tilted */}
        {/* Left Card - Tilted Left */}
        <div style={{ 
          ...styles.paper, 
          ...styles.paperLeft,
          backgroundImage: 'url(/photo-1.jpeg)',
          transform: isHovered 
            ? 'translate(-50%, -60px) translateX(-70px) rotateY(30deg) rotateZ(-18deg)' 
            : 'translate(-50%, -5px) translateX(-30px) rotateY(15deg) rotateZ(-8deg)'
        }} />
        
        {/* Middle Card - Straight */}
        <div style={{ 
          ...styles.paper, 
          ...styles.paperMid,
          backgroundImage: 'url(/photo-2.jpeg)',
          transform: isHovered 
            ? 'translate(-50%, -55px) translateX(0px) rotateZ(4deg)' 
            : 'translate(-50%, 5px) translateX(0px) rotateZ(1deg)'
        }} />
        
        {/* Right Card - Tilted Right */}
        <div style={{ 
          ...styles.paper, 
          ...styles.paperRight,
          backgroundImage: 'url(/photo-3.jpeg)',
          transform: isHovered 
            ? 'translate(-50%, -50px) translateX(70px) rotateY(-30deg) rotateZ(18deg)' 
            : 'translate(-50%, 10px) translateX(30px) rotateY(-15deg) rotateZ(8deg)'
        }} />

        {/* 3. TILTED GLASS FRONT (Asymmetric & Rounded) */}
        <div style={{
          ...styles.glassPerspectiveWrapper,
          transform: isHovered ? 'rotateX(-35deg)' : 'rotateX(-20deg)'
        }}>
          <div style={styles.glassShape}>
            {/* Glossy Overlay */}
            <div style={styles.glassGloss} />
            {/* The "Smoke" Texture */}
            <div style={styles.glassGrain} />
          </div>
        </div>
        
        {/* 4. BOTTOM SHADOW (Grounding) */}
        <div style={{
          ...styles.groundShadow,
          opacity: isHovered ? 0.4 : 0.2,
          transform: `translateX(-50%) scale(${isHovered ? 1.1 : 1})`
        }} />
      </div>
    </div>
  );
};

// --- STYLES ---

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '25rem',
    width: '25rem',
    backgroundColor: '#ffffff',
    borderRadius: '32px',
  },
  folderAnchor: {
    position: 'relative',
    width: '280px',
    height: '240px',
    perspective: '1500px',
    cursor: 'pointer',
  },
  backPlate: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '90%',
    backgroundColor: '#000000',
    borderRadius: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  paper: {
    position: 'absolute',
    left: '50%',
    top: '50px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    transformStyle: 'preserve-3d',
    zIndex: 2,
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paperLeft: { width: '150px', height: '160px', zIndex: 2 },
  paperMid:  { width: '160px', height: '170px', zIndex: 3 },
  paperRight: { width: '155px', height: '165px', zIndex: 4 },
  
  // GLASS SECTION
  glassPerspectiveWrapper: {
    position: 'absolute',
    bottom: '0px',
    width: '100%',
    height: '89%',
    zIndex: 10,
    transformOrigin: 'bottom center',
    transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  glassShape: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(8px) saturate(180%)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
    border: '1.5px solid rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
    // Glass UI with rounded top AND bottom edges (28px radius on all visible corners)
    clipPath: 'path("M 0 70 C 0 50 12 38 28 38 L 145 38 C 153 38 158 34 162 28 L 172 18 C 176 13 182 10 190 10 L 252 10 C 270 10 280 20 280 38 L 280 188 C 280 204 270 214 252 214 L 28 214 C 10 214 0 204 0 188 Z")',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.15)',
  },
  glassGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
  },
  glassGrain: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  },
  groundShadow: {
    position: 'absolute',
    bottom: '-40px',
    left: '50%',
    width: '80%',
    height: '20px',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
    filter: 'blur(10px)',
    transition: 'all 0.6s ease',
    zIndex: 0,
  }
};

export default RefinedGlassFolder;

// final code 2