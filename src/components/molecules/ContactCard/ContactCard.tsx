import { Space, Typography } from 'antd';
import styled from 'styled-components';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '@styles/colors';
import { Avatar } from '@atoms/Avatar/Avatar';
import { StatusTag } from '@atoms/StatusTag/StatusTag';
import { Icon } from '@atoms/Icon/Icon';
import type { Contact } from '@models/Contact.model';

const Card = styled.div`
  padding: ${Spacing.md};
  border: 1px solid ${Colors.borderSecondary};
  border-radius: ${BorderRadius.lg};
  background: ${Colors.bgContainer};
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    border-color: ${Colors.primaryBorderHover};
    box-shadow: ${Shadow.sm};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${Spacing.sm};
  margin-bottom: ${Spacing.sm};
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: ${Spacing.xxs};
  color: ${Colors.textSecondary};
  font-size: ${FontSize.xs};
`;

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  return (
    <Card onClick={() => onClick(contact)}>
      <Header>
        <Avatar name={`${contact.firstName} ${contact.lastName}`} />
        <div>
          <Typography.Text strong>
            {contact.firstName} {contact.lastName}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: FontSize.xs }}>
            {contact.jobTitle}
          </Typography.Text>
        </div>
      </Header>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Info>
          <Icon name="mail" fontSize={FontSize.xs} />
          {contact.email}
        </Info>
        <Info>
          <Icon name="phone" fontSize={FontSize.xs} />
          {contact.phone}
        </Info>
      </Space>
      <div style={{ marginTop: Spacing.sm }}>
        <StatusTag type="contactStatus" value={contact.status} label={contact.status} />
      </div>
    </Card>
  );
}
