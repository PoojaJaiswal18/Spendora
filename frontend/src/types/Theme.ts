export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  breakpoints: ThemeBreakpoints;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  components: ComponentThemes;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
  background: BackgroundColors;
  text: TextColors;
  border: BorderColors;
  surface: SurfaceColors;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface SemanticColors {
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
}

export interface BackgroundColors {
  default: string;
  paper: string;
  elevated: string;
  overlay: string;
  disabled: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
  inverse: string;
}

export interface BorderColors {
  default: string;
  light: string;
  medium: string;
  strong: string;
  focus: string;
  error: string;
  success: string;
  warning: string;
}

export interface SurfaceColors {
  background: string;
  foreground: string;
  muted: string;
  subtle: string;
  ui: string;
  hover: string;
  pressed: string;
  focus: string;
  selected: string;
  disabled: string;
}

export interface ThemeTypography {
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
  headings: HeadingStyles;
  body: BodyStyles;
  display: DisplayStyles;
}

export interface FontFamily {
  primary: string;
  secondary: string;
  monospace: string;
  system: string;
}

export interface FontSize {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeight {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeight {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface HeadingStyles {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
}

export interface BodyStyles {
  large: TypographyStyle;
  base: TypographyStyle;
  small: TypographyStyle;
  xs: TypographyStyle;
}

export interface DisplayStyles {
  large: TypographyStyle;
  medium: TypographyStyle;
  small: TypographyStyle;
}

export interface TypographyStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  fontFamily?: string;
}

export interface ThemeSpacing {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  outline: string;
}

export interface ThemeAnimations {
  duration: AnimationDuration;
  easing: AnimationEasing;
  keyframes: AnimationKeyframes;
}

export interface AnimationDuration {
  fastest: string;
  faster: string;
  fast: string;
  normal: string;
  slow: string;
  slower: string;
  slowest: string;
}

export interface AnimationEasing {
  linear: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  easeInSine: string;
  easeOutSine: string;
  easeInOutSine: string;
  easeInQuad: string;
  easeOutQuad: string;
  easeInOutQuad: string;
  easeInCubic: string;
  easeOutCubic: string;
  easeInOutCubic: string;
  easeInQuart: string;
  easeOutQuart: string;
  easeInOutQuart: string;
  easeInQuint: string;
  easeOutQuint: string;
  easeInOutQuint: string;
  easeInExpo: string;
  easeOutExpo: string;
  easeInOutExpo: string;
  easeInCirc: string;
  easeOutCirc: string;
  easeInOutCirc: string;
  easeInBack: string;
  easeOutBack: string;
  easeInOutBack: string;
}

export interface AnimationKeyframes {
  fadeIn: string;
  fadeOut: string;
  slideInUp: string;
  slideInDown: string;
  slideInLeft: string;
  slideInRight: string;
  slideOutUp: string;
  slideOutDown: string;
  slideOutLeft: string;
  slideOutRight: string;
  scaleIn: string;
  scaleOut: string;
  rotateIn: string;
  rotateOut: string;
  bounce: string;
  pulse: string;
  shake: string;
  swing: string;
  wobble: string;
  flip: string;
  spin: string;
}

export interface ComponentThemes {
  button: ButtonTheme;
  input: InputTheme;
  card: CardTheme;
  modal: ModalTheme;
  tooltip: TooltipTheme;
  dropdown: DropdownTheme;
  navigation: NavigationTheme;
  table: TableTheme;
  form: FormTheme;
  chart: ChartTheme;
}

export interface ButtonTheme {
  variants: ButtonVariants;
  sizes: ButtonSizes;
  states: ButtonStates;
}

export interface ButtonVariants {
  primary: ComponentVariant;
  secondary: ComponentVariant;
}