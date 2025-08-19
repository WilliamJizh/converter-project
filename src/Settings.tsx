import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { ChevronUp, ChevronDown, Save, RotateCcw } from 'lucide-react'
import { getAllCategories, getUnitsForCategory } from './lib/conversion-engine'
import { unitDisplayNames } from './lib/unit-display'
import { useAutoAnimate } from '@formkit/auto-animate/react'

interface FavoriteUnits {
  [category: string]: string[]
}

// Category card with animated list
function CategoryCard({ 
  category, 
  units, 
  moveUp, 
  moveDown 
}: {
  category: string
  units: string[]
  moveUp: (index: number) => void
  moveDown: (index: number) => void
}) {
  const [parent] = useAutoAnimate()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={parent} className="space-y-2">
          {units.map((unit, index) => (
            <div
              key={unit}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border transition-all hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                  #{index + 1}
                </span>
                <span className="font-medium">
                  {unitDisplayNames[category]?.[unit] || unit}
                </span>
                <span className="text-sm text-gray-500">({unit})</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveDown(index)}
                  disabled={index === units.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function Settings() {
  const [favorites, setFavorites] = useState<FavoriteUnits>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Load saved favorites
  useEffect(() => {
    chrome.storage.sync.get('favoriteUnits', (data) => {
      if (data.favoriteUnits) {
        setFavorites(data.favoriteUnits)
      } else {
        // Initialize with default priorities
        const defaults: FavoriteUnits = {}
        getAllCategories().forEach(category => {
          defaults[category] = getUnitsForCategory(category)
        })
        setFavorites(defaults)
      }
    })
  }, [])

  // Save favorites
  const handleSave = () => {
    chrome.storage.sync.set({ favoriteUnits: favorites }, () => {
      setHasChanges(false)
      // Show success message
      const button = document.getElementById('save-button')
      if (button) {
        button.textContent = 'Saved!'
        setTimeout(() => {
          button.textContent = 'Save Changes'
        }, 2000)
      }
    })
  }

  // Reset to defaults
  const handleReset = () => {
    const defaults: FavoriteUnits = {}
    getAllCategories().forEach(category => {
      defaults[category] = getUnitsForCategory(category)
    })
    setFavorites(defaults)
    setHasChanges(true)
  }

  // Move unit up in priority
  const moveUp = (category: string, index: number) => {
    if (index === 0) return
    const newUnits = [...(favorites[category] || [])]
    ;[newUnits[index - 1], newUnits[index]] = [newUnits[index], newUnits[index - 1]]
    setFavorites({ ...favorites, [category]: newUnits })
    setHasChanges(true)
  }

  // Move unit down in priority
  const moveDown = (category: string, index: number) => {
    const units = favorites[category] || []
    if (index === units.length - 1) return
    const newUnits = [...units]
    ;[newUnits[index], newUnits[index + 1]] = [newUnits[index + 1], newUnits[index]]
    setFavorites({ ...favorites, [category]: newUnits })
    setHasChanges(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Unit Converter Settings</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button
                id="save-button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-6">
        <p className="text-gray-600 mb-6">
          Customize the priority order of units for each category. Units at the top will appear first in conversions.
        </p>

        <div className="grid gap-4">
          {getAllCategories().map(category => (
            <CategoryCard
              key={category}
              category={category}
              units={favorites[category] || getUnitsForCategory(category)}
              moveUp={(index) => moveUp(category, index)}
              moveDown={(index) => moveDown(category, index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Settings