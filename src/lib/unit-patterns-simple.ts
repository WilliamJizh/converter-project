export interface DetectedUnit {
  value: number
  unit: string
  unitType: string
  category: string
  fullMatch: string
  startIndex: number
  endIndex: number
}

// Simplified unit detection - test each pattern individually
export function detectUnits(text: string): DetectedUnit[] {
  const detectedUnits: DetectedUnit[] = []
  
  // Comprehensive patterns for common units
  const patterns = [
    // Length - ordered by specificity (longer patterns first)
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(millimeters?|mm)/gi, category: 'length', unitType: 'mm' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(centimeters?|cm)/gi, category: 'length', unitType: 'cm' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(kilometers?|km)/gi, category: 'length', unitType: 'km' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(meters?|m)\b(?![²³\/])/gi, category: 'length', unitType: 'm' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(inches?|inch|in)\b/gi, category: 'length', unitType: 'in' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(feet|foot|ft)\b/gi, category: 'length', unitType: 'ft' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(yards?|yd)\b/gi, category: 'length', unitType: 'yd' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(miles?|mi)\b/gi, category: 'length', unitType: 'mi' },
    
    // Weight
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(milligrams?|mg)\b/gi, category: 'weight', unitType: 'mg' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(kilograms?|kg)\b/gi, category: 'weight', unitType: 'kg' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(grams?|g)\b(?![a-z])/gi, category: 'weight', unitType: 'g' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(ounces?|oz)\b/gi, category: 'weight', unitType: 'oz' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(pounds?|lbs?|lb)\b/gi, category: 'weight', unitType: 'lb' },
    { regex: /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(tons?|ton)\b/gi, category: 'weight', unitType: 'ton' },
    
    // Temperature
    { regex: /(-?\d+(?:\.\d+)?)\s*°\s*C/gi, category: 'temperature', unitType: 'celsius' },
    { regex: /(-?\d+(?:\.\d+)?)\s*°\s*F/gi, category: 'temperature', unitType: 'fahrenheit' },
    { regex: /(-?\d+(?:\.\d+)?)\s*K\b(?![B])/gi, category: 'temperature', unitType: 'kelvin' },
    
    // Volume
    { regex: /(-?\d+(?:\.\d+)?)\s*(milliliters?|millilitres?|ml|mL)\b/gi, category: 'volume', unitType: 'ml' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(liters?|litres?|[lL])\b(?![a-z])/gi, category: 'volume', unitType: 'l' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(gallons?|gal)\b/gi, category: 'volume', unitType: 'gal' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(cups?|cup)\b/gi, category: 'volume', unitType: 'cup' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(pints?|pint|pt)\b/gi, category: 'volume', unitType: 'pint' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(quarts?|quart|qt)\b/gi, category: 'volume', unitType: 'quart' },
    
    // Area
    { regex: /(-?\d+(?:\.\d+)?)\s*(m²|m2|square\s+meters?|sq\s+m)\b/gi, category: 'area', unitType: 'm2' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(km²|km2|square\s+kilometers?|sq\s+km)\b/gi, category: 'area', unitType: 'km2' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(ft²|ft2|square\s+feet|sq\s+ft)\b/gi, category: 'area', unitType: 'ft2' },
    
    // Speed
    { regex: /(-?\d+(?:\.\d+)?)\s*m\/s\b/gi, category: 'speed', unitType: 'ms' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(km\/h|kmh|kph|kilometers?\s+per\s+hour)\b/gi, category: 'speed', unitType: 'kmh' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(mph|miles?\s+per\s+hour)\b/gi, category: 'speed', unitType: 'mph' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(knots?|kt)\b/gi, category: 'speed', unitType: 'knots' },
    
    // Time
    { regex: /(-?\d+(?:\.\d+)?)\s*(seconds?|secs?|s)\b(?![a-z])/gi, category: 'time', unitType: 'second' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(minutes?|mins?)\b/gi, category: 'time', unitType: 'minute' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(hours?|hrs?)\b/gi, category: 'time', unitType: 'hour' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(days?)\b/gi, category: 'time', unitType: 'day' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(weeks?)\b/gi, category: 'time', unitType: 'week' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(months?)\b/gi, category: 'time', unitType: 'month' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(years?|yrs?)\b/gi, category: 'time', unitType: 'year' },
    
    // Data
    { regex: /(-?\d+(?:\.\d+)?)\s*(bits?|b)\b(?!yte)/gi, category: 'data', unitType: 'bit' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(bytes?|B)\b(?![a-z])/gi, category: 'data', unitType: 'byte' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(kilobytes?|KB)\b/gi, category: 'data', unitType: 'kb' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(megabytes?|MB)\b/gi, category: 'data', unitType: 'mb' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(gigabytes?|GB)\b/gi, category: 'data', unitType: 'gb' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(terabytes?|TB)\b/gi, category: 'data', unitType: 'tb' },
    
    // Energy
    { regex: /(-?\d+(?:\.\d+)?)\s*(joules?|J)\b(?![a-z])/gi, category: 'energy', unitType: 'j' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(calories?|cal)\b/gi, category: 'energy', unitType: 'cal' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(kilocalories?|kcal)\b/gi, category: 'energy', unitType: 'kcal' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(BTU|british\s+thermal\s+units?)\b/gi, category: 'energy', unitType: 'btu' },
    { regex: /(-?\d+(?:\.\d+)?)\s*(kWh|kilowatt\s+hours?)\b/gi, category: 'energy', unitType: 'kwh' },
  ]
  
  // Test each pattern
  for (const pattern of patterns) {
    let match
    pattern.regex.lastIndex = 0 // Reset regex
    
    while ((match = pattern.regex.exec(text)) !== null) {
      const fullMatch = match[0]
      const value = parseFloat(match[1])
      const unitText = match[2]
      
      detectedUnits.push({
        value,
        unit: unitText,
        unitType: pattern.unitType,
        category: pattern.category,
        fullMatch,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
      })
    }
  }
  
  // Sort by position and remove duplicates
  detectedUnits.sort((a, b) => a.startIndex - b.startIndex)
  
  // Remove overlapping matches (keep first)
  const filtered: DetectedUnit[] = []
  let lastEnd = -1
  
  for (const unit of detectedUnits) {
    if (unit.startIndex >= lastEnd) {
      filtered.push(unit)
      lastEnd = unit.endIndex
    }
  }
  
  return filtered
}