import { Avatar as AntAvatar } from 'antd';
import styled from 'styled-components';
import { Colors } from '@styles/colors';

const StyledAvatar = styled(AntAvatar)`
  background: ${Colors.primary};
  font-weight: 600;
  font-size: 1.2rem;
`;

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name, src, size = 32 }: AvatarProps) {
  return (
    <StyledAvatar src={src ?? undefined} size={size}>
      {!src && getInitials(name)}
    </StyledAvatar>
  );
}
