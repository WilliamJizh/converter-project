# Converter - Chrome Extension

A versatile unit converter Chrome extension with a clean interface and support for multiple unit categories. Convert between various units instantly with text selection capabilities on any webpage.

## Features

- **Multiple Unit Categories**: Length, Weight, Temperature, Volume, Area, Speed, Data, Time, Pressure, and Energy
- **Quick Conversions**: Simple and intuitive interface for rapid unit conversions
- **Text Selection**: Automatically detect and convert units from selected text on any webpage
- **Clipboard Support**: Copy converted values with one click
- **Clean UI**: Modern, responsive design using React and Tailwind CSS

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Converter.git
cd Converter
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

### Building for Production

```bash
npm run build
```

This will create optimized builds for:
- Popup interface (`index.html`)
- Content script (`content.js`)
- Background service worker (`background.js`)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build all extension components
- `npm run build:popup` - Build only the popup interface
- `npm run build:content` - Build only the content script
- `npm run build:background` - Build only the background script
- `npm run preview` - Preview the built extension

### Project Structure

```
Converter/
├── public/
│   ├── manifest.json       # Extension manifest
│   └── icons/              # Extension icons
├── src/
│   ├── App.tsx             # Main popup component
│   ├── Settings.tsx        # Settings page component
│   ├── background/         # Background service worker
│   ├── content/            # Content script for webpage interaction
│   ├── components/         # Reusable UI components
│   └── lib/                # Utility functions and conversion logic
├── dist/                   # Built extension files (generated)
└── vite.config.ts          # Build configuration
```

## Supported Units

### Length
- Millimeter (mm), Centimeter (cm), Meter (m), Kilometer (km)
- Inch (in), Foot (ft), Yard (yd), Mile (mi)

### Weight
- Milligram (mg), Gram (g), Kilogram (kg)
- Ounce (oz), Pound (lb), Ton

### Temperature
- Celsius, Fahrenheit, Kelvin

### Volume
- Milliliter (ml), Liter (l)
- Gallon (gal), Cup, Pint (pt), Quart (qt), Fluid Ounce (fl oz)

### And more...
Including Area, Speed, Data storage, Time, Pressure, and Energy units.

## Usage

1. **Popup Interface**: Click the extension icon to open the converter
   - Select a category from the dropdown
   - Enter a value in the input field
   - Choose source and target units
   - Click "Convert" or press Enter

2. **Text Selection**: Select any text containing numbers and units on a webpage
   - The extension will automatically detect convertible units
   - A conversion tooltip will appear with suggested conversions

3. **Settings**: Click the gear icon to access settings and preferences

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Chrome Extension Manifest V3** - Latest extension API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

[Your Name]

## Acknowledgments

- Built with modern web technologies
- Inspired by the need for quick and accurate unit conversions