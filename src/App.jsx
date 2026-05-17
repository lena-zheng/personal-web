import React from 'react';

const heroImage = '/assets/image-6.png';

const navItems = ['HOME', 'ABOUT ME', 'PROJECT', 'CONTACT'];

export default function App() {
  return (
    <main className="hero-page">
      <header className="hero-nav" aria-label="Primary">
        {navItems.map((item) => (
          <a key={item} href="#" className="hero-nav-item">
            {item}
          </a>
        ))}
      </header>

      <section className="hero-content" aria-label="Intro Hero">
        <h1 className="hero-title">HI, I&apos;M LENA</h1>

        <div className="hero-role-row" aria-hidden="true">
          <span>PRODUCT</span>
          <span>DESIGNER</span>
        </div>

        <div className="hero-image-wrap">
          <img src={heroImage} alt="Lena character portrait" className="hero-image" />
        </div>

        <div className="hero-actions">
          <button type="button" className="hero-btn">
            About me
          </button>
          <button type="button" className="hero-btn">
            contect me
          </button>
        </div>
      </section>
    </main>
  );
}
