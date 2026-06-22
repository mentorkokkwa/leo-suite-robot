"use client";

import { useEffect, useState } from "react";
import {
  computeContainedSize,
  type ViewportSize,
} from "@/lib/campusbot/mapViewport";

const EMPTY: ViewportSize = { width: 0, height: 0 };

/**
 * Tracks the largest map frame size that fits the stage without cropping.
 */
export function useMapViewportSize(
  stageRef: React.RefObject<HTMLElement | null>,
  aspectRatio: number
): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(EMPTY);

  useEffect(() => {
    const node = stageRef.current;
    if (!node || aspectRatio <= 0) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize(computeContainedSize(rect.width, rect.height, aspectRatio));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [stageRef, aspectRatio]);

  return size;
}
