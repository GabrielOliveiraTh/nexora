import { useId } from 'react';
import styled from 'styled-components';
import { Colors } from '@styles/colors';

export const APP_NAME = 'Nexora';

const Wrapper = styled.span<{ $gap: number }>`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.$gap}px;
  line-height: 1;
`;

const Wordmark = styled.span<{ $size: number }>`
  font-size: ${(props) => props.$size}px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${Colors.textPrimary};
`;

interface LogoMarkProps {
  size?: number;
  title?: string;
}

/**
 * Nexora mark: three connected nodes drawing an "N" that rises to the right —
 * contacts linking up into a growing pipeline.
 */
export function LogoMark({ size = 32, title }: LogoMarkProps) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1677ff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path
        d="M9.5 22.5V11.5L22.5 20.5V8.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="22.5" r="2.6" fill="#ffffff" />
      <circle cx="9.5" cy="11.5" r="2.1" fill="#ffffff" fillOpacity="0.85" />
      <circle cx="22.5" cy="8.5" r="3" fill="#ffffff" />
      <circle cx="22.5" cy="8.5" r="1.2" fill="#7c3aed" />
    </svg>
  );
}

interface LogoProps {
  /** Height of the mark in px; the wordmark scales with it. */
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ size = 32, showWordmark = true }: LogoProps) {
  return (
    <Wrapper $gap={Math.round(size * 0.3)}>
      <LogoMark size={size} title={showWordmark ? undefined : APP_NAME} />
      {showWordmark && <Wordmark $size={Math.round(size * 0.7)}>{APP_NAME}</Wordmark>}
    </Wrapper>
  );
}
