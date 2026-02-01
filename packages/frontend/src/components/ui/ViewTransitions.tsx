'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ViewTransitions - Seamless page transitions using View Transitions API
 *
 * Enables morphing elements between pages without hard browser refreshes
 * Falls back gracefully for browsers without support
 */

interface ViewTransitionsProviderProps {
  children: React.ReactNode;
}

// Check if View Transitions API is supported
function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function ViewTransitionsProvider({ children }: ViewTransitionsProviderProps) {
  return <>{children}</>;
}

/**
 * useViewTransition - Hook for programmatic view transitions
 */
export function useViewTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateWithTransition = useCallback(
    async (href: string, options?: { scroll?: boolean }) => {
      if (!supportsViewTransitions()) {
        router.push(href, options);
        return;
      }

      setIsTransitioning(true);

      try {
        // View Transitions API (document.startViewTransition)
        const transition = (
          document as Document & {
            startViewTransition: (cb: () => Promise<void>) => { finished: Promise<void> };
          }
        ).startViewTransition(() => {
          return new Promise<void>((resolve) => {
            startTransition(() => {
              router.push(href, options);
              // Give router time to update
              setTimeout(resolve, 50);
            });
          });
        });

        await transition.finished;
      } catch (e) {
        // Fallback if transition fails
        router.push(href, options);
      } finally {
        setIsTransitioning(false);
      }
    },
    [router, startTransition],
  );

  return {
    navigateWithTransition,
    isPending: isPending || isTransitioning,
    isTransitioning,
  };
}

/**
 * TransitionLink - Link component with automatic view transitions
 */
interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  /** View transition name for morphing */
  viewTransitionName?: string;
}

export function TransitionLink({
  href,
  children,
  viewTransitionName,
  className,
  onClick,
  ...props
}: TransitionLinkProps) {
  const { navigateWithTransition } = useViewTransition();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onClick?.(e);
      void navigateWithTransition(href);
    },
    [href, navigateWithTransition, onClick],
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      style={
        {
          viewTransitionName: viewTransitionName || undefined,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * MorphingElement - Element that morphs between pages
 *
 * Usage:
 * <MorphingElement name="hero-title">
 *   <h1>Hero Title</h1>
 * </MorphingElement>
 */
interface MorphingElementProps {
  /** Unique name for the element across pages */
  name: string;
  children: React.ReactNode;
  /** Element type to render */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function MorphingElement({
  name,
  children,
  as: Component = 'div',
  className,
}: MorphingElementProps) {
  const Tag = Component as React.ElementType;
  return (
    <Tag
      className={className}
      style={{
        viewTransitionName: name,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * View transition CSS that should be added to global styles
 */
export const viewTransitionStyles = `
/* View Transition Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slide-from-right {
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-to-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100px); opacity: 0; }
}

@keyframes scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scale-down {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(1.05); opacity: 0; }
}

/* Default view transition */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out forwards;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-out forwards;
}

/* Hero transitions - morph smoothly */
::view-transition-old(hero-title),
::view-transition-old(hero-subtitle) {
  animation: none;
}

::view-transition-new(hero-title),
::view-transition-new(hero-subtitle) {
  animation: none;
}

::view-transition-group(hero-title),
::view-transition-group(hero-subtitle) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Content transitions */
::view-transition-old(page-content) {
  animation: slide-to-left 0.3s ease-out forwards;
}

::view-transition-new(page-content) {
  animation: slide-from-right 0.3s ease-out forwards;
}

/* Card transitions */
::view-transition-old(feature-card) {
  animation: scale-down 0.2s ease-out forwards;
}

::view-transition-new(feature-card) {
  animation: scale-up 0.3s ease-out forwards;
}
`;

/**
 * useAnimatedMount - Animate elements when they enter/exit
 */
export function useAnimatedMount(
  options: {
    enterDuration?: number;
    exitDuration?: number;
    enterDelay?: number;
  } = {},
) {
  const { enterDuration = 300, enterDelay = 0 } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, enterDelay);

    return () => clearTimeout(timer);
  }, [enterDelay]);

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity ${enterDuration}ms ease-out, transform ${enterDuration}ms ease-out`,
  };

  return { ref, style, isVisible };
}
