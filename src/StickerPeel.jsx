import React, { useEffect, useId, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import './StickerPeel.css';

gsap.registerPlugin(Draggable);

export default function StickerPeel({
  imageSrc,
  rotate = 0,
  peelBackHoverPct = 22,
  peelBackActivePct = 38,
  peelEasing = 'power3.out',
  peelHoverEasing = 'power2.out',
  width = '100%',
  shadowIntensity = 0.45,
  lightingIntensity = 0.08,
  peelDirection = 0,
  className = '',
  alt = '',
  draggable = true,
  ...rest
}) {
  const filterId = useId().replace(/:/g, '');
  const containerRef = useRef(null);
  const dragTargetRef = useRef(null);
  const pointLightRef = useRef(null);
  const pointLightFlippedRef = useRef(null);
  const draggableInstanceRef = useRef(null);
  const defaultPadding = 10;

  useEffect(() => {
    const target = dragTargetRef.current;
    const boundsEl = target?.parentNode;

    if (!target || !boundsEl || !draggable) {
      return undefined;
    }

    draggableInstanceRef.current = Draggable.create(target, {
      type: 'x,y',
      bounds: boundsEl,
      inertia: true,
      onDrag() {
        const nextRotation = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);
        gsap.to(target, { rotation: nextRotation, duration: 0.15, ease: 'power1.out' });
      },
      onDragEnd() {
        gsap.to(target, {
          rotation: Number(target.dataset.rotation || 0),
          duration: 0.8,
          ease: 'power2.out',
        });
      },
    })[0];

    const handleResize = () => draggableInstanceRef.current?.update();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      draggableInstanceRef.current?.kill();
    };
  }, [draggable]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateLight = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      gsap.set(pointLightRef.current, { attr: { x, y } });

      if (Math.abs(peelDirection % 360) !== 180) {
        gsap.set(pointLightFlippedRef.current, { attr: { x, y: rect.height - y } });
      } else {
        gsap.set(pointLightFlippedRef.current, { attr: { x: -1000, y: -1000 } });
      }
    };

    const handleTouchStart = () => container.classList.add('touch-active');
    const handleTouchEnd = () => container.classList.remove('touch-active');

    container.addEventListener('mousemove', updateLight);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('mousemove', updateLight);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [peelDirection]);

  const cssVars = useMemo(
    () => ({
      '--sticker-rotate': `${rotate}deg`,
      '--sticker-p': `${defaultPadding}px`,
      '--sticker-peelback-hover': `${peelBackHoverPct}%`,
      '--sticker-peelback-active': `${peelBackActivePct}%`,
      '--sticker-peel-easing': peelEasing,
      '--sticker-peel-hover-easing': peelHoverEasing,
      '--sticker-width': typeof width === 'number' ? `${width}px` : width,
      '--sticker-shadow-opacity': shadowIntensity,
      '--sticker-lighting-constant': lightingIntensity,
      '--peel-direction': `${peelDirection}deg`,
    }),
    [
      rotate,
      peelBackHoverPct,
      peelBackActivePct,
      peelEasing,
      peelHoverEasing,
      width,
      shadowIntensity,
      lightingIntensity,
      peelDirection,
    ],
  );

  return (
    <div className={`draggable-sticker ${className}`} ref={dragTargetRef} style={cssVars} {...rest}>
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={`${filterId}-pointLight`}>
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feSpecularLighting
              result="spec"
              in="blur"
              specularExponent="100"
              specularConstant={lightingIntensity}
              lightingColor="white"
            >
              <fePointLight ref={pointLightRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={`${filterId}-pointLightFlipped`}>
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feSpecularLighting
              result="spec"
              in="blur"
              specularExponent="100"
              specularConstant={lightingIntensity * 7}
              lightingColor="white"
            >
              <fePointLight ref={pointLightFlippedRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={`${filterId}-dropShadow`}>
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation={3 * shadowIntensity}
              floodColor="black"
              floodOpacity={shadowIntensity}
            />
          </filter>

          <filter id={`${filterId}-expandAndFill`}>
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
            <feFlood floodColor="rgb(179,179,179)" result="flood" />
            <feComposite operator="in" in="flood" in2="shape" />
          </filter>
        </defs>
      </svg>

      <div
        className="sticker-container"
        ref={containerRef}
        style={{
          '--point-light-filter': `url(#${filterId}-pointLight)`,
          '--point-light-flipped-filter': `url(#${filterId}-pointLightFlipped)`,
          '--drop-shadow-filter': `url(#${filterId}-dropShadow)`,
          '--expand-fill-filter': `url(#${filterId}-expandAndFill)`,
        }}
      >
        <div className="sticker-main">
          <div className="sticker-lighting">
            <img src={imageSrc} alt={alt} className="sticker-image" draggable="false" onContextMenu={(event) => event.preventDefault()} />
          </div>
        </div>

        <div className="flap">
          <div className="flap-lighting">
            <img src={imageSrc} alt="" className="flap-image" draggable="false" onContextMenu={(event) => event.preventDefault()} />
          </div>
        </div>
      </div>
    </div>
  );
}
