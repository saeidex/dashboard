# Color Themes

This takumitex application now supports multiple color themes! Users can customize the appearance of the application by choosing from various color schemes.

## Available Color Themes

1. **Purple** (Default) - The original vibrant purple theme
2. **Blue** - A calm and professional blue theme
3. **Green** - A fresh and natural green theme
4. **Orange** - A warm and energetic orange theme
5. **Red** - A bold and passionate red theme
6. **Zinc** - A neutral and minimalist gray theme

## How to Use

### For Users

1. Click the **Settings** icon (⚙️) in the top-right corner of the application
2. In the "Theme Settings" drawer, scroll to the **Color** section
3. Select your preferred color theme from the available options
4. The theme will be applied instantly and saved to your browser

### Features

- **Persistent Selection**: Your color theme choice is saved in a cookie and will be remembered across sessions
- **Works with Light/Dark Mode**: All color themes work seamlessly with both light and dark modes
- **Reset Option**: You can reset all settings (including color theme) to default values using the "Reset" button

## Technical Implementation

### File Structure

- **`color-theme-provider.tsx`** - React context provider for managing color theme state
- **`color-themes.css`** - CSS variables and definitions for all color themes
- **`icon-color-theme.tsx`** - Custom icon components for theme previews
- **`config-drawer.tsx`** - Updated UI component with color theme selector

### How It Works

1. The `ColorThemeProvider` manages the current color theme state
2. When a theme is selected, a class (e.g., `theme-blue`) is added to the `<html>` element
3. CSS variables are overridden based on the active theme class
4. The theme preference is stored in a cookie named `vite-ui-color-theme`

### Adding New Themes

To add a new color theme:

1. **Add the theme type** in `color-theme-provider.tsx`:
   ```typescript
   export type ColorTheme = "purple" | "blue" | "green" | "orange" | "red" | "zinc" | "your-new-theme";
   ```

2. **Define CSS variables** in `color-themes.css`:
   ```css
   .theme-your-new-theme {
     --primary: oklch(...);
     --accent: oklch(...);
     /* ... other variables */
   }
   
   .theme-your-new-theme.dark {
     /* Dark mode overrides */
   }
   ```

3. **Create an icon** in `icon-color-theme.tsx`:
   ```typescript
   export function IconColorYourNewTheme(props: SVGProps<SVGSVGElement>) {
     return <IconColorTheme color="oklch(...)" {...props} />;
   }
   ```

4. **Add to the selector** in `config-drawer.tsx` within the `ColorThemeConfig` component

## Browser Support

The color themes use the OKLCH color space for better color consistency across light and dark modes. This is supported in all modern browsers. For older browsers, the colors will gracefully degrade.

## Notes

- The color theme is independent of the light/dark mode setting
- Each theme has been carefully designed to work well in both light and dark environments
- The themes affect primary colors, accents, charts, and sidebar elements
