import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
  useTheme,
} from "next-themes";

export { useTheme };

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
