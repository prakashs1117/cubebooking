"use client";
import { useState, useRef, useId, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export interface SlideData {
  title: string;
  button?: string;
  src?: string;
  /** Optional custom content rendered inside the slide instead of an image */
  content?: React.ReactNode;
  /** Accent colour for the slide background */
  accent?: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      slideRef.current.style.setProperty("--x", `${xRef.current}px`);
      slideRef.current.style.setProperty("--y", `${yRef.current}px`);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => { xRef.current = 0; yRef.current = 0 };

  const isActive = current === index;
  const { src, content, accent = "var(--brand-purple)" } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[70vmin] mx-[4vmin] z-10"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isActive ? "scale(1) rotateX(0deg)" : "scale(0.97) rotateX(8deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
          cursor: isActive ? "default" : "pointer",
        }}
      >
        {/* Slide background */}
        <div
          className="absolute top-0 left-0 w-full h-full rounded-3xl overflow-hidden transition-all duration-150 ease-out"
          style={{
            background: accent,
            transform: isActive
              ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
              : "none",
          }}
        >
          {/* Background image if provided */}
          {src && (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: isActive ? 0.35 : 0.2 }}
              alt={slide.title}
              src={src}
              loading="eager"
              decoding="sync"
            />
          )}
          {/* Subtle grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          {isActive && <div className="absolute inset-0 bg-black/10 transition-all duration-1000" />}
        </div>

        {/* Slide content */}
        <article
          className={`relative p-[5vmin] flex flex-col gap-4 items-center w-full transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {content ?? (
            <p className="text-white/90 text-sm leading-relaxed max-w-[240px]">
              {slide.button}
            </p>
          )}
        </article>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: "previous" | "next";
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({ type, title, handleClick }: CarouselControlProps) => (
  <button
    className={`w-10 h-10 flex items-center mx-2 justify-center rounded-full border focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
      type === "previous" ? "rotate-180" : ""
    }`}
    style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
    title={title}
    onClick={handleClick}
  >
    <ArrowRight style={{ width: 18, height: 18 }} />
  </button>
);

export interface CarouselProps {
  slides: SlideData[];
}

export function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const id = useId();

  const handlePreviousClick = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const handleNextClick     = () => setCurrent((c) => (c + 1) % slides.length);
  const handleSlideClick    = (index: number) => { if (current !== index) setCurrent(index) };

  return (
    <div
      className="relative w-[70vmin] h-[70vmin] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * (100 / slides.length)}%)` }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      {/* Dot indicators */}
      <div className="absolute flex justify-center gap-1.5 w-full" style={{ top: "calc(100% + 0.5rem)" }}>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 9999,
              background: i === current ? "var(--primary)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              transition: "width 0.3s, background 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Prev / Next controls */}
      <div className="absolute flex justify-center w-full" style={{ top: "calc(100% + 2.5rem)" }}>
        <CarouselControl type="previous" title="Previous step" handleClick={handlePreviousClick} />
        <CarouselControl type="next"     title="Next step"     handleClick={handleNextClick} />
      </div>
    </div>
  );
}
