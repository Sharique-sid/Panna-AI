"use client";

import { ReactNode } from 'react';
import { useStaggeredAnimation } from '@/hooks/use-scroll-animation';

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn';
  duration?: number;
  threshold?: number;
}

export function StaggeredGrid({
  children,
  className = '',
  staggerDelay = 100,
  animation = 'fadeIn',
  duration = 600,
  threshold = 0.1
}: StaggeredGridProps) {
  const { ref, visibleItems } = useStaggeredAnimation(
    children.length,
    staggerDelay,
    { threshold }
  );

  const getAnimationClasses = (index: number) => {
    const baseClasses = 'transition-all ease-out';
    const isVisible = visibleItems[index];
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeIn':
          return `${baseClasses} opacity-0`;
        case 'slideUp':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'slideLeft':
          return `${baseClasses} opacity-0 translate-x-8`;
        case 'slideRight':
          return `${baseClasses} opacity-0 -translate-x-8`;
        case 'scaleIn':
          return `${baseClasses} opacity-0 scale-95`;
        default:
          return `${baseClasses} opacity-0`;
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={getAnimationClasses(index)}
          style={{
            transitionDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
