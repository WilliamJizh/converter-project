import { useState } from 'react'
import { Button } from './components/ui/button'
import { Copy, Settings, ArrowRight } from 'lucide-react'
import { convertUnit, getAllCategories, formatNumber } from './lib/conversion-engine'
import { unitDisplayNames, getUnitsForCategory } from './lib/unit-display'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [unitCategory, setUnitCategory] = useState('length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const handleSettings = () => {
    chrome.tabs.create({ url: 'settings.html' })
  }

  // Unit conversion
  const convertUnits = () => {
    try {
      const value = parseFloat(input)
      if (isNaN(value)) {
        setOutput('Enter a valid number')
        return
      }
      const result = convertUnit(value, fromUnit, toUnit, unitCategory)
      setOutput(formatNumber(result))
    } catch (e: any) {
      setOutput(`Error: ${e.message}`)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      convertUnits()
    }
  }

  return (
    <div className="w-[320px] p-3 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base font-semibold">Unit Converter</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Category Selector */}
      <select
        value={unitCategory}
        onChange={(e) => {
          const newCategory = e.target.value
          setUnitCategory(newCategory)
          const units = getUnitsForCategory(newCategory)
          if (units.length > 0) {
            setFromUnit(units[0])
            setToUnit(units[1] || units[0])
          }
        }}
        className="w-full mb-3 h-9 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {getAllCategories().map(cat => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      {/* From Input Row */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Value"
          className="flex-1 h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-24 h-9 px-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getUnitsForCategory(unitCategory).map(unit => (
            <option key={unit} value={unit}>
              {unitDisplayNames[unitCategory]?.[unit] || unit}
            </option>
          ))}
        </select>
      </div>

      {/* Arrow */}
      <div className="flex justify-center mb-3">
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>

      {/* To Output Row */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={output}
          readOnly
          placeholder="Result"
          className="flex-1 h-9 px-3 text-sm border rounded-md bg-gray-50"
        />
        <select
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
          className="w-24 h-9 px-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getUnitsForCategory(unitCategory).map(unit => (
            <option key={unit} value={unit}>
              {unitDisplayNames[unitCategory]?.[unit] || unit}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={convertUnits}
          size="sm"
          className="flex-1 h-9"
        >
          Convert
        </Button>
        <Button
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className="px-3"
          disabled={!output}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default App