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


export interface ComponentVariant {
  backgroundColor: string;
  color: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: number;
  padding?: string;
  margin?: string;
  boxShadow?: string;
  transition?: string;
  hover?: Partial<ComponentVariant>;
  focus?: Partial<ComponentVariant>;
  active?: Partial<ComponentVariant>;
  disabled?: Partial<ComponentVariant>;
}

export interface ComponentSize {
  fontSize: string;
  padding: string;
  height?: string;
  minHeight?: string;
  borderRadius?: string;
  iconSize?: string;
}

export interface ComponentState {
  default: ComponentVariant;
  hover: Partial<ComponentVariant>;
  focus: Partial<ComponentVariant>;
  active: Partial<ComponentVariant>;
  disabled: Partial<ComponentVariant>;
  loading?: Partial<ComponentVariant>;
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
  tertiary: ComponentVariant;
  ghost: ComponentVariant;
  link: ComponentVariant;
  destructive: ComponentVariant;
}

export interface ButtonSizes {
  xs: ComponentSize;
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
  xl: ComponentSize;
}

export interface ButtonStates {
  default: ComponentState;
  loading: ComponentState;
  disabled: ComponentState;
}

export interface InputTheme {
  variants: InputVariants;
  sizes: InputSizes;
  states: InputStates;
}

export interface InputVariants {
  default: ComponentVariant;
  filled: ComponentVariant;
  outlined: ComponentVariant;
  underlined: ComponentVariant;
  ghost: ComponentVariant;
}

export interface InputSizes {
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
}

export interface InputStates {
  default: ComponentState;
  error: ComponentState;
  success: ComponentState;
  warning: ComponentState;
  disabled: ComponentState;
}

export interface CardTheme {
  variants: CardVariants;
  sizes: CardSizes;
  elevation: CardElevation;
}

export interface CardVariants {
  default: ComponentVariant;
  outlined: ComponentVariant;
  filled: ComponentVariant;
  elevated: ComponentVariant;
}

export interface CardSizes {
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
}

export interface CardElevation {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ModalTheme {
  overlay: ComponentVariant;
  content: ComponentVariant;
  header: ComponentVariant;
  body: ComponentVariant;
  footer: ComponentVariant;
  closeButton: ComponentVariant;
  sizes: ModalSizes;
}

export interface ModalSizes {
  xs: ComponentSize;
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
  xl: ComponentSize;
  full: ComponentSize;
}

export interface TooltipTheme {
  variants: TooltipVariants;
  sizes: TooltipSizes;
  placement: TooltipPlacement;
}

export interface TooltipVariants {
  default: ComponentVariant;
  dark: ComponentVariant;
  light: ComponentVariant;
  error: ComponentVariant;
  warning: ComponentVariant;
  success: ComponentVariant;
  info: ComponentVariant;
}

export interface TooltipSizes {
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
}

export interface TooltipPlacement {
  arrow: {
    size: string;
    offset: string;
  };
  offset: string;
  maxWidth: string;
}

export interface DropdownTheme {
  trigger: ComponentVariant;
  content: ComponentVariant;
  item: ComponentVariant;
  separator: ComponentVariant;
  sizes: DropdownSizes;
}

export interface DropdownSizes {
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
}

export interface NavigationTheme {
  navbar: ComponentVariant;
  sidebar: ComponentVariant;
  menuItem: ComponentVariant;
  submenu: ComponentVariant;
  breadcrumb: ComponentVariant;
  pagination: ComponentVariant;
}

export interface TableTheme {
  container: ComponentVariant;
  header: ComponentVariant;
  row: ComponentVariant;
  cell: ComponentVariant;
  footer: ComponentVariant;
  sizes: TableSizes;
  striped: boolean;
  hoverable: boolean;
}

export interface TableSizes {
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
}

export interface FormTheme {
  fieldset: ComponentVariant;
  legend: ComponentVariant;
  label: ComponentVariant;
  helpText: ComponentVariant;
  errorText: ComponentVariant;
  requiredIndicator: ComponentVariant;
}

export interface ChartTheme {
  colors: ChartColors;
  grid: ChartGrid;
  axis: ChartAxis;
  legend: ChartLegend;
  tooltip: ChartTooltip;
}

export interface ChartColors {
  primary: string[];
  secondary: string[];
  categorical: string[];
  sequential: string[];
  diverging: string[];
}

export interface ChartGrid {
  color: string;
  strokeWidth: number;
  strokeDasharray?: string;
}

export interface ChartAxis {
  color: string;
  fontSize: string;
  fontWeight: number;
  tickColor: string;
  tickSize: number;
}

export interface ChartLegend {
  fontSize: string;
  fontWeight: number;
  color: string;
  spacing: string;
  symbolSize: number;
}

export interface ChartTooltip {
  backgroundColor: string;
  color: string;
  fontSize: string;
  padding: string;
  borderRadius: string;
  boxShadow: string;
  maxWidth: string;
}


export type ThemeVariant = 'light' | 'dark';

export type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

export interface ThemeCustomization {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  breakpoints?: Partial<ThemeBreakpoints>;
  shadows?: Partial<ThemeShadows>;
  animations?: Partial<ThemeAnimations>;
  components?: Partial<ComponentThemes>;
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  customizeTheme: (customization: ThemeCustomization) => void;
  resetTheme: () => void;
}


export interface StyleObject {
  [key: string]: string | number | StyleObject | undefined;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Partial<ThemeConfig>;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export interface UseThemeReturn {
  theme: ThemeConfig;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
  isLight: boolean;
  isAuto: boolean;
}

export interface UseResponsiveReturn<T> {
  value: T;
  breakpoint: keyof ThemeBreakpoints;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}


export type ColorToken = keyof ThemeColors | `${keyof ThemeColors}.${keyof ColorPalette}`;
export type SpacingToken = keyof ThemeSpacing;
export type FontSizeToken = keyof FontSize;
export type FontWeightToken = keyof FontWeight;
export type ShadowToken = keyof ThemeShadows;
export type BreakpointToken = keyof ThemeBreakpoints;
export type AnimationToken = keyof AnimationDuration | keyof AnimationEasing | keyof AnimationKeyframes;


export interface ThemedComponentProps {
  variant?: string;
  size?: string;
  colorScheme?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}


export interface DefaultTheme extends ThemeConfig {}
