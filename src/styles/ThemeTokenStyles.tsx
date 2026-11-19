import { useMemo } from 'react';
import { theme } from 'antd';
import { createGlobalStyle } from 'styled-components';
import { themeTokens, themeVarName, type ThemeTokenName, type ThemeTokenDef } from '@styles/colors';
import { useAppSelector } from '@hooks/useAppStore';

const GlobalVars = createGlobalStyle<{ $css: string }>`
  :root {
    ${(props) => props.$css}
  }

  body {
    background: var(${themeVarName('bgLayout')});
    color: var(${themeVarName('textPrimary')});
  }
`;

/**
 * Publishes the current antd theme tokens as CSS variables consumed by
 * `Colors.*` (see styles/colors.ts). Must be rendered inside ConfigProvider.
 */
export function ThemeTokenStyles() {
  const { token } = theme.useToken();
  const isDark = useAppSelector((state) => state.preferences.theme === 'dark');

  const css = useMemo(() => {
    const tokenRecord = token as unknown as Record<string, string | undefined>;
    return (Object.keys(themeTokens) as ThemeTokenName[])
      .map((name) => {
        const def: ThemeTokenDef = themeTokens[name];
        const value = 'dark' in def ? (isDark ? def.dark : def.light) : (tokenRecord[def.antdToken] ?? def.light);
        return `${themeVarName(name)}: ${value};`;
      })
      .join('\n');
  }, [token, isDark]);

  return <GlobalVars $css={css} />;
}
