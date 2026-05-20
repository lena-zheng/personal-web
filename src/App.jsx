import React, { useRef, useState } from 'react';
import DotGrid from './DotGrid';

const heroImages = {
  default: '/assets/hero-default.png',
  left: '/assets/hero-left.png',
  right: '/assets/hero-right.png',
};

const navItems = ['HOME', 'ABOUT ME', 'PROJECT', 'CONTACT'];

export default function App() {
  const [heroImageState, setHeroImageState] = useState('default');
  const imageWrapRef = useRef(null);
  const frameRef = useRef(0);

  const moveHeroImage = (event) => {
    const imageWrap = imageWrapRef.current;
    const stageRect = event.currentTarget.getBoundingClientRect();

    if (!imageWrap) {
      return;
    }

    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      const rect = imageWrap.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxX = event.clientX >= centerX ? stageRect.right - centerX : centerX - stageRect.left;
      const maxY = event.clientY >= centerY ? stageRect.bottom - centerY : centerY - stageRect.top;
      const offsetX = Math.max(-1, Math.min(1, (event.clientX - centerX) / maxX)) * 50;
      const offsetY = Math.max(-1, Math.min(1, (event.clientY - centerY) / maxY)) * 50;

      imageWrap.style.setProperty('--hero-image-x', `${offsetX}px`);
      imageWrap.style.setProperty('--hero-image-y', `${offsetY}px`);
    });
  };

  const resetHeroImage = () => {
    const imageWrap = imageWrapRef.current;

    if (!imageWrap) {
      return;
    }

    window.cancelAnimationFrame(frameRef.current);
    imageWrap.style.setProperty('--hero-image-x', '0px');
    imageWrap.style.setProperty('--hero-image-y', '0px');
  };

  return (
    <main className="hero-page">
      <nav className="hero-nav" aria-label="Primary">
        {navItems.map((item) => (
          <a key={item} href="#" className="hero-nav-item">
            {item}
          </a>
        ))}
      </nav>

      <DotGrid className="hero-dot-grid" />

      <section className="hero-stage" aria-label="Intro Hero" onPointerMove={moveHeroImage} onPointerLeave={resetHeroImage}>
        <h1 className="hero-title">HI, I&apos;M LENA</h1>

        <div className="hero-role-row">
          <span>PRODUCT</span>
          <span>DESIGNER</span>
        </div>

        <div className="hero-image-wrap" ref={imageWrapRef}>
          <img src={heroImages[heroImageState]} alt="Lena character portrait" className="hero-image" />
          {Object.entries(heroImages)
            .filter(([key]) => key !== heroImageState)
            .map(([key, src]) => (
              <img key={key} src={src} alt="" className="hero-image-preload" aria-hidden="true" />
            ))}
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="hero-btn"
            aria-label="About me"
            onPointerEnter={() => setHeroImageState('left')}
            onPointerLeave={() => setHeroImageState('default')}
            onFocus={() => setHeroImageState('left')}
            onBlur={() => setHeroImageState('default')}
          >
            <span className="hero-btn-label" aria-hidden="true">
              <span>About me</span>
              <span>About me</span>
            </span>
          </button>
          <button
            type="button"
            className="hero-btn"
            aria-label="contect me"
            onPointerEnter={() => setHeroImageState('right')}
            onPointerLeave={() => setHeroImageState('default')}
            onFocus={() => setHeroImageState('right')}
            onBlur={() => setHeroImageState('default')}
          >
            <span className="hero-btn-label" aria-hidden="true">
              <span>contect me</span>
              <span>contect me</span>
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
