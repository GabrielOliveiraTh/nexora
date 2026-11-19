import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';
import styled from 'styled-components';
import { Colors, BorderRadius } from '@styles/colors';

const StyledButton = styled(AntButton)`
  border-radius: ${BorderRadius.md};
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.ant-btn-primary {
    background: ${Colors.primary};
    box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);

    &:hover {
      background: ${Colors.primaryHover};
    }

    &:active {
      background: ${Colors.primaryActive};
    }
  }

  &.ant-btn-default {
    &:hover {
      color: ${Colors.primaryHover};
      border-color: ${Colors.primaryHover};
    }
  }
`;

interface ButtonProps extends AntButtonProps {
  compact?: boolean;
}

export function Button({ compact, style, ...props }: ButtonProps) {
  return (
    <StyledButton
      style={compact ? { padding: '0.4rem 0.8rem', height: 'auto', ...style } : style}
      {...props}
    />
  );
}
