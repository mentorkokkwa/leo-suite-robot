export type ViewportSize = {
  width: number;
  height: number;
};

/**
 * Largest axis-aligned box with a fixed aspect ratio that fits inside the container.
 * Same math as CSS object-fit: contain / SVG preserveAspectRatio meet.
 */
export function computeContainedSize(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number
): ViewportSize {
  if (containerWidth <= 0 || containerHeight <= 0 || aspectRatio <= 0) {
    return { width: 0, height: 0 };
  }

  const containerAspect = containerWidth / containerHeight;

  if (containerAspect > aspectRatio) {
    const height = containerHeight;
    return { width: Math.floor(height * aspectRatio), height };
  }

  const width = containerWidth;
  return { width, height: Math.floor(width / aspectRatio) };
}

/**
 * Aspect ratio of the navigable floor-plan area (width / height).
 */
export function mapAspectRatio(mapWidth: number, mapHeight: number, inset: number): number {
  const innerW = mapWidth - inset * 2;
  const innerH = mapHeight - inset * 2;
  return innerW / innerH;
}
