import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DotGrid from './DotGrid';
import ShapeGrid from './ShapeGrid';
import StickerPeel from './StickerPeel';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const heroImages = {
  default: '/assets/hero-default.png',
  left: '/assets/hero-left.png',
  right: '/assets/hero-right.png',
};

const navItems = [
  { href: '#home', label: 'HOME' },
  { href: '#about', label: 'ABOUT ME' },
  { href: '#project', label: 'PROJECT' },
  { href: '#contact', label: 'CONTACT' },
];

const skills = [
  {
    className: 'about-pill--full-funnel',
    label: 'FULL-FUNNEL UX',
    rotation: -12.13,
  },
  {
    className: 'about-pill--design-systems',
    label: 'DESIGN SYSTEMS',
    rotation: 31.56,
  },
  {
    className: 'about-pill--data-design',
    label: 'DATA-DRIVEN DESIGN',
    rotation: 14.83,
  },
  {
    className: 'about-pill--overseas',
    label: 'OVERSEAS PROJECT',
    rotation: 17.14,
  },
  {
    className: 'about-pill--premium',
    label: 'PREMIUM GROWTH',
    rotation: -8.48,
  },
  {
    className: 'about-pill--vibe',
    label: 'VIBE CODING',
    rotation: -20,
  },
];

const aboutIntro =
  'Skilled at boosting premium subscription growth via full-app link strategies including onboarding, paywall, features, promotions and emails. Build sustainable conversion systems through data-driven funnel analysis and A/B testing.';

const aboutDetails =
  'Capable of end-to-end software-hardware ecosystem integration. Simplify complex rules into reusable, actionable SOPs and templates to cut collaboration costs and boost delivery efficiency.';

const projectItems = Array.from({ length: 10 }, (_, index) => ({
  number: String(index + 1).padStart(2, '0'),
  title: 'premium conversion',
  description: 'Designing Across the Premium Conversion Journey',
}));

const projectCardRotations = [6.86, -3.47, 4.3, -6.1, 2.8, -4.8, 5.4, -2.6, 3.7, -5.2];

const contactItems = [
  { label: 'WeChat', value: 'X_Lena_zheng' },
  { label: 'Phone number', value: '17863961311' },
  { label: 'Email', value: '17863961311@163.com' },
];

