import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { Select } from './components/ui/select'
import { Copy, RefreshCw, Type, Binary, Palette, Clock, Ruler } from 'lucide-react'
import { convertUnit, getAllCategories } from './lib/conversion-engine'
import { unitDisplayNames, getUnitsForCategory } from './lib/unit-display'

function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [unitCategory, setUnitCategory] = useState('length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  // Text case conversion
  const convertTextCase = (type: string) => {
    switch (type) {
      case 'upper':
        setOutput(input.toUpperCase())
        break
      case 'lower':
        setOutput(input.toLowerCase())
        break
      case 'title':
        setOutput(input.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()))
        break
      case 'camel':
        setOutput(input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, ''))
        break
      case 'snake':
        setOutput(input.toLowerCase().replace(/\s+/g, '_'))
        break
      case 'kebab':
        setOutput(input.toLowerCase().replace(/\s+/g, '-'))
        break
    }
  }

  // Base64 conversion
  const encodeBase64 = () => {
    try {
      setOutput(btoa(input))
    } catch (e) {
      setOutput('Error: Invalid input for Base64 encoding')
    }
  }

  const decodeBase64 = () => {
    try {
      setOutput(atob(input))
    } catch (e) {
      setOutput('Error: Invalid Base64 input')
    }
  }

  // Color conversion
  const convertColor = (from: string, to: string) => {
    try {
      if (from === 'hex' && to === 'rgb') {
        const hex = input.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        setOutput(`rgb(${r}, ${g}, ${b})`)
      } else if (from === 'rgb' && to === 'hex') {
        const match = input.match(/\d+/g)
        if (match && match.length >= 3) {
          const r = parseInt(match[0]).toString(16).padStart(2, '0')
          const g = parseInt(match[1]).toString(16).padStart(2, '0')
          const b = parseInt(match[2]).toString(16).padStart(2, '0')
          setOutput(`#${r}${g}${b}`)
        }
      }
    } catch (e) {
      setOutput('Error: Invalid color format')
    }
  }

  // Unix timestamp conversion
  const convertTimestamp = (type: string) => {
    try {
      if (type === 'toDate') {
        const timestamp = parseInt(input)
        const date = new Date(timestamp * 1000)
        setOutput(date.toLocaleString())
      } else if (type === 'fromDate') {
        const date = new Date(input)
        setOutput(Math.floor(date.getTime() / 1000).toString())
      } else if (type === 'current') {
        setOutput(Math.floor(Date.now() / 1000).toString())
      }
    } catch (e) {
      setOutput('Error: Invalid timestamp or date format')
    }
  }

  // Unit conversion
  const convertUnits = () => {
    try {
      const value = parseFloat(input)
      if (isNaN(value)) {
        setOutput('Error: Please enter a valid number')
        return
      }
      const result = convertUnit(value, fromUnit, toUnit, unitCategory)
      setOutput(result.toFixed(4))
    } catch (e: any) {
      setOutput(`Error: ${e.message}`)
    }
  }

  return (
    <div className="w-[400px] h-[600px] p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Converter</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="text" className="flex items-center gap-1 text-xs">
            <Type className="w-3 h-3" />
            <span className="hidden sm:inline">Text</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-1 text-xs">
            <Ruler className="w-3 h-3" />
            <span className="hidden sm:inline">Units</span>
          </TabsTrigger>
          <TabsTrigger value="base64" className="flex items-center gap-1 text-xs">
            <Binary className="w-3 h-3" />
            <span className="hidden sm:inline">B64</span>
          </TabsTrigger>
          <TabsTrigger value="color" className="flex items-center gap-1 text-xs">
            <Palette className="w-3 h-3" />
            <span className="hidden sm:inline">Color</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Time</span>
          </TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your text here..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        <TabsContent value="text" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={() => convertTextCase('upper')} size="sm">UPPER</Button>
            <Button onClick={() => convertTextCase('lower')} size="sm">lower</Button>
            <Button onClick={() => convertTextCase('title')} size="sm">Title</Button>
            <Button onClick={() => convertTextCase('camel')} size="sm">camelCase</Button>
            <Button onClick={() => convertTextCase('snake')} size="sm">snake_case</Button>
            <Button onClick={() => convertTextCase('kebab')} size="sm">kebab-case</Button>
          </div>
        </TabsContent>

        <TabsContent value="base64" className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={encodeBase64}>Encode</Button>
            <Button onClick={decodeBase64}>Decode</Button>
          </div>
        </TabsContent>

        <TabsContent value="color" className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => convertColor('hex', 'rgb')} size="sm">HEX → RGB</Button>
            <Button onClick={() => convertColor('rgb', 'hex')} size="sm">RGB → HEX</Button>
          </div>
        </TabsContent>

        <TabsContent value="units" className="mt-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
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
                className="w-full mt-1"
              >
                {getAllCategories().map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">From</label>
                <Select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full mt-1"
                >
                  {getUnitsForCategory(unitCategory).map(unit => (
                    <option key={unit} value={unit}>
                      {unitDisplayNames[unitCategory]?.[unit] || unit}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">To</label>
                <Select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full mt-1"
                >
                  {getUnitsForCategory(unitCategory).map(unit => (
                    <option key={unit} value={unit}>
                      {unitDisplayNames[unitCategory]?.[unit] || unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button onClick={convertUnits} className="w-full" size="sm">
              Convert
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => convertTimestamp('toDate')} size="sm">Unix → Date</Button>
            <Button onClick={() => convertTimestamp('fromDate')} size="sm">Date → Unix</Button>
            <Button onClick={() => convertTimestamp('current')} className="col-span-2" size="sm">
              Current Timestamp
            </Button>
          </div>
        </TabsContent>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="Converted text will appear here..."
              className="min-h-[100px] bg-gray-50"
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={handleCopy} size="sm" className="flex-1">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button onClick={handleClear} size="sm" variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

export default App