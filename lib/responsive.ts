import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scales a value based on screen width
 * @param size - The size to scale (from base width 393)
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scales a value based on screen height
 * @param size - The size to scale (from base height 852)
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scales font size based on screen width with min/max bounds
 * @param size - The font size to scale
 * @param factor - Scaling factor (default 0.5 for conservative scaling)
 */
export const scaleFontSize = (size: number, factor: number = 0.5): number => {
  const newSize = size + (scaleWidth(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderately scale - best for paddings, margins
 * @param size - The size to scale
 * @param factor - Scaling factor (default 0.5)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Screen breakpoints
 */
export const breakpoints = {
  small: 360,    // Small phones (iPhone SE, Galaxy S8)
  medium: 390,   // Standard phones (iPhone 12/13/14)
  large: 428,    // Large phones (iPhone Pro Max)
  tablet: 768,   // Tablets
};

/**
 * Check if screen is small
 */
export const isSmallScreen = (): boolean => SCREEN_WIDTH < breakpoints.small;

/**
 * Check if screen is medium
 */
export const isMediumScreen = (): boolean =>
  SCREEN_WIDTH >= breakpoints.small && SCREEN_WIDTH < breakpoints.large;

/**
 * Check if screen is large
 */
export const isLargeScreen = (): boolean =>
  SCREEN_WIDTH >= breakpoints.large && SCREEN_WIDTH < breakpoints.tablet;

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => SCREEN_WIDTH >= breakpoints.tablet;

/**
 * Get responsive value based on screen size
 * @param small - Value for small screens
 * @param medium - Value for medium screens (optional, defaults to small)
 * @param large - Value for large screens (optional, defaults to medium)
 * @param tablet - Value for tablets (optional, defaults to large)
 */
export const getResponsiveValue = <T>(
  small: T,
  medium?: T,
  large?: T,
  tablet?: T
): T => {
  if (isTablet()) return tablet ?? large ?? medium ?? small;
  if (isLargeScreen()) return large ?? medium ?? small;
  if (isMediumScreen()) return medium ?? small;
  return small;
};

/**
 * Get responsive image dimensions
 * @param baseWidth - Base width percentage or fixed value
 * @param baseHeight - Base height
 */
export const getResponsiveImageDimensions = (
  baseWidth: number | string,
  baseHeight: number
): { width: number | string; height: number } => {
  if (typeof baseWidth === 'string' && baseWidth.endsWith('%')) {
    // Percentage-based width
    const percentage = parseFloat(baseWidth);
    return {
      width: baseWidth,
      height: scaleHeight(baseHeight),
    };
  }

  // Fixed width
  return {
    width: scaleWidth(baseWidth as number),
    height: scaleHeight(baseHeight),
  };
};

/**
 * Get responsive grid columns
 * @param maxColumns - Maximum columns for large screens
 */
export const getGridColumns = (maxColumns: number = 3): number => {
  if (isSmallScreen()) return Math.max(2, maxColumns - 1);
  if (isTablet()) return maxColumns + 1;
  return maxColumns;
};

/**
 * Get responsive modal max height
 */
export const getModalMaxHeight = (): string => {
  if (isSmallScreen()) return '85%';
  if (isTablet()) return '60%';
  return '70%';
};

/**
 * Check if layout should stack vertically
 * @param minWidth - Minimum width required for horizontal layout
 */
export const shouldStackVertically = (minWidth: number = 360): boolean => {
  return SCREEN_WIDTH < minWidth;
};

/**
 * Get safe horizontal padding
 */
export const getSafeHorizontalPadding = (): number => {
  return getResponsiveValue(16, 20, 24, 32);
};

/**
 * Get responsive gap/spacing
 * @param baseGap - Base gap size
 */
export const getResponsiveGap = (baseGap: number): number => {
  return moderateScale(baseGap, 0.3);
};

/**
 * Screen dimensions
 */
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallScreen(),
  isMedium: isMediumScreen(),
  isLarge: isLargeScreen(),
  isTablet: isTablet(),
};
