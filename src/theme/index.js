// src/theme/index.js
// Cohesive medical & healthcare design system tokens

export const lightColors = {
  // Brand & Accents
  primary: "#0D6EFD", // Clinical Royal Blue
  primaryDark: "#0B5ED7",
  primaryLight: "#EBF3FF",
  primaryHover: "#0056B3",

  secondary: "#00B4D8", // Crisp Cyan / Teal
  secondaryLight: "#E0F7FA",

  accent: "#10B981", // Mint / Success Green
  accentLight: "#ECFDF5",

  danger: "#EF4444", // Medical Coral / Alert
  dangerLight: "#FEF2F2",

  warning: "#F59E0B", // Amber Warning
  warningLight: "#FFFBEB",

  info: "#3B82F6",
  infoLight: "#EFF6FF",

  // Neutrals & Surfaces
  white: "#FFFFFF",
  background: "#F8FAFC", // Off-white clean slate
  surface: "#FFFFFF",
  surfaceSubtle: "#F1F5F9",
  surfaceBorder: "#E2E8F0",
  surfaceGlass: "rgba(255, 255, 255, 0.92)",
  surfaceGlassDark: "rgba(15, 23, 42, 0.75)",

  // Typography
  textPrimary: "#0F172A", // Deep slate
  textSecondary: "#475569", // Medium slate
  textMuted: "#64748B", // Subtle slate
  textLight: "#94A3B8",
  textInverse: "#FFFFFF",

  // Overlays
  overlayDark: "rgba(15, 23, 42, 0.45)",
  overlayLight: "rgba(255, 255, 255, 0.65)",
};

export const darkColors = {
  // Brand & Accents
  primary: "#3B82F6", // Vibrant electric royal blue
  primaryDark: "#2563EB",
  primaryLight: "rgba(59, 130, 246, 0.18)",
  primaryHover: "#60A5FA",

  secondary: "#38BDF8", // Vibrant Cyan
  secondaryLight: "rgba(56, 189, 248, 0.16)",

  accent: "#10B981", // Mint Green
  accentLight: "rgba(16, 185, 129, 0.16)",

  danger: "#F87171", // Coral Red
  dangerLight: "rgba(239, 68, 68, 0.18)",

  warning: "#FBBF24", // Warm Amber
  warningLight: "rgba(245, 158, 11, 0.18)",

  info: "#60A5FA",
  infoLight: "rgba(96, 165, 250, 0.16)",

  // Neutrals & Surfaces (Deep obsidian & midnight navy)
  white: "#FFFFFF",
  background: "#0B0F19", // Deep obsidian dark background
  surface: "#131B2E", // Elevated midnight navy card surface
  surfaceSubtle: "#1E293B", // Subtle slate container
  surfaceBorder: "#1E293B", // Border for dark cards
  surfaceGlass: "rgba(19, 27, 46, 0.88)",
  surfaceGlassDark: "rgba(11, 15, 25, 0.92)",

  // Typography
  textPrimary: "#F8FAFC", // Bright crisp white
  textSecondary: "#CBD5E1", // Soft slate text
  textMuted: "#94A3B8", // Muted slate text
  textLight: "#64748B",
  textInverse: "#0F172A",

  // Overlays
  overlayDark: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(255, 255, 255, 0.1)",
};

// Default export for backward compatibility
export const colors = lightColors;

export const typography = {
  h1: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5, color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3, color: colors.textPrimary },
  h3: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  body: { fontSize: 14, fontWeight: "400", color: colors.textPrimary, lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: "500", color: colors.textMuted },
  captionBold: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  tiny: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const lightShadows = {
  none: {},
  subtle: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: "#0D6EFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: "#0D6EFD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  glow: (color = lightColors.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  }),
};

export const darkShadows = {
  none: {},
  subtle: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  glow: (color = darkColors.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// Default export for backward compatibility
export const shadows = lightShadows;

export default {
  colors,
  lightColors,
  darkColors,
  typography,
  spacing,
  radii,
  shadows,
  lightShadows,
  darkShadows,
};
