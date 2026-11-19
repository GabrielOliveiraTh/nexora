import { Input } from 'antd';
import styled from 'styled-components';
import { Colors, BorderRadius, Spacing } from '@styles/colors';
import { Icon } from '@atoms/Icon/Icon';

const StyledSearch = styled(Input)`
  border-radius: ${BorderRadius.md};
  max-width: 32rem;

  .ant-input-prefix {
    color: ${Colors.textTertiary};
    margin-right: ${Spacing.xs};
  }

  &:hover {
    border-color: ${Colors.primaryBorderHover};
  }

  &:focus-within {
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 2px ${Colors.primaryBg};
  }
`;

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <StyledSearch
      prefix={<Icon name="search" fontSize="1.4rem" />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      allowClear
    />
  );
}
