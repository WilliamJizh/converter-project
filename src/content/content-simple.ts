import { detectUnits } from '../lib/unit-patterns-simple'

let container: HTMLDivElement | null = null
let currentSelection: string | null = null
let currentRange: Range | null = null
let scrollRAF: number | null = null
let currentWindowId: string | null = null

// Create container for hover window
function createContainer() {
  if (container) return container
  
  container = document.createElement('div')
  container.id = 'unit-converter-extension-root'
  container.style.cssText = `
    z-index: 999999;
    pointer-events: none;
  `
  document.body.appendChild(container)
  
  return container
}

// Priority rankings for most commonly used units per category
const PRIORITY_UNITS: { [category: string]: { [unit: string]: number } } = {
  length: {
    'meters': 1, 'feet': 2, 'inches': 3, 'centimeters': 4,
    'kilometers': 5, 'miles': 6, 'millimeters': 7, 'yards': 8,
  },
  weight: {
    'kilograms': 1, 'pounds': 2, 'grams': 3,
    'ounces': 4, 'milligrams': 5, 'tons': 6,
  },
  temperature: {
    '°F': 1, '°C': 1, 'K': 3,
  },
  volume: {
    'liters': 1, 'gallons': 2, 'milliliters': 3,
    'cups': 4, 'pints': 5, 'quarts': 6,
  },
  speed: {
    'km/h': 1, 'mph': 2, 'm/s': 3, 'knots': 4,
  },
  data: {
    'MB': 1, 'GB': 2, 'KB': 3, 'bytes': 4, 'TB': 5, 'bits': 6,
  },
  time: {
    'minutes': 1, 'hours': 2, 'days': 3,
    'seconds': 4, 'weeks': 5, 'months': 6, 'years': 7,
  },
  area: {
    'm²': 1, 'ft²': 2, 'km²': 3, 'acres': 4, 'hectares': 5,
  },
  pressure: {
    'PSI': 1, 'bar': 2, 'Pa': 3, 'atm': 4, 'mmHg': 5,
  },
  energy: {
    'joules': 1, 'calories': 2, 'kilocalories': 3, 'kWh': 4, 'BTU': 5,
  },
}

