/**
 * Unit conversion and normalization system for cooking measurements
 */

export type StandardUnit = 'g' | 'ml' | 'tsp' | 'tbsp' | 'cup' | 'pcs' | 'l';

export const unitConversions: Record<string, Record<StandardUnit, number>> = {
  // Metric base units
  'g': { 'g': 1, 'ml': 1, 'tsp': 0.2, 'tbsp': 0.067, 'cup': 0.004, 'pcs': 0, 'l': 0.001 },
  'ml': { 'g': 1, 'ml': 1, 'tsp': 0.2, 'tbsp': 0.067, 'cup': 0.004, 'pcs': 0, 'l': 0.001 },
  'l': { 'g': 1000, 'ml': 1000, 'tsp': 200, 'tbsp': 67, 'cup': 4.2, 'pcs': 0, 'l': 1 },

  // Cooking units (US)
  'tsp': { 'g': 5, 'ml': 5, 'tsp': 1, 'tbsp': 0.333, 'cup': 0.021, 'pcs': 0, 'l': 0.005 },
  'tbsp': { 'g': 15, 'ml': 15, 'tsp': 3, 'tbsp': 1, 'cup': 0.0625, 'pcs': 0, 'l': 0.015 },
  'cup': { 'g': 240, 'ml': 240, 'tsp': 48, 'tbsp': 16, 'cup': 1, 'pcs': 0, 'l': 0.24 },

  // Pieces
  'pcs': { 'g': 0, 'ml': 0, 'tsp': 0, 'tbsp': 0, 'cup': 0, 'pcs': 1, 'l': 0 },
};

// Alias mappings to standard units
const unitAliases: Record<string, StandardUnit> = {
  // Gram variants
  'gram': 'g',
  'grams': 'g',
  'gr': 'g',

  // Milliliter variants
  'milliliter': 'ml',
  'milliliters': 'ml',
  'ml': 'ml',

  // Liter variants
  'liter': 'l',
  'liters': 'l',
  'l': 'l',

  // Teaspoon variants
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  'tsp': 'tsp',
  'tsps': 'tsp',
  't': 'tsp',

  // Tablespoon variants
  'tablespoon': 'tbsp',
  'tablespoons': 'tbsp',
  'tbsp': 'tbsp',
  'tbsps': 'tbsp',
  'tbs': 'tbsp',
  't': 'tbsp',

  // Cup variants
  'cup': 'cup',
  'cups': 'cup',
  'c': 'cup',

  // Pieces variants
  'piece': 'pcs',
  'pieces': 'pcs',
  'pcs': 'pcs',
  'pc': 'pcs',
};

/**
 * Normalize a unit string to standard unit
 * @param unit Raw unit string (e.g., "1 cup", "cup", "Cup", "CUPS")
 * @returns Standard unit or undefined if not recognized
 */
export const normalizeUnit = (unit?: string): StandardUnit | undefined => {
  if (!unit) return undefined;
  const normalized = unit.toLowerCase().trim().replace(/s$/, ''); // Remove plural 's'
  return unitAliases[normalized];
};

/**
 * Parse quantity string and return numeric value and unit
 * @param quantityStr Raw quantity string (e.g., "1", "1/2", "1.5 cups")
 * @returns Parsed quantity and unit
 */
export const parseQuantity = (quantityStr?: string): { value: number; unit?: StandardUnit } | null => {
  if (!quantityStr) return null;

  const trimmed = quantityStr.trim();

  // Try to extract quantity and unit
  const match = trimmed.match(/^([0-9/.]+)\s*(.*)$/);
  if (!match) return null;

  const quantityPart = match[1];
  const unitPart = match[2];

  // Parse number (handle fractions like "1/2")
  let value = 0;
  if (quantityPart.includes('/')) {
    const [num, denom] = quantityPart.split('/');
    value = parseFloat(num) / parseFloat(denom);
  } else {
    value = parseFloat(quantityPart);
  }

  if (isNaN(value)) return null;

  const unit = normalizeUnit(unitPart || undefined);
  return { value, unit };
};

/**
 * Convert quantity from one unit to another
 * @param value Original value
 * @param fromUnit Original unit
 * @param toUnit Target unit
 * @returns Converted value or original if conversion not possible
 */
export const convertQuantity = (value: number, fromUnit?: StandardUnit, toUnit?: StandardUnit): number => {
  if (!fromUnit || !toUnit || fromUnit === toUnit) return value;
  if (fromUnit === 'pcs' || toUnit === 'pcs') return value; // Can't convert to/from pieces

  const conversionFactor = (unitConversions[fromUnit]?.[toUnit] ?? 1) / (unitConversions[fromUnit]?.[fromUnit] ?? 1);
  return Math.round(value * conversionFactor * 100) / 100; // Round to 2 decimals
};

/**
 * Suggest a reasonable unit for a given quantity
 * Helps normalize "250ml" -> "~1 cup"
 */
export const suggestUnit = (value: number, unit?: StandardUnit): { value: number; unit: StandardUnit } => {
  if (!unit) return { value, unit: 'g' };
  if (unit === 'pcs') return { value, unit: 'pcs' };

  // Convert everything to grams/ml as base
  const baseValue = unit === 'ml' || unit === 'l' ? value * (unit === 'l' ? 1000 : 1) : value;

  if (baseValue >= 240 && baseValue < 1000) {
    return { value: convertQuantity(baseValue, 'ml', 'cup'), unit: 'cup' };
  }
  if (baseValue >= 15 && baseValue < 240) {
    return { value: convertQuantity(baseValue, 'ml', 'tbsp'), unit: 'tbsp' };
  }
  if (baseValue < 15 && baseValue > 0) {
    return { value: convertQuantity(baseValue, 'ml', 'tsp'), unit: 'tsp' };
  }

  return { value, unit: unit || 'g' };
};
