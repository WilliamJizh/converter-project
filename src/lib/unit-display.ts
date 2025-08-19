// Unit display names for UI
export const unitDisplayNames: Record<string, Record<string, string>> = {
  length: {
    mm: 'Millimeters',
    cm: 'Centimeters',
    m: 'Meters',
    km: 'Kilometers',
    in: 'Inches',
    ft: 'Feet',
    yd: 'Yards',
    mi: 'Miles',
  },
  weight: {
    mg: 'Milligrams',
    g: 'Grams',
    kg: 'Kilograms',
    oz: 'Ounces',
    lb: 'Pounds',
    ton: 'Tons',
  },
  temperature: {
    celsius: 'Celsius',
    fahrenheit: 'Fahrenheit',
    kelvin: 'Kelvin',
  },
  volume: {
    ml: 'Milliliters',
    l: 'Liters',
    gal: 'Gallons',
    cup: 'Cups',
    pint: 'Pints',
    quart: 'Quarts',
  },
  area: {
    m2: 'Square Meters',
    km2: 'Square Kilometers',
    ft2: 'Square Feet',
    acre: 'Acres',
    hectare: 'Hectares',
  },
  speed: {
    ms: 'Meters/Second',
    kmh: 'Kilometers/Hour',
    mph: 'Miles/Hour',
    knots: 'Knots',
  },
  data: {
    bit: 'Bits',
    byte: 'Bytes',
    kb: 'Kilobytes',
    mb: 'Megabytes',
    gb: 'Gigabytes',
    tb: 'Terabytes',
  },
  time: {
    second: 'Seconds',
    minute: 'Minutes',
    hour: 'Hours',
    day: 'Days',
    week: 'Weeks',
    month: 'Months',
    year: 'Years',
  },
  pressure: {
    pa: 'Pascals',
    bar: 'Bar',
    psi: 'PSI',
    atm: 'Atmospheres',
    mmhg: 'mmHg',
  },
  energy: {
    j: 'Joules',
    cal: 'Calories',
    kcal: 'Kilocalories',
    btu: 'BTU',
    kwh: 'kWh',
  },
}

export function getUnitsForCategory(category: string): string[] {
  return Object.keys(unitDisplayNames[category] || {})
}