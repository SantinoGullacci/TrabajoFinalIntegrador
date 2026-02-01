import { useRef, useState, useLayoutEffect } from 'react';

interface TextAnimationProps {
  text: string;
}

const TextAnimation = ({ text }: TextAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;

    if (container && textEl) {
      const hasOverflow = textEl.scrollWidth > container.clientWidth;
      setIsOverflowing(hasOverflow);
    }
  }, [text]); // Se recalcula si el texto cambia

  return (
    <div className="btn-text-container" ref={containerRef}>
      <span
        ref={textRef}
        className={`btn-text-content ${isOverflowing ? 'is-overflowing' : ''}`}
      >
        {text}
      </span>
    </div>
  );
};

export default TextAnimation;
