import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "../lib/utils";

const DefaultCursorSVG = ({ size = 24, className }: { size?: number; color?: string; className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]", className)}
    >
      <path
        d="M3 3L10.5 21L14 14L21 10.5L3 3Z"
        fill="#0f172a"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M5.5 5.8L10.2 17.5L12.7 12.7L17.5 10.2L5.5 5.8Z"
        fill="url(#sleekCursorGrad)"
      />
      <defs>
        <linearGradient id="sleekCursorGrad" x1="5.5" y1="5.8" x2="17.5" y2="17.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export interface SmoothCursorProps {
  cursor?: React.ReactNode;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
    restDelta?: number;
  };
  className?: string;
  size?: number;
  color?: string;
  hideOnLeave?: boolean;
  trailLength?: number;
  showTrail?: boolean;
  rotateOnMove?: boolean;
  scaleOnClick?: boolean;
  glowEffect?: boolean;
  magneticDistance?: number;
  magneticElements?: string;
  onCursorMove?: (pos: { x: number; y: number }) => void;
  onCursorEnter?: () => void;
  onCursorLeave?: () => void;
  disabled?: boolean;
}

export function SmoothCursor({
  cursor,
  springConfig = {
    damping: 32,
    stiffness: 380,
    mass: 0.6,
    restDelta: 0.001,
  },
  className,
  size = 24,
  color = "currentColor",
  hideOnLeave = true,
  trailLength = 4,
  showTrail = false,
  rotateOnMove = false,
  scaleOnClick = true,
  glowEffect = true,
  magneticDistance = 50,
  magneticElements = "a, button, [role='button'], input, textarea, select, .cursor-pointer, [data-magnetic]",
  onCursorMove,
  onCursorEnter,
  onCursorLeave,
  disabled = false,
}: SmoothCursorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 50,
    stiffness: 250,
  });
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 450,
    damping: 30,
  });

  const defaultCursor = <DefaultCursorSVG size={size} color={color} />;
  const cursorElement = cursor || defaultCursor;

  useEffect(() => {
    if (disabled) return;

    // Only activate custom cursor on fine pointer devices (desktops)
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasPointer) return;

    const updateVelocity = (currentPos: { x: number; y: number }) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;
      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }
      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    const updateTrail = (pos: { x: number; y: number }) => {
      if (!showTrail || isHoveringInteractive) return;
      setTrail((prev) => [pos, ...prev.slice(0, trailLength - 1)]);
    };

    const findMagneticElement = (x: number, y: number) => {
      const elements = document.querySelectorAll(magneticElements);
      for (const element of Array.from(elements)) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distance < magneticDistance) {
          return { x: centerX, y: centerY, distance };
        }
      }
      return null;
    };

    const smoothMouseMove = (e: MouseEvent) => {
      let currentPos = { x: e.clientX, y: e.clientY };

      // Detect if hovering over clickable/pointer element
      const target = e.target as HTMLElement | null;
      const interactiveTarget = target?.closest(magneticElements);
      const isInteractive = Boolean(interactiveTarget);

      setIsHoveringInteractive(isInteractive);
      if (isInteractive) {
        scale.set(1.15);
      } else {
        scale.set(1);
      }

      const magneticTarget = findMagneticElement(currentPos.x, currentPos.y);

      if (magneticTarget) {
        const strength = 1 - magneticTarget.distance / magneticDistance;
        currentPos = {
          x: currentPos.x + (magneticTarget.x - currentPos.x) * strength * 0.35,
          y: currentPos.y + (magneticTarget.y - currentPos.y) * strength * 0.35,
        };
      }

      updateVelocity(currentPos);
      updateTrail(currentPos);

      const speed = Math.sqrt(Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2));
      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);
      onCursorMove?.(currentPos);

      if (speed > 0.1 && rotateOnMove) {
        const currentAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;
      }
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      document.body.style.cursor = "none";
      onCursorEnter?.();
    };

    const handleMouseLeave = () => {
      if (hideOnLeave) {
        setIsVisible(false);
      }
      document.body.style.cursor = "auto";
      onCursorLeave?.();
    };

    const handleMouseDown = () => {
      if (scaleOnClick) {
        scale.set(0.8);
      }
    };

    const handleMouseUp = () => {
      if (scaleOnClick) {
        scale.set(isHoveringInteractive ? 1.15 : 1);
      }
    };

    let rafId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e);
        rafId = 0;
      });
    };

    document.body.style.cursor = "none";
    window.addEventListener("mousemove", throttledMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "auto";
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    cursorX,
    cursorY,
    rotation,
    scale,
    disabled,
    showTrail,
    trailLength,
    rotateOnMove,
    scaleOnClick,
    hideOnLeave,
    magneticDistance,
    magneticElements,
    onCursorMove,
    onCursorEnter,
    onCursorLeave,
    isHoveringInteractive,
  ]);

  if (disabled || !isVisible) return null;

  return (
    <>
      {showTrail &&
        trail.map((pos, index) => (
          <motion.div
            key={index}
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              translateX: "-50%",
              translateY: "-50%",
              zIndex: 2147483646 - index,
              pointerEvents: "none",
              opacity: ((trailLength - index) / trailLength) * 0.4,
              scale: ((trailLength - index) / trailLength) * 0.7,
            }}
            className="w-2.5 h-2.5 bg-primary rounded-full pointer-events-none"
          />
        ))}

      <motion.div
        style={{
          position: "fixed",
          left: cursorX,
          top: cursorY,
          translateX: "-3px",
          translateY: "-3px",
          rotate: rotateOnMove ? rotation : 0,
          scale: scale,
          zIndex: 2147483647,
          pointerEvents: "none",
          willChange: "transform",
          filter: glowEffect ? "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))" : "none",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className={cn("select-none text-primary pointer-events-none hidden md:block", className)}
      >
        {cursorElement}
      </motion.div>
    </>
  );
}

export default SmoothCursor;
