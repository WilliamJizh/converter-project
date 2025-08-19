import { useEffect, useRef, useState } from "react"
import { X, Copy, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { cn } from "@/lib/utils"
import { ConversionResult } from "@/lib/conversion-engine"

interface HoverWindowProps {
  originalValue: number
  originalUnit: string
  conversions: ConversionResult[]
  category: string
  position: { x: number, y: number }
  getPositionFromRange?: () => { x: number, y: number } | undefined
  onClose: () => void
}

// Priority rankings for most commonly used units per category
const PRIORITY_UNITS: { [category: string]: { [unit: string]: number } } = {
  length: {
    'meters': 1,
    'feet': 2,
    'inches': 3,
    'centimeters': 4,
    'kilometers': 5,
    'miles': 6,
    'millimeters': 7,
    'yards': 8,
  },
  weight: {
    'kilograms': 1,
    'pounds': 2,
    'grams': 3,
    'ounces': 4,
    'milligrams': 5,
    'tons': 6,
  },
  temperature: {
    '°F': 1,
    '°C': 1,
    'K': 3,
  },
  volume: {
    'liters': 1,
    'gallons': 2,
    'milliliters': 3,
    'cups': 4,
    'pints': 5,
    'quarts': 6,
  },
  speed: {
    'km/h': 1,
    'mph': 2,
    'm/s': 3,
    'knots': 4,
  },
  data: {
    'MB': 1,
    'GB': 2,
    'KB': 3,
    'bytes': 4,
    'TB': 5,
    'bits': 6,
  },
  time: {
    'minutes': 1,
    'hours': 2,
    'days': 3,
    'seconds': 4,
    'weeks': 5,
    'months': 6,
    'years': 7,
  },
  area: {
    'm²': 1,
    'ft²': 2,
    'km²': 3,
    'acres': 4,
    'hectares': 5,
  },
  pressure: {
    'PSI': 1,
    'bar': 2,
    'Pa': 3,
    'atm': 4,
    'mmHg': 5,
  },
  energy: {
    'joules': 1,
    'calories': 2,
    'kilocalories': 3,
    'kWh': 4,
    'BTU': 5,
  },
}

export default function HoverWindow({ 
  originalValue, 
  originalUnit, 
  conversions, 
  category, 
  position, 
  getPositionFromRange,
  onClose 
}: HoverWindowProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [currentPosition, setCurrentPosition] = useState(position)
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Scroll event listener to update position
  useEffect(() => {
    if (!getPositionFromRange) return

    let rafId: number | null = null
    
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      
      // Schedule position update on next animation frame for smooth performance
      rafId = requestAnimationFrame(() => {
        const newPosition = getPositionFromRange()
        if (newPosition) {
          setCurrentPosition(newPosition)
          // Check if the selection is still visible in viewport
          const isInViewport = newPosition.y > -100 && newPosition.y < window.innerHeight + 100
          setIsVisible(isInViewport)
        } else {
          // Selection might be lost
          onClose()
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('scroll', handleScroll)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [getPositionFromRange, onClose])

  // Sort conversions by priority
  const sortedConversions = [...conversions].sort((a, b) => {
    const priorityMap = PRIORITY_UNITS[category] || {}
    const priorityA = priorityMap[a.unit] || 999
    const priorityB = priorityMap[b.unit] || 999
    return priorityA - priorityB
  })

  // Get top 3 most important conversions
  const topConversions = sortedConversions.slice(0, 3)
  const remainingConversions = sortedConversions.slice(3)

  const handleCopy = (value: string, index: string) => {
    navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    
    // Close window after showing checkmark
    setTimeout(() => {
      onClose()
    }, 400)
  }

  // Smart positioning to keep window in viewport
  const adjustedPosition = (() => {
    const windowWidth = 400 // Use max width for positioning
    const windowHeight = isExpanded ? 400 : 140
    
    // Calculate X position
    const x = Math.max(0, Math.min(currentPosition.x, window.innerWidth - windowWidth))
    
    // Calculate Y position with smart above/below detection
    const spaceBelow = window.innerHeight - currentPosition.y
    const spaceAbove = currentPosition.y - 30
    
    let y: number
    
    if (spaceBelow < windowHeight && spaceAbove > windowHeight) {
      // Not enough space below, but enough above - show above selection
      y = Math.max(0, currentPosition.y - windowHeight - 30)
    } else if (spaceBelow < windowHeight) {
      // Not enough space below and not enough above - position at bottom of viewport
      y = window.innerHeight - windowHeight
    } else {
      // Enough space below - show below selection at natural position
      y = currentPosition.y
    }
    
    return { x, y }
  })()

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "fixed z-[999999] shadow-lg transition-all duration-200",
        "border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90",
        "min-w-[200px] max-w-[400px] w-fit",
        !isVisible && "opacity-0 pointer-events-none"
      )}
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px` 
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {originalValue} {originalUnit}
          </span>
          <Badge variant="secondary" className="text-xs py-0 px-1 h-4">
            {category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-3 py-2">
        {/* Top 3 priority conversions */}
        <div className="flex flex-wrap gap-1 mb-2">
          {topConversions.map((conversion, index) => (
            <Button
              key={`top-${index}`}
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs font-medium transition-all min-w-fit",
                copiedIndex === `top-${index}` && "bg-green-50 border-green-500"
              )}
              onClick={() => handleCopy(`${conversion.value} ${conversion.unit}`, `top-${index}`)}
            >
              {copiedIndex === `top-${index}` ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="font-semibold">{conversion.value}</span>
                  <span className="ml-1 text-muted-foreground">{conversion.unit}</span>
                </>
              )}
            </Button>
          ))}
        </div>

        {/* Additional conversions - collapsible */}
        {remainingConversions.length > 0 && (
          <>
            <Separator className="my-1" />
            
            {/* Toggle button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  {remainingConversions.length} more conversion{remainingConversions.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {/* Expanded conversions list */}
            {isExpanded && (
              <ScrollArea className="h-[200px] mt-2">
                <div className="space-y-1">
                  {remainingConversions.map((conversion, index) => (
                    <Button
                      key={`remaining-${index}`}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full h-7 px-2 justify-between text-xs transition-all",
                        copiedIndex === `remaining-${index}` && "bg-green-50 hover:bg-green-50 justify-center"
                      )}
                      onClick={() => handleCopy(`${conversion.value} ${conversion.unit}`, `remaining-${index}`)}
                    >
                      {copiedIndex === `remaining-${index}` ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <>
                          <div className="flex items-center">
                            <span className="font-medium">{conversion.value}</span>
                            <span className="ml-1 text-muted-foreground">{conversion.unit}</span>
                          </div>
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}