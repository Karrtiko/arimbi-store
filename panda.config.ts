import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,

  // Look for Svelte files
  include: ["./src/**/*.{js,ts,svelte}"],
  exclude: [],

  // Modern design system for snack & skincare catalog
  theme: {
    extend: {
      tokens: {
        colors: {
          // Primary gradient (purple to pink for skincare)
          primary: {
            50: { value: "#faf5ff" },
            100: { value: "#f3e8ff" },
            200: { value: "#e9d5ff" },
            300: { value: "#d8b4fe" },
            400: { value: "#c084fc" },
            500: { value: "#a855f7" },
            600: { value: "#9333ea" },
            700: { value: "#7e22ce" },
            800: { value: "#6b21a8" },
            900: { value: "#581c87" },
          },
          // Accent (warm orange for snacks)
          accent: {
            50: { value: "#fff7ed" },
            100: { value: "#ffedd5" },
            200: { value: "#fed7aa" },
            300: { value: "#fdba74" },
            400: { value: "#fb923c" },
            500: { value: "#f97316" },
            600: { value: "#ea580c" },
            700: { value: "#c2410c" },
            800: { value: "#9a3412" },
            900: { value: "#7c2d12" },
          },
          // Neutrals
          gray: {
            50: { value: "#fafafa" },
            100: { value: "#f4f4f5" },
            200: { value: "#e4e4e7" },
            300: { value: "#d4d4d8" },
            400: { value: "#a1a1aa" },
            500: { value: "#71717a" },
            600: { value: "#52525b" },
            700: { value: "#3f3f46" },
            800: { value: "#27272a" },
            900: { value: "#18181b" },
          },
        },
        fonts: {
          heading: { value: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" },
          body: { value: "'Inter', system-ui, sans-serif" },
        },
        fontSizes: {
          xs: { value: "0.75rem" },
          sm: { value: "0.875rem" },
          md: { value: "1rem" },
          lg: { value: "1.125rem" },
          xl: { value: "1.25rem" },
          "2xl": { value: "1.5rem" },
          "3xl": { value: "1.875rem" },
          "4xl": { value: "2.25rem" },
          "5xl": { value: "3rem" },
        },
        spacing: {
          xs: { value: "0.5rem" },
          sm: { value: "0.75rem" },
          md: { value: "1rem" },
          lg: { value: "1.5rem" },
          xl: { value: "2rem" },
          "2xl": { value: "3rem" },
          "3xl": { value: "4rem" },
        },
        radii: {
          sm: { value: "0.375rem" },
          md: { value: "0.5rem" },
          lg: { value: "0.75rem" },
          xl: { value: "1rem" },
          full: { value: "9999px" },
        },
        shadows: {
          sm: { value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
          md: { value: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
          lg: { value: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
          xl: { value: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
        },
      },
    },
  },

  // Global styles
  globalCss: {
    "html, body": {
      margin: 0,
      padding: 0,
      fontFamily: "body",
      color: "gray.900",
      backgroundColor: "gray.50",
    },
    "*": {
      boxSizing: "border-box",
    },
  },

  outdir: "styled-system",
});
