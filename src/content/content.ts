import { detectUnits } from '../lib/unit-patterns'
import { createRoot } from 'react-dom/client'
import React from 'react'
import HoverWindow from '../components/HoverWindow'
import '../index.css'

let root: ReturnType<typeof createRoot> | null = null
let container: HTMLDivElement | null = null
let currentSelection: string | null = null
let currentRange: Range | null = null

// Create container for React component
function createContainer() {
  if (container) return container
  
  container = document.createElement('div')
  container.id = 'unit-converter-extension-root'
  container.style.cssText = `
    z-index: 999999;
    pointer-events: none;
  `
  document.body.appendChild(container)
  
  // Create a div for the React root
  const rootElement = document.createElement('div')
  container.appendChild(rootElement)
  root = createRoot(rootElement)
  
  return container
}

function getPositionFromRange(range: Range) {
  const rect = range.getBoundingClientRect()
  return {
    x: Math.min(rect.left, window.innerWidth - 400), // Use max width for safety
    y: rect.bottom + 5
  }
}

function showHoverWindow(data: any) {
  createContainer()
  
  if (root && data) {
    root.render(
      React.createElement(HoverWindow, {
        originalValue: data.originalValue,
        originalUnit: data.originalUnit,
        conversions: data.conversions,
        category: data.category,
        position: data.position,
        getPositionFromRange: currentRange ? () => getPositionFromRange(currentRange!) : undefined,
        onClose: hideHoverWindow
      })
    )
  }
  
  if (container) {
    container.style.pointerEvents = 'auto'
  }
}

function hideHoverWindow() {
  if (root) {
    root.render(null)
  }
  if (container) {
    container.style.pointerEvents = 'none'
  }
  currentSelection = null
  currentRange = null
}

// Debounced selection handler
let selectionTimeout: ReturnType<typeof setTimeout>

function handleSelection() {
  clearTimeout(selectionTimeout)
  
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (!text || text.length > 100 || text === currentSelection) {
      if (!text && currentSelection) {
        hideHoverWindow()
      }
      return
    }
    
    const units = detectUnits(text)
    
    if (units.length > 0) {
      const range = selection!.getRangeAt(0)
      
      currentSelection = text
      currentRange = range.cloneRange() // Store a clone of the range
      
      // Use the first detected unit
      const unit = units[0]
      
      // Send to background for conversion
      chrome.runtime.sendMessage({
        type: 'CONVERT_UNITS',
        value: unit.value,
        unitType: unit.unitType,
        category: unit.category,
        text
      }, (response) => {
        if (response?.conversions) {
          showHoverWindow({
            originalValue: unit.value,
            originalUnit: unit.unit,
            conversions: response.conversions,
            category: unit.category,
            position: getPositionFromRange(currentRange!)
          })
        }
      })
    } else if (currentSelection) {
      hideHoverWindow()
    }
  }, 300)
}

// Event listeners
document.addEventListener('selectionchange', handleSelection)
document.addEventListener('mouseup', handleSelection)

// Clean up on click outside
document.addEventListener('mousedown', (e) => {
  if (container && !container.contains(e.target as Node)) {
    const selection = window.getSelection()
    if (selection?.toString().trim() !== currentSelection) {
      hideHoverWindow()
    }
  }
})

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.type === 'HIDE_HOVER') {
    hideHoverWindow()
  }
  return true
})

export {}