function showHoverWindow(data: any) {
  createContainer()
  
  if (container && data) {
    // Sort conversions by priority
    const sortedConversions = [...data.conversions].sort((a, b) => {
      const priorityMap = PRIORITY_UNITS[data.category] || {}
      const priorityA = priorityMap[a.unit] || 999
      const priorityB = priorityMap[b.unit] || 999
      return priorityA - priorityB
    })

    // Get top 3 most important conversions
    const topConversions = sortedConversions.slice(0, 3)
    const remainingConversions = sortedConversions.slice(3)
    
    // Generate a unique ID for this window
    const windowId = 'converter-' + Date.now()
    currentWindowId = windowId
    
    // Create the hover window HTML with compact design
    const html = `
      <div id="${windowId}" class="converter-hover-window" style="
        position: fixed;
        left: ${data.position.x}px;
        top: ${data.position.y}px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        min-width: 200px;
        max-width: 400px;
        width: fit-content;
        overflow: hidden;
        pointer-events: auto;
        transition: opacity 0.2s ease, left 0.15s ease-out, top 0.15s ease-out;
      ">
        <div style="
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; font-size: 12px; color: #6b7280;">
              ${data.originalValue} ${data.originalUnit}
            </span>
            <span style="
              background: #f3f4f6;
              color: #374151;
              padding: 1px 6px;
              border-radius: 4px;
              font-size: 11px;
              line-height: 16px;
            ">${data.category}</span>
          </div>
          <button onclick="document.getElementById('${windowId}').remove()" style="
            background: none;
            border: none;
            cursor: pointer;
            padding: 2px;
            color: #6b7280;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          ">✕</button>
        </div>
        <div style="padding: 8px;">
          <!-- Top 3 priority conversions -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px;">
            ${topConversions.map((conv: any) => `
              <button 
                data-value="${conv.value} ${conv.unit}"
                onclick="
                  navigator.clipboard.writeText(this.dataset.value);
                  this.style.background = '#dcfce7';
                  this.style.border = '1px solid #22c55e';
                  this.style.minWidth = this.offsetWidth + 'px';
                  this.innerHTML = '&lt;svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;#22c55e&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;&gt;&lt;path d=&quot;M22 11.08V12a10 10 0 1 1-5.93-9.14&quot;&gt;&lt;/path&gt;&lt;polyline points=&quot;22 4 12 14.01 9 11.01&quot;&gt;&lt;/polyline&gt;&lt;/svg&gt;';
                  setTimeout(() => document.getElementById('${windowId}').remove(), 400);
                " 
                style="
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  padding: 4px 8px;
                  cursor: pointer;
                  font-size: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  transition: all 0.15s;
                  min-height: 24px;
                "
                onmouseover="this.style.background='#f9fafb'"
                onmouseout="this.style.background='white'"
              >
                <span style="font-weight: 600;">${conv.value}</span>
                <span style="color: #6b7280;">${conv.unit}</span>
              </button>
            `).join('')}
          </div>
          
          ${remainingConversions.length > 0 ? `
            <div style="border-top: 1px solid #f3f4f6; margin: 6px 0;"></div>
            
            <!-- Toggle button -->
            <button 
              id="${windowId}-toggle"
              onclick="
                const expanded = document.getElementById('${windowId}-expanded');
                const toggle = document.getElementById('${windowId}-toggle');
                if (expanded.style.display === 'none') {
                  expanded.style.display = 'block';
                  toggle.innerHTML = '▲ Show less';
                  document.getElementById('${windowId}').style.maxHeight = '400px';
                } else {
                  expanded.style.display = 'none';
                  toggle.innerHTML = '▼ ${remainingConversions.length} more conversion${remainingConversions.length !== 1 ? 's' : ''}';
                  document.getElementById('${windowId}').style.maxHeight = 'none';
                }
              "
              style="
                width: 100%;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                font-size: 11px;
                color: #6b7280;
                text-align: center;
                transition: color 0.15s;
              "
              onmouseover="this.style.color='#374151'"
              onmouseout="this.style.color='#6b7280'"
            >
              ▼ ${remainingConversions.length} more conversion${remainingConversions.length !== 1 ? 's' : ''}
            </button>
            
            <!-- Expanded conversions list -->
            <div id="${windowId}-expanded" style="display: none; max-height: 200px; overflow-y: auto; margin-top: 6px;">
              ${remainingConversions.map((conv: any, index: number) => `
                <button 
                  data-value="${conv.value} ${conv.unit}"
                  onclick="
                    navigator.clipboard.writeText(this.dataset.value);
                    this.style.background = '#dcfce7';
                    this.style.justifyContent = 'center';
                    this.innerHTML = '&lt;svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;#22c55e&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;&gt;&lt;path d=&quot;M22 11.08V12a10 10 0 1 1-5.93-9.14&quot;&gt;&lt;/path&gt;&lt;polyline points=&quot;22 4 12 14.01 9 11.01&quot;&gt;&lt;/polyline&gt;&lt;/svg&gt;';
                    setTimeout(() => document.getElementById('${windowId}').remove(), 400);
                  "
                  style="
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 8px;
                    background: white;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                    text-align: left;
                    transition: all 0.15s;
                    min-height: 28px;
                    ${index > 0 ? 'border-top: 1px solid #f3f4f6;' : ''}
                  "
                  onmouseover="this.style.background='#f9fafb'"
                  onmouseout="this.style.background='white'"
                >
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-weight: 500;">${conv.value}</span>
                    <span style="color: #6b7280;">${conv.unit}</span>
                  </div>
                  <span style="color: #6b7280; font-size: 11px;">Copy</span>
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `
    
    container.innerHTML = html
    container.style.pointerEvents = 'auto'
  }
}

function hideHoverWindow() {
  if (container) {
    container.innerHTML = ''
    container.style.pointerEvents = 'none'
  }
  currentSelection = null
  currentRange = null
  currentWindowId = null
  
  // Clean up scroll tracking
  stopScrollTracking()
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
      const rect = range.getBoundingClientRect()
      
      currentSelection = text
      currentRange = range.cloneRange() // Clone and store the range
      
      // Use the first detected unit
      const unit = units[0]
      
      // Send to background for conversion
      try {
        chrome.runtime.sendMessage({
          type: 'CONVERT_UNITS',
          value: unit.value,
          unitType: unit.unitType,
          category: unit.category,
          text
        }, (response) => {
          // Check if extension context is still valid
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError)
            return
          }
          
          if (response?.conversions) {
            showHoverWindow({
              originalValue: unit.value,
              originalUnit: unit.unit,
              conversions: response.conversions,
              category: unit.category,
              position: {
                x: Math.min(rect.left, window.innerWidth - 400),
                y: rect.bottom + 5
              }
            })
            
            // Start tracking scroll to update position
            startScrollTracking()
          } else if (response?.error) {
            console.error('Conversion error:', response.error)
          }
        })
      } catch (error) {
        // Extension was reloaded, content script is orphaned
        console.error('Extension error:', error)
      }
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

// Function to update hover window position based on current range
function updateHoverPosition() {
  if (!currentRange || !currentWindowId) return
  
  try {
    // Get the current position of the range
    const rect = currentRange.getBoundingClientRect()
    const hoverWindow = document.getElementById(currentWindowId)
    
    if (!hoverWindow) {
      hideHoverWindow()
      return
    }
    
    // Calculate new position (use max width for safety)
    const newX = Math.min(rect.left, window.innerWidth - 400)
    const newY = rect.bottom + 5
    
    // Check if selection is still visible in viewport
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0
    
    if (isVisible) {
      // Update position with smooth transition
      hoverWindow.style.left = `${newX}px`
      hoverWindow.style.top = `${newY}px`
      hoverWindow.style.opacity = '1'
      hoverWindow.style.pointerEvents = 'auto'
    } else {
      // Hide when scrolled out of view but keep it in DOM
      hoverWindow.style.opacity = '0'
      hoverWindow.style.pointerEvents = 'none'
      
      // Auto-close after 2 seconds if still out of view
      setTimeout(() => {
        if (hoverWindow && hoverWindow.style.opacity === '0') {
          hideHoverWindow()
        }
      }, 2000)
    }
  } catch (error) {
    // Range might be invalid (e.g., if DOM changed)
    console.error('Failed to update hover position:', error)
    hideHoverWindow()
  }
}

// Scroll event handler
let scrollHandler: (() => void) | null = null

// Start tracking scroll events
function startScrollTracking() {
  // Clean up any existing scroll handler
  stopScrollTracking()
  
  scrollHandler = () => {
    // Cancel any pending animation frame
    if (scrollRAF) {
      cancelAnimationFrame(scrollRAF)
    }
    
    // Schedule position update on next animation frame for smooth performance
    scrollRAF = requestAnimationFrame(() => {
      updateHoverPosition()
    })
  }
  
  // Add scroll listeners
  window.addEventListener('scroll', scrollHandler, { passive: true })
  document.addEventListener('scroll', scrollHandler, { passive: true })
}

// Stop tracking scroll events
function stopScrollTracking() {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    document.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
  
  if (scrollRAF) {
    cancelAnimationFrame(scrollRAF)
    scrollRAF = null
  }
}

// Check if extension context is valid
function isExtensionValid() {
  try {
    return chrome.runtime && chrome.runtime.id
  } catch {
    return false
  }
}

// Listen for messages from popup/background
if (isExtensionValid()) {
  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type === 'HIDE_HOVER') {
      hideHoverWindow()
    }
    return true
  })
  
} else {
  // Extension context invalid - page needs refresh
}

export {}