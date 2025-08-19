export interface ConversionResult {
  value: string
  unit: string
  category: string
}

// Base units for each category (all conversions go through base)
const baseUnits = {
  length: 'm', // meter
  weight: 'kg', // kilogram
  temperature: 'celsius', // celsius
  volume: 'l', // liter
  area: 'm2', // square meter
  speed: 'ms', // meters per second
  data: 'byte', // byte
  time: 'second', // second
  pressure: 'pa', // pascal
  energy: 'j', // joule
}

// Conversion factors to base units
const toBase: { [category: string]: { [unit: string]: (val: number) => number } } = {
  length: {
    mm: (val) => val / 1000,
    cm: (val) => val / 100,
    m: (val) => val,
    km: (val) => val * 1000,
    in: (val) => val * 0.0254,
    ft: (val) => val * 0.3048,
    yd: (val) => val * 0.9144,
    mi: (val) => val * 1609.344,
  },
  weight: {
    mg: (val) => val / 1000000,
    g: (val) => val / 1000,
    kg: (val) => val,
    oz: (val) => val * 0.0283495,
    lb: (val) => val * 0.453592,
    ton: (val) => val * 1000,
  },
  temperature: {
    celsius: (val) => val,
    fahrenheit: (val) => (val - 32) * 5/9,
    kelvin: (val) => val - 273.15,
  },
  volume: {
    ml: (val) => val / 1000,
    l: (val) => val,
    gal: (val) => val * 3.78541,
    cup: (val) => val * 0.236588,
    pint: (val) => val * 0.473176,
    quart: (val) => val * 0.946353,
  },
  area: {
    m2: (val) => val,
    km2: (val) => val * 1000000,
    ft2: (val) => val * 0.092903,
    acre: (val) => val * 4046.86,
    hectare: (val) => val * 10000,
  },
  speed: {
    ms: (val) => val,
    kmh: (val) => val / 3.6,
    mph: (val) => val * 0.44704,
    knots: (val) => val * 0.514444,
  },
  data: {
    bit: (val) => val / 8,
    byte: (val) => val,
    kb: (val) => val * 1024,
    mb: (val) => val * 1024 * 1024,
    gb: (val) => val * 1024 * 1024 * 1024,
    tb: (val) => val * 1024 * 1024 * 1024 * 1024,
  },
  time: {
    second: (val) => val,
    minute: (val) => val * 60,
    hour: (val) => val * 3600,
    day: (val) => val * 86400,
    week: (val) => val * 604800,
    month: (val) => val * 2592000, // 30 days
    year: (val) => val * 31536000, // 365 days
  },
  pressure: {
    pa: (val) => val,
    bar: (val) => val * 100000,
    psi: (val) => val * 6894.76,
    atm: (val) => val * 101325,
    mmhg: (val) => val * 133.322,
  },
  energy: {
    j: (val) => val,
    cal: (val) => val * 4.184,
    kcal: (val) => val * 4184,
    btu: (val) => val * 1055.06,
    kwh: (val) => val * 3600000,
  },
}

// Conversion factors from base units
const fromBase: { [category: string]: { [unit: string]: (val: number) => number } } = {
  length: {
    mm: (val) => val * 1000,
    cm: (val) => val * 100,
    m: (val) => val,
    km: (val) => val / 1000,
    in: (val) => val / 0.0254,
    ft: (val) => val / 0.3048,
    yd: (val) => val / 0.9144,
    mi: (val) => val / 1609.344,
  },
  weight: {
    mg: (val) => val * 1000000,
    g: (val) => val * 1000,
    kg: (val) => val,
    oz: (val) => val / 0.0283495,
    lb: (val) => val / 0.453592,
    ton: (val) => val / 1000,
  },
  temperature: {
    celsius: (val) => val,
    fahrenheit: (val) => val * 9/5 + 32,
    kelvin: (val) => val + 273.15,
  },
  volume: {
    ml: (val) => val * 1000,
    l: (val) => val,
    gal: (val) => val / 3.78541,
    cup: (val) => val / 0.236588,
    pint: (val) => val / 0.473176,
    quart: (val) => val / 0.946353,
  },
  area: {
    m2: (val) => val,
    km2: (val) => val / 1000000,
    ft2: (val) => val / 0.092903,
    acre: (val) => val / 4046.86,
    hectare: (val) => val / 10000,
  },
  speed: {
    ms: (val) => val,
    kmh: (val) => val * 3.6,
    mph: (val) => val / 0.44704,
    knots: (val) => val / 0.514444,
  },
  data: {
    bit: (val) => val * 8,
    byte: (val) => val,
    kb: (val) => val / 1024,
    mb: (val) => val / (1024 * 1024),
    gb: (val) => val / (1024 * 1024 * 1024),
    tb: (val) => val / (1024 * 1024 * 1024 * 1024),
  },
  time: {
    second: (val) => val,
    minute: (val) => val / 60,
    hour: (val) => val / 3600,
    day: (val) => val / 86400,
    week: (val) => val / 604800,
    month: (val) => val / 2592000,
    year: (val) => val / 31536000,
  },
  pressure: {
    pa: (val) => val,
    bar: (val) => val / 100000,
    psi: (val) => val / 6894.76,
    atm: (val) => val / 101325,
    mmhg: (val) => val / 133.322,
  },
  energy: {
    j: (val) => val,
    cal: (val) => val / 4.184,
    kcal: (val) => val / 4184,
    btu: (val) => val / 1055.06,
    kwh: (val) => val / 3600000,
  },
}

// Unit display names
const unitNames: { [category: string]: { [unit: string]: string } } = {
  length: {
    mm: 'millimeters',
    cm: 'centimeters',
    m: 'meters',
    km: 'kilometers',
    in: 'inches',
    ft: 'feet',
    yd: 'yards',
    mi: 'miles',
  },
  weight: {
    mg: 'milligrams',
    g: 'grams',
    kg: 'kilograms',
    oz: 'ounces',
    lb: 'pounds',
    ton: 'tons',
  },
  temperature: {
    celsius: '°C',
    fahrenheit: '°F',
    kelvin: 'K',
  },
  volume: {
    ml: 'milliliters',
    l: 'liters',
    gal: 'gallons',
    cup: 'cups',
    pint: 'pints',
    quart: 'quarts',
  },
  area: {
    m2: 'm²',
    km2: 'km²',
    ft2: 'ft²',
    acre: 'acres',
    hectare: 'hectares',
  },
  speed: {
    ms: 'm/s',
    kmh: 'km/h',
    mph: 'mph',
    knots: 'knots',
  },
  data: {
    bit: 'bits',
    byte: 'bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
    tb: 'TB',
  },
  time: {
    second: 'seconds',
    minute: 'minutes',
    hour: 'hours',
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years',
  },
  pressure: {
    pa: 'Pa',
    bar: 'bar',
    psi: 'PSI',
    atm: 'atm',
    mmhg: 'mmHg',
  },
  energy: {
    j: 'joules',
    cal: 'calories',
    kcal: 'kilocalories',
    btu: 'BTU',
    kwh: 'kWh',
  },
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string
): number {
  if (!toBase[category] || !fromBase[category]) {
    throw new Error(`Unknown category: ${category}`)
  }
  
  if (!toBase[category][fromUnit] || !fromBase[category][toUnit]) {
    throw new Error(`Unknown unit in category ${category}: ${fromUnit} or ${toUnit}`)
  }
  
  // Convert to base unit, then to target unit
  const baseValue = toBase[category][fromUnit](value)
  const result = fromBase[category][toUnit](baseValue)
  
  return result
}

export function formatNumber(value: number, decimalPlaces: number = 2): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  // Very small numbers - use scientific notation
  if (absValue > 0 && absValue < 0.01) {
    return value.toExponential(decimalPlaces)
  }
  
  // Smart formatting for large numbers with suffixes
  if (absValue >= 1e12) {
    return sign + (absValue / 1e12).toFixed(decimalPlaces) + 'T'
  }
  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(decimalPlaces) + 'B'
  }
  if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(decimalPlaces) + 'M'
  }
  if (absValue >= 1e4) {
    // For numbers 10,000 and above, use K suffix
    return sign + (absValue / 1e3).toFixed(absValue >= 1e5 ? 0 : 1) + 'K'
  }
  
  // For numbers less than 10,000, show normally but without excessive decimals
  if (absValue >= 100) {
    // No decimals for hundreds and thousands
    return Math.round(value).toLocaleString('en-US')
  }
  
  // For smaller numbers, keep some precision
  const multiplier = Math.pow(10, decimalPlaces)
  const rounded = Math.round(value * multiplier) / multiplier
  
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  })
}

export function getConversionsForUnit(
  value: number,
  unitType: string,
  category: string,
  preferredUnits?: string[]
): ConversionResult[] {
  const results: ConversionResult[] = []
  const units = fromBase[category]
  
  if (!units) {
    return results
  }
  
  // Get units to convert to
  const targetUnits = preferredUnits && preferredUnits.length > 0
    ? preferredUnits.filter(u => units[u])
    : Object.keys(units)
  
  for (const targetUnit of targetUnits) {
    if (targetUnit === unitType) continue // Skip same unit
    
    try {
      const convertedValue = convertUnit(value, unitType, targetUnit, category)
      results.push({
        value: formatNumber(convertedValue),
        unit: unitNames[category][targetUnit] || targetUnit,
        category,
      })
    } catch (error) {
      console.error(`Conversion error: ${error}`)
    }
  }
  
  return results
}

export function getAllCategories(): string[] {
  return Object.keys(baseUnits)
}

export function getUnitsForCategory(category: string): string[] {
  return Object.keys(unitNames[category] || {})
}