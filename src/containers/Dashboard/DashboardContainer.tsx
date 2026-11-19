import { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@hooks/useAppStore';
import { selectDealsList, selectDealsTotalValue } from '@redux/deals/slice';
import { selectContactsList } from '@redux/contacts/slice';
import { Icon } from '@atoms/Icon/Icon';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '@styles/colors';
import { formatCurrency } from '@helpers/format/format.helper';

const StyledCard = styled(Card)`
  border-radius: ${BorderRadius.lg};
  box-shadow: ${Shadow.sm};
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: ${Shadow.md};
  }
`;

const PageTitle = styled(Typography.Title)`
  && {
    margin-bottom: ${Spacing.lg};
  }
`;

export function DashboardContainer() {
  const { t } = useTranslation('dashboard');
  const contacts = useAppSelector(selectContactsList);
  const deals = useAppSelector(selectDealsList);
  const pipelineValue = useAppSelector(selectDealsTotalValue);
  const currency = useAppSelector((state) => state.preferences.currency);

  const stats = useMemo(
    () => [
      {
        title: t('totalContacts'),
        value: contacts.length,
        icon: 'user' as const,
        color: Colors.primary,
      },
      {
        title: t('totalDeals'),
        value: deals.length,
        icon: 'pipeline' as const,
        color: Colors.stageQualification,
      },
      {
        title: t('pipelineValue'),
        value: formatCurrency(pipelineValue, currency),
        icon: 'dollar' as const,
        color: Colors.success,
      },
      {
        title: t('activitiesDue'),
        value: 0,
        icon: 'calendar' as const,
        color: Colors.warning,
      },
    ],
    [contacts.length, deals.length, pipelineValue, currency, t],
  );

  return (
    <div>
      <PageTitle level={3}>{t('title')}</PageTitle>
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col key={stat.title} xs={24} sm={12} lg={6}>
            <StyledCard>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<Icon name={stat.icon} fontSize={FontSize.lg} color={stat.color} />}
              />
            </StyledCard>
          </Col>
        ))}
      </Row>
    </div>
  );
}
