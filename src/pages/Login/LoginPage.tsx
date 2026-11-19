import { Form, Input, Button, Card, Typography } from 'antd';
import { Logo } from '@atoms/Logo/Logo';
import { useNavigate } from '@tanstack/react-router';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@context/AuthContext/AuthContext';
import { UserRole } from '@models/Common.model';
import { Colors, Spacing, BorderRadius, Shadow } from '@styles/colors';
import { MOCK_USER_ID } from '@mock/contacts.mock';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${Colors.bgLayout};
`;

const LoginCard = styled(Card)`
  width: 40rem;
  border-radius: ${BorderRadius.xl};
  box-shadow: ${Shadow.md};
`;

export function LoginPage() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (values: { email: string; password: string }) => {
    const user = {
      id: MOCK_USER_ID,
      name: 'Demo User',
      email: values.email,
      avatar: null,
      role: UserRole.Admin,
      teamId: 'team-1',
      isActive: true,
    };
    const permissions = {
      'contacts.create': true,
      'contacts.edit': true,
      'contacts.delete': true,
      'contacts.export': true,
      'contacts.import': true,
      'contacts.bulkEdit': true,
      'deals.create': true,
      'deals.edit': true,
      'deals.delete': true,
    };
    // login() persists the session and syncs the Redux auth slice.
    login(user, permissions);
    navigate({ to: '/' });
  };

  return (
    <LoginContainer>
      <LoginCard>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: Spacing.xs }}>
          <Logo size={40} />
        </div>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: Spacing.lg }}>
          {t('tagline')}
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="demo@crm.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('login')}
            </Button>
          </Form.Item>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
}
