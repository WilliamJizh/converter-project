export interface DetectedUnit {
  value: number
  unit: string
  unitType: string
  category: string
  fullMatch: string
  startIndex: number
  endIndex: number
}

// Unit patterns and their categories
export const unitPatterns = {
  length: {
    mm: /millimeters?|mm/i,
    cm: /centimeters?|cm/i,
    m: /meters?|m(?!i|p|g|l|s)/i,
    km: /kilometers?|km/i,
    in: /inches?|in/i,
    ft: /feet|foot|ft/i,
    yd: /yards?|yd/i,
    mi: /miles?|mi/i,
  },
  weight: {
    mg: /milligrams?|mg/i,
    g: /grams?|g(?!a|b)/i,
    kg: /kilograms?|kg/i,
    oz: /ounces?|oz/i,
    lb: /pounds?|lbs?/i,
    ton: /tons?|ton/i,
  },
  temperature: {
    celsius: /°C|celsius|centigrade/i,
    fahrenheit: /°F|fahrenheit/i,
    kelvin: /K(?!B|b)|kelvin/i,
  },
  volume: {
    ml: /milliliters?|ml/i,
    l: /liters?|l(?!b)/i,
    gal: /gallons?|gal/i,
    cup: /cups?|cup/i,
    pint: /pints?|pt/i,
    quart: /quarts?|qt/i,
  },
  area: {
    m2: /m²|square meters?|sq m/i,
    km2: /km²|square kilometers?|sq km/i,
    ft2: /ft²|square feet|sq ft/i,
    acre: /acres?/i,
    hectare: /hectares?|ha/i,
  },
  speed: {
    ms: /m\/s|meters? per second/i,
    kmh: /km\/h|kmh|kilometers? per hour/i,
    mph: /mph|miles? per hour/i,
    knots: /knots?|kt/i,
  },
  data: {
    bit: /bits?|b(?!yte)/i,
    byte: /bytes?|B(?!T)/i,
    kb: /kilobytes?|KB/i,
    mb: /megabytes?|MB/i,
    gb: /gigabytes?|GB/i,
    tb: /terabytes?|TB/i,
  },
  time: {
    second: /seconds?|secs?|s(?!q)/i,
    minute: /minutes?|mins?/i,
    hour: /hours?|hrs?/i,
    day: /days?/i,
    week: /weeks?/i,
    month: /months?/i,
    year: /years?|yrs?/i,
  },
  pressure: {
    pa: /pascals?|Pa/i,
    bar: /bars?|bar/i,
    psi: /psi|pounds? per square inch/i,
    atm: /atmospheres?|atm/i,
    mmhg: /mmHg|millimeters? of mercury/i,
  },
  energy: {
    j: /joules?|J(?!S)/i,
    cal: /calories?|cal/i,
    kcal: /kilocalories?|kcal/i,
    btu: /BTU|british thermal units?/i,
    kwh: /kWh|kilowatt hours?/i,
  },
}

// Main number pattern with support for decimals and scientific notation
const numberPattern = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i

export function detectUnits(text: string): DetectedUnit[] {
  const detectedUnits: DetectedUnit[] = []
  
  
  // Build a combined regex for all units
  let allUnitsPattern = ''
  const unitMapping: { [key: string]: { category: string, unitType: string } } = {}
  
  for (const [category, units] of Object.entries(unitPatterns)) {
    for (const [unitType, pattern] of Object.entries(units)) {
      const patternStr = pattern.source
      if (allUnitsPattern) allUnitsPattern += '|'
      allUnitsPattern += `(${patternStr})`
      
      // Store mapping for later lookup
      unitMapping[patternStr] = { category, unitType }
    }
  }
  
  // Create regex that matches number followed by optional space and unit
  // The \\s* allows for zero or more spaces between number and unit
  const fullPattern = new RegExp(
    `(${numberPattern.source})\\s*(${allUnitsPattern})\\b`,
    'gi'
  )
  
  
  let match
  while ((match = fullPattern.exec(text)) !== null) {
    const fullMatch = match[0]
    const value = parseFloat(match[1])
    const unitMatch = match[2]
    
    // Find which unit was matched
    let matchedCategory = ''
    let matchedUnitType = ''
    let matchedUnit = ''
    
    for (const [category, units] of Object.entries(unitPatterns)) {
      for (const [unitType, pattern] of Object.entries(units)) {
        if (pattern.test(unitMatch)) {
          matchedCategory = category
          matchedUnitType = unitType
          matchedUnit = unitMatch
          break
        }
      }
      if (matchedCategory) break
    }
    
    if (matchedCategory) {
      detectedUnits.push({
        value,
        unit: matchedUnit,
        unitType: matchedUnitType,
        category: matchedCategory,
        fullMatch,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
      })
    }
  }
  
  return detectedUnits
}