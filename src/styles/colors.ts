/**
 * Theme-aware tokens. Their value is a CSS variable (with the light-theme value
 * as fallback) that `ThemeTokenStyles` keeps in sync with the antd theme, so
 * styled-components and inline styles follow dark mode automatically.
 *
 * `antdToken` is the key of antd's `GlobalToken` used to feed the variable;
 * entries with an explicit `dark` value use `light`/`dark` directly instead
 * (antd's *Text tokens get darker in dark mode, so they can't be used for tags).
 */
export const themeTokens = {
  // Status tag text: >= 4.5:1 contrast over the matching *Bg in both themes.
  tagPrimaryText: { light: '#0958d9', dark: '#69b1ff' },
  tagSuccessText: { light: '#237804', dark: '#95de64' },
  tagWarningText: { light: '#ad6800', dark: '#ffd666' },
  tagErrorText: { light: '#cf1322', dark: '#ff7875' },
  tagPurpleText: { light: '#531dab', dark: '#b37feb' },
  tagOrangeText: { light: '#ad4e00', dark: '#ffc069' },
  primaryBg: { antdToken: 'colorPrimaryBg', light: '#e6f4ff' },
  primaryBgHover: { antdToken: 'colorPrimaryBgHover', light: '#bae0ff' },
  successBg: { antdToken: 'colorSuccessBg', light: '#f6ffed' },
  warningBg: { antdToken: 'colorWarningBg', light: '#fffbe6' },
  errorBg: { antdToken: 'colorErrorBg', light: '#fff2f0' },
  infoBg: { antdToken: 'colorInfoBg', light: '#e6f4ff' },
  purpleBg: { antdToken: 'purple1', light: '#f9f0ff' },
  orangeBg: { antdToken: 'orange1', light: '#fff7e6' },
  textPrimary: { antdToken: 'colorText', light: 'rgba(0, 0, 0, 0.88)' },
  textSecondary: { antdToken: 'colorTextSecondary', light: 'rgba(0, 0, 0, 0.65)' },
  textTertiary: { antdToken: 'colorTextTertiary', light: 'rgba(0, 0, 0, 0.45)' },
  textQuaternary: { antdToken: 'colorTextQuaternary', light: 'rgba(0, 0, 0, 0.25)' },
  textDisabled: { antdToken: 'colorTextDisabled', light: 'rgba(0, 0, 0, 0.25)' },
  bgContainer: { antdToken: 'colorBgContainer', light: '#ffffff' },
  bgLayout: { antdToken: 'colorBgLayout', light: '#f5f5f5' },
  bgElevated: { antdToken: 'colorBgElevated', light: '#ffffff' },
  border: { antdToken: 'colorBorder', light: '#d9d9d9' },
  borderSecondary: { antdToken: 'colorBorderSecondary', light: '#f0f0f0' },
  fill: { antdToken: 'colorFill', light: 'rgba(0, 0, 0, 0.15)' },
  fillSecondary: { antdToken: 'colorFillSecondary', light: 'rgba(0, 0, 0, 0.06)' },
  fillTertiary: { antdToken: 'colorFillTertiary', light: 'rgba(0, 0, 0, 0.04)' },
  fillQuaternary: { antdToken: 'colorFillQuaternary', light: 'rgba(0, 0, 0, 0.02)' },
} as const;

export type ThemeTokenName = keyof typeof themeTokens;

export type ThemeTokenDef = { antdToken: string; light: string } | { light: string; dark: string };

