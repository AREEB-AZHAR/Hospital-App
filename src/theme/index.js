// src/theme/index.js
// Cohesive medical & healthcare design system tokens

export const colors = {
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

export const shadows = {
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
  glow: (color = colors.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  }),
};

export default {
  colors,
  typography,
  spacing,
  radii,
  shadows,
};