function ScrollFloat({
  children,
  scrollContainerRef,
  as: Component = 'h2',
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'top bottom-=8%',
  scrollEnd = 'top center+=8%',
  stagger = 0.02,
}) {
  const containerRef = useRef(null);

  const splitText = React.useMemo(() => {
    const text = typeof children === 'string' ? children : '';

    return text.split(/(\s+)/).map((token, tokenIndex) => {
      if (/^\s+$/.test(token)) {
        return (
          <span className="char" key={`space-${tokenIndex}`} aria-hidden="true">
            {'\u00A0'}
          </span>
        );
      }

      return (
        <span className="scroll-float-word" key={`${token}-${tokenIndex}`} aria-hidden="true">
          {token.split('').map((char, charIndex) => (
            <span className="char" key={`${char}-${tokenIndex}-${charIndex}`}>
              {char}
            </span>
          ))}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) {
      return undefined;
    }

    const scroller = scrollContainerRef?.current || window;
    const charElements = el.querySelectorAll('.char');
    const animation = gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%',
      },
      {
        duration: animationDuration,
        ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
        },
      },
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <Component ref={containerRef} className={`scroll-float ${containerClassName}`} aria-label={children}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </Component>
  );
}

function ContactSection() {
  return (
    <section className="contact-page" id="contact" aria-label="Contact me">
      <div className="contact-canvas">
        <div className="contact-left">
          <div className="contact-title">
            <span>CONTACT</span>
            <span>ME</span>
          </div>

          <img className="contact-hand" src="/assets/contact-hand-purple.png" alt="" aria-hidden="true" />
        </div>

        <div className="contact-list" aria-label="Contact methods">
          {contactItems.map((item) => (
            <button className="contact-list-item" type="button" key={item.label}>
              <span className="contact-list-label">{item.label}</span>
              <span className="contact-flow-layer" aria-hidden="true">
                <span className="contact-flow-track">
                  {Array.from({ length: 6 }, (_, index) => (
                    <span className="contact-flow-text" key={`${item.label}-${index}`}>
                      {item.value}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSection({ scrollContainerRef }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) {
      return undefined;
    }

    const scroller = scrollContainerRef?.current || window;
    const cards = gsap.utils.toArray(section.querySelectorAll('.project-card-shell'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      const title = section.querySelector('.project-title');
      const getIntroX = () => {
        const stageWidth = section.getBoundingClientRect().width;
        const desiredLeft = stageWidth < 700 ? stageWidth * 0.1 : stageWidth * 0.36;

        return desiredLeft - track.offsetLeft;
      };
      const getIntroY = () => {
        const stageHeight = section.querySelector('.project-sticky')?.getBoundingClientRect().height || window.innerHeight;
        const desiredTop = stageHeight < 760 ? stageHeight * 0.17 : stageHeight * 0.19;

        return desiredTop - track.offsetTop;
      };
      const getFinalX = () => {
        const stageWidth = section.getBoundingClientRect().width;
        const endPadding = Math.min(stageWidth * 0.42, 520);

        return getIntroX() - (track.scrollWidth - stageWidth + endPadding);
      };

      gsap.set(title, {
        opacity: 0,
        scale: 0.78,
        transformOrigin: '50% 50%',
      });

      gsap.set(cards, {
        rotation: (index) => projectCardRotations[index % projectCardRotations.length],
        yPercent: (index) => (index % 2 === 0 ? -4 : 10),
        transformOrigin: '50% 50%',
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.85,
            invalidateOnRefresh: true,
          },
        })
        .to(title, {
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          duration: 0.1,
        })
        .to(track, {
          x: getIntroX,
          y: getIntroY,
          ease: 'power1.out',
          duration: 0.14,
        }, 0.1)
        .to(cards, {
          yPercent: (index) => (index % 2 === 0 ? 10 : -8),
          rotation: (index) => -projectCardRotations[index % projectCardRotations.length],
          ease: 'none',
          duration: 0.9,
        }, 0.1)
        .to(track, {
          x: getFinalX,
          y: getIntroY,
          ease: 'none',
          duration: 0.76,
        }, 0.24);

      ScrollTrigger.create({
        trigger: section,
        scroller,
        start: 'top 85%',
        end: 'top top',
        scrub: true,
        animation: gsap.fromTo(
          title,
          { opacity: 0, scale: 0.78 },
          { opacity: 1, scale: 1, ease: 'none', immediateRender: false },
        ),
      });
    }, section);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, [scrollContainerRef]);

  return (
    <section className="project-page" id="project" aria-label="Project" ref={sectionRef}>
      <div className="project-sticky">
        <div className="project-canvas">
          <h2 className="project-title">MY PROJECT</h2>

          <div className="project-track" ref={trackRef}>
            {projectItems.map((item) => (
              <article className="project-card-shell" key={item.number}>
                <div className="project-card">
                  <header className="project-card-header">
                    <div className="project-card-copy">
                      <span className="project-card-number">{item.number}</span>
                      <span className="project-card-text">
                        <span className="project-card-name">{item.title}</span>
                        <span className="project-card-description">{item.description}</span>
                      </span>
                    </div>
                    <button className="project-card-link" type="button" aria-label={`Open project ${item.number}`}>
                      <span aria-hidden="true"></span>
                    </button>
                  </header>
                  <div className="project-card-media" aria-hidden="true">
                    <div className="project-card-media-grid"></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
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
    <section className="hero-page" id="home" aria-label="Intro Hero">
      <DotGrid className="hero-dot-grid" />

      <div className="hero-stage" onPointerMove={moveHeroImage} onPointerLeave={resetHeroImage}>
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
            onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
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
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
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
      </div>
    </section>
  );
}

function AboutSection({ scrollContainerRef }) {
  const sectionRef = useRef(null);
  const scrambleEnabledRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    const scroller = scrollContainerRef?.current || window;
    const decorations = gsap.utils.toArray(section.querySelectorAll('.about-decor'));
    const fromVars = {
      'about-pill--full-funnel': { xPercent: -80, yPercent: -40, rotation: -34 },
      'about-pill--design-systems': { xPercent: -120, yPercent: -10, rotation: 58 },
      'about-pill--data-design': { xPercent: -80, yPercent: 70, rotation: 36 },
      'about-pill--overseas': { xPercent: 85, yPercent: -55, rotation: 38 },
      'about-pill--premium': { xPercent: 95, yPercent: -5, rotation: -24 },
      'about-pill--vibe': { xPercent: 85, yPercent: 80, rotation: -42 },
      'about-sticker--small': { xPercent: -95, yPercent: 60, rotation: -42 },
      'about-sticker--flowers': { xPercent: 95, yPercent: 55, rotation: 36 },
    };

    decorations.forEach((node) => {
      const className = [...node.classList].find((name) => fromVars[name]);

      gsap.set(node, {
        ...(fromVars[className] || {}),
        opacity: 0,
        scale: 0.5,
        transformOrigin: '50% 50%',
      });
    });

    const trigger = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top top+=12%',
      onEnter: () => {
        gsap.to(decorations, {
          opacity: 1,
          xPercent: 0,
          yPercent: 0,
          scale: 1,
          rotation: (index, target) => Number(target.dataset.rotation || 0),
          duration: 0.95,
          ease: 'elastic.out(1, 0.65)',
          stagger: {
            each: 0.055,
            from: 'center',
          },
          delay: 0.22,
          overwrite: 'auto',
        });
      },
      onLeaveBack: () => {
        decorations.forEach((node) => {
          const className = [...node.classList].find((name) => fromVars[name]);

          gsap.to(node, {
            ...(fromVars[className] || {}),
            opacity: 0,
            scale: 0.5,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      },
    });

    return () => {
      trigger.kill();
      gsap.killTweensOf(decorations);
    };
  }, [scrollContainerRef]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    const scroller = scrollContainerRef?.current || window;
    const scrambleBlocks = gsap.utils.toArray(section.querySelectorAll('.about-scramble'));
    const charElements = gsap.utils.toArray(section.querySelectorAll('.about-scramble .char'));

    if (scrambleBlocks.length === 0 || charElements.length === 0) {
      return undefined;
    }

    charElements.forEach((char) => {
      char.dataset.content = char.textContent || '';
    });

    const lockCharacterWidths = () => {
      charElements.forEach((char) => {
        if (!char.dataset.content?.trim() || char.dataset.lockedWidth) {
          return;
        }

        const width = char.getBoundingClientRect().width;
        char.dataset.lockedWidth = `${width}`;
        char.style.width = `${width}px`;
      });
    };

    const availabilityTrigger = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top top+=8%',
      onEnter: () => {
        scrambleEnabledRef.current = true;
        requestAnimationFrame(lockCharacterWidths);
      },
      onLeaveBack: () => {
        scrambleEnabledRef.current = false;
        gsap.killTweensOf(charElements);
        charElements.forEach((char) => {
          char.textContent = char.dataset.content || '';
          char.style.width = '';
          delete char.dataset.lockedWidth;
        });
      },
    });

    const handleMove = (event) => {
      if (!scrambleEnabledRef.current) {
        return;
      }

      charElements.forEach((char) => {
        const originalText = char.dataset.content || '';

        if (!originalText.trim()) {
          return;
        }

        const { left, top, width, height } = char.getBoundingClientRect();
        const dx = event.clientX - (left + width / 2);
        const dy = event.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);
        const radius = char.closest('.about-title-scramble') ? 56 : 72;

        if (dist < radius) {
          gsap.to(char, {
            overwrite: true,
            duration: (char.closest('.about-title-scramble') ? 0.42 : 0.55) * (1 - dist / radius),
            scrambleText: {
              text: originalText,
              chars: '.:',
              speed: char.closest('.about-title-scramble') ? 0.12 : 0.16,
            },
            ease: 'none',
          });
        }
      });
    };

    scrambleBlocks.forEach((block) => block.addEventListener('pointermove', handleMove));

    return () => {
      scrambleBlocks.forEach((block) => block.removeEventListener('pointermove', handleMove));
      availabilityTrigger.kill();
      gsap.killTweensOf(charElements);
      charElements.forEach((char) => {
        char.style.width = '';
        delete char.dataset.lockedWidth;
      });
    };
  }, [scrollContainerRef]);

  return (
    <section className="about-page" id="about" aria-label="About me" ref={sectionRef}>
      <div className="about-canvas">
        <div className="about-copy">
          <ScrollFloat
            as="h1"
            scrollContainerRef={scrollContainerRef}
            containerClassName="about-scramble about-title-scramble"
            stagger={0.035}
            scrollEnd="top center+=20%"
          >
            ABOUT ME
          </ScrollFloat>
          <div className="about-description about-scramble">
            <ScrollFloat
              as="p"
              scrollContainerRef={scrollContainerRef}
              animationDuration={0.8}
              scrollStart="top bottom-=8%"
              scrollEnd="top bottom-=30%"
              stagger={0.003}
            >
              {aboutIntro}
            </ScrollFloat>
            <ScrollFloat
              as="p"
              scrollContainerRef={scrollContainerRef}
              animationDuration={0.8}
              scrollStart="top bottom-=8%"
              scrollEnd="top bottom-=30%"
              stagger={0.003}
            >
              {aboutDetails}
            </ScrollFloat>
          </div>
        </div>

        {skills.map((skill) => (
          <div key={skill.label} className={`about-pill about-decor ${skill.className}`} data-rotation={skill.rotation}>
            <span>{skill.label}</span>
          </div>
        ))}

        <StickerPeel
          className="about-sticker about-decor about-sticker--small"
          imageSrc="/assets/about-flower-small.svg"
          width="100%"
          peelBackHoverPct={18}
          peelBackActivePct={34}
          peelDirection={8}
          shadowIntensity={0.46}
          lightingIntensity={0.08}
          aria-hidden="true"
          data-rotation={-16.7}
        />
        <StickerPeel
          className="about-sticker about-decor about-sticker--flowers"
          imageSrc="/assets/about-flowers.svg"
          width="100%"
          peelBackHoverPct={20}
          peelBackActivePct={36}
          peelDirection={-8}
          shadowIntensity={0.36}
          lightingIntensity={0.08}
          aria-hidden="true"
          data-rotation={14.73}
        />
      </div>
    </section>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [language, setLanguage] = useState('EN');
  const [navOpen, setNavOpen] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return undefined;
    }

    const updateActiveSection = () => {
      const sections = Array.from(page.querySelectorAll('section[id]'));
      const activeOffset = page.scrollTop + page.clientHeight * 0.34;
      const currentSection = sections.reduce((current, section) => {
        if (section.offsetTop <= activeOffset) {
          return section;
        }

        return current;
      }, sections[0]);

      if (currentSection?.id) {
        setActiveSection(currentSection.id);
      }
    };

    updateActiveSection();
    page.addEventListener('scroll', updateActiveSection, { passive: true });

    return () => page.removeEventListener('scroll', updateActiveSection);
  }, []);

  const handleNavClick = (event, href) => {
    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    setNavOpen(false);
    target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <button type="button" className="menu-trigger" onClick={() => setNavOpen((prev) => !prev)}>
        {navOpen ? 'CLOSE' : 'MENU'}
      </button>
      <nav className="site-nav" aria-label="Primary">
        <div className="site-nav-left" />

        <div className="site-lang-switch" aria-label="Language switch">
          <button
            type="button"
            className={`site-lang-btn${language === 'EN' ? ' is-active' : ''}`}
            onClick={() => setLanguage('EN')}
          >
            EN
          </button>
          <span className="site-lang-divider" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className={`site-lang-btn${language === 'ZH' ? ' is-active' : ''}`}
            onClick={() => setLanguage('ZH')}
          >
            中文
          </button>
        </div>
      </nav>

      <>
        <div
          className={`menu-overlay${navOpen ? ' is-open' : ''}`}
          onClick={() => setNavOpen(false)}
          aria-hidden={navOpen ? 'false' : 'true'}
        />
        <div className={`menu-layer-stack${navOpen ? ' is-open' : ''}`} aria-hidden="true">
          <div className="menu-layer menu-layer--1" />
          <div className="menu-layer menu-layer--2" />
        </div>
        <aside className={`menu-drawer${navOpen ? ' is-open' : ''}`} aria-label="Navigation menu" aria-hidden={!navOpen}>
          <ul className="menu-list">
            {navItems.map((item, index) => (
              <li key={item.label} className="menu-item-wrap">
                <a href={item.href} className="menu-item" onClick={(event) => handleNavClick(event, item.href)}>
                  <span>{item.label === 'ABOUT ME' ? 'ABOUT' : item.label}</span>
                  <em>{String(index + 1).padStart(2, '0')}</em>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </>
      <main className="site-page" ref={pageRef}>
        <div className="global-shape-grid" aria-hidden="true">
          <ShapeGrid
            speed={0}
            squareSize={44}
            direction="static"
            borderColor="rgba(255, 255, 255, 0.36)"
            hoverFillColor="rgba(123, 42, 221, 0.42)"
            shape="square"
            hoverTrailAmount={5}
          />
        </div>
        <HeroSection />
        <AboutSection scrollContainerRef={pageRef} />
        <ProjectSection scrollContainerRef={pageRef} />
        <ContactSection />
      </main>
    </>
  );
}