export function themeVarName(name: ThemeTokenName): string {
  return `--crm-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

function themeVar(name: ThemeTokenName): string {
  return `var(${themeVarName(name)}, ${themeTokens[name].light})`;
}

export const Colors = {
  // Primary — Ant Design blue palette
  primary: '#1677ff',
  primaryBg: themeVar('primaryBg'),
  primaryBgHover: themeVar('primaryBgHover'),
  primaryBorder: '#91caff',
  primaryBorderHover: '#69b1ff',
  primaryHover: '#4096ff',
  primaryActive: '#0958d9',
  primaryText: '#1677ff',
  primaryTextHover: '#4096ff',
  primaryTextActive: '#0958d9',

  // Functional
  success: '#52c41a',
  successBg: themeVar('successBg'),
  successBorder: '#b7eb8f',
  warning: '#faad14',
  warningBg: themeVar('warningBg'),
  warningBorder: '#ffe58f',
  error: '#ff4d4f',
  errorBg: themeVar('errorBg'),
  errorBorder: '#ffccc7',
  info: '#1677ff',
  infoBg: themeVar('infoBg'),
  infoBorder: '#91caff',
  purpleBg: themeVar('purpleBg'),
  tagPrimaryText: themeVar('tagPrimaryText'),
  tagSuccessText: themeVar('tagSuccessText'),
  tagWarningText: themeVar('tagWarningText'),
  tagErrorText: themeVar('tagErrorText'),
  tagPurpleText: themeVar('tagPurpleText'),
  tagOrangeText: themeVar('tagOrangeText'),
  orangeBg: themeVar('orangeBg'),

  // Neutral — text
  textPrimary: themeVar('textPrimary'),
  textSecondary: themeVar('textSecondary'),
  textTertiary: themeVar('textTertiary'),
  textQuaternary: themeVar('textQuaternary'),
  textDisabled: themeVar('textDisabled'),

  // Neutral — background
  bgContainer: themeVar('bgContainer'),
  bgLayout: themeVar('bgLayout'),
  bgElevated: themeVar('bgElevated'),
  bgSpotlight: 'rgba(0, 0, 0, 0.85)',
  bgMask: 'rgba(0, 0, 0, 0.45)',

  // Neutral — border
  border: themeVar('border'),
  borderSecondary: themeVar('borderSecondary'),

  // Neutral — fill
  fill: themeVar('fill'),
  fillSecondary: themeVar('fillSecondary'),
  fillTertiary: themeVar('fillTertiary'),
  fillQuaternary: themeVar('fillQuaternary'),

  // Domain — deal stages
  stageProspecting: '#1677ff',
  stageQualification: '#722ed1',
  stageProposal: '#fa8c16',
  stageNegotiation: '#faad14',
  stageClosedWon: '#52c41a',
  stageClosedLost: '#ff4d4f',

  // Domain — priority
  priorityLow: '#8c8c8c',
  priorityMedium: '#1677ff',
  priorityHigh: '#fa8c16',
  priorityCritical: '#ff4d4f',
} as const;

export type ColorToken = keyof typeof Colors;

// Ant Design spacing scale (multiples of 4)
export const Spacing = {
  xxs: '0.4rem',  // 4px
  xs: '0.8rem',   // 8px
  sm: '1.2rem',   // 12px
  md: '1.6rem',   // 16px
  lg: '2.4rem',   // 24px
  xl: '3.2rem',   // 32px
  xxl: '4.8rem',  // 48px
} as const;

// Ant Design typography scale
export const FontSize = {
  xs: '1.2rem',   // 12px — caption, helper text
  sm: '1.4rem',   // 14px — body (default)
  md: '1.6rem',   // 16px — subtitle
  lg: '2.0rem',   // 20px — h4
  xl: '2.4rem',   // 24px — h3
  xxl: '3.0rem',  // 30px — h2
  xxxl: '3.8rem', // 38px — h1
} as const;

export const LineHeight = {
  tight: 1.375,
  base: 1.5714,
  relaxed: 1.6667,
} as const;

export const BorderRadius = {
  sm: '0.4rem',  // 4px — tags, small elements
  md: '0.6rem',  // 6px — inputs, buttons
  lg: '0.8rem',  // 8px — cards, containers
  xl: '1.2rem',  // 12px — modals, large panels
} as const;

export const Shadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  md: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  lg: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
} as const;
