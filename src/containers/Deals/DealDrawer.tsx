import { useCallback, useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Select, Space, DatePicker, App } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@hooks/useAppStore';
import { useAbortableLock } from '@hooks/useAbortableLock';
import { createDeal, updateDeal, deleteDeal } from '@redux/deals/actions';
import { selectDealById } from '@redux/deals/slice';
import { selectContactsList } from '@redux/contacts/slice';
import { selectDefaultPipelineId } from '@redux/pipelines/slice';
import { closeDealDrawer, openDealDrawer } from '@redux/ui/slice';
import { dealAddSchema, dealEditSchema } from '@validators/DealValidator';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { GrantChildrenHOC } from '@HOC/GrantChildrenHOC';
import { DealStage, DealPriority } from '@models/Deal.model';
import { Colors, Spacing, BorderRadius } from '@styles/colors';
import { useAuth } from '@context/AuthContext/AuthContext';
import { isoToDateOnly, dateOnlyToIso } from '@helpers/date/date.helper';
import { applyZodErrorsToForm, isFormValidationError } from '@helpers/form/form.helper';

interface DealDrawerProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  entityId: string | null;
}

interface DealFormValues {
  title: string;
  value: number | null;
  probability: number | null;
  stage: DealStage;
  priority: DealPriority;
  contactId?: string | null;
  expectedCloseDate?: Dayjs | null;
  notes?: string | null;
}

/** Fields rendered by the form (the only ones an edit may change). */
const FORM_FIELDS = ['title', 'value', 'probability', 'stage', 'priority', 'contactId', 'expectedCloseDate', 'notes'] as const;

const DEFAULT_PROBABILITY = 50;

const CREATE_DEFAULTS: DealFormValues = {
  title: '',
  value: 0,
  probability: DEFAULT_PROBABILITY,
  stage: DealStage.Prospecting,
  priority: DealPriority.Medium,
  contactId: undefined,
  expectedCloseDate: null,
  notes: '',
};

export function parseProbability(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return DEFAULT_PROBABILITY;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_PROBABILITY;
}

/** Normalizes the form values to the API shape (only the form's fields). */
function formToPayload(values: DealFormValues) {
  return {
    title: values.title,
    value: Number(values.value ?? 0),
    probability: parseProbability(values.probability),
    stage: values.stage,
    priority: values.priority,
    contactId: values.contactId ?? '',
    expectedCloseDate: dateOnlyToIso(values.expectedCloseDate),
    notes: values.notes ?? '',
  };
}

export function DealDrawer({ open, mode, entityId }: DealDrawerProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['deals', 'label', 'common']);
  const { modal, message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm<DealFormValues>();

  const deal = useAppSelector(entityId ? selectDealById(entityId) : () => null);
  const contacts = useAppSelector(selectContactsList);
  const defaultPipelineId = useAppSelector(selectDefaultPipelineId);

  const { isLocked, lockFailed } = useAbortableLock(
    'deal',
    entityId ?? '',
    user?.id ?? '',
    open && mode === 'edit' && !!entityId,
  );

  // Re-run on every open: resetFields() on close wipes the values, so the
  // create defaults must be applied again on each opening.
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      form.setFieldsValue(CREATE_DEFAULTS);
    } else if (deal) {
      form.setFieldsValue({
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        priority: deal.priority,
        probability: deal.probability,
        contactId: deal.contactId || undefined,
        expectedCloseDate: isoToDateOnly(deal.expectedCloseDate),
        notes: deal.notes,
      });
    }
  }, [open, deal, mode, form]);

  const handleClose = useCallback(() => {
    form.resetFields();
    dispatch(closeDealDrawer());
  }, [dispatch, form]);

  const reportSchemaErrors = useCallback(
    (issues: Parameters<typeof applyZodErrorsToForm>[1]) => {
      if (!applyZodErrorsToForm(form, issues, FORM_FIELDS)) {
        void message.error(t('common:validationFailed'));
      }
    },
    [form, message, t],
  );

  const handleSubmit = useCallback(async () => {
    let values: DealFormValues;
    try {
      values = await form.validateFields();
    } catch (error) {
      // antd already shows the field errors; anything else is unexpected.
      if (!isFormValidationError(error)) void message.error(t('common:validationFailed'));
      return;
    }

    const payload = formToPayload(values);

    if (mode === 'create') {
      // Defaults for fields the form doesn't render only make sense on create.
      const result = dealAddSchema.safeParse({
        ...payload,
        ownerId: user?.id ?? '',
        currency: 'USD',
        companyId: '',
        pipelineId: defaultPipelineId,
        tags: [],
      });
      if (!result.success) {
        reportSchemaErrors(result.error.issues);
        return;
      }
      await dispatch(createDeal(result.data));
    } else if (mode === 'edit' && deal) {
      // Only the form's fields: currency, company, pipeline, tags and owner
      // are preserved by the merge in updateDeal.
      const result = dealEditSchema.safeParse(payload);
      if (!result.success) {
        reportSchemaErrors(result.error.issues);
        return;
      }
      await dispatch(updateDeal({ id: deal.id, payload: result.data, current: deal }));
    }

    handleClose();
  }, [mode, deal, form, dispatch, handleClose, user, defaultPipelineId, message, t, reportSchemaErrors]);

  const handleEdit = useCallback(() => {
    if (deal) dispatch(openDealDrawer({ mode: 'edit', entityId: deal.id }));
  }, [deal, dispatch]);

  const handleDelete = useCallback(() => {
    if (!deal) return;
    modal.confirm({
      title: t('deals:deleteConfirm'),
      okText: t('common:delete'),
      okButtonProps: { danger: true },
      cancelText: t('common:cancel'),
      onOk: async () => {
        await dispatch(deleteDeal(deal.id));
        handleClose();
      },
    });
  }, [deal, dispatch, handleClose, modal, t]);

  const isReadOnly = mode === 'view' || isLocked || lockFailed;

  let title = t('deals:dealDetails');
  if (mode === 'create') title = t('deals:addDeal');
  else if (mode === 'edit') title = t('deals:editDeal');

  let extra: React.ReactNode = null;
  if (mode === 'view' && deal) {
    extra = (
      <Space>
        <GrantChildrenHOC authorizationKey="deals.delete">
          <Button danger icon={<Icon name="delete" />} onClick={handleDelete}>
            {t('common:delete')}
          </Button>
        </GrantChildrenHOC>
        <GrantChildrenHOC authorizationKey="deals.edit">
          <Button type="primary" icon={<Icon name="edit" />} onClick={handleEdit}>
            {t('common:edit')}
          </Button>
        </GrantChildrenHOC>
      </Space>
    );
  } else if (!isReadOnly) {
    extra = (
      <Space>
        <Button onClick={handleClose}>{t('common:cancel')}</Button>
        <Button type="primary" onClick={handleSubmit}>
          {t('common:save')}
        </Button>
      </Space>
    );
  }

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleClose}
      width={520}
      forceRender
      extra={extra}
    >
      {(isLocked || lockFailed) && (
        <div role="alert" style={{ marginBottom: Spacing.md, padding: Spacing.xs, background: Colors.warningBg, borderRadius: BorderRadius.sm }}>
          <Icon name="lock" color="warning" /> {t(isLocked ? 'common:lockedByAnotherUser' : 'common:lockAcquireFailed')}
        </div>
      )}

      <Form form={form} layout="vertical" disabled={isReadOnly}>
        <Form.Item name="title" label={t('label:title')} rules={[{ required: true }, { max: 200 }]}>
          <Input placeholder={t('common:placeholder.type', { property: t('label:title') })} />
        </Form.Item>

        <Space size={16} style={{ width: '100%' }}>
          <Form.Item
            name="value"
            label={t('label:value')}
            rules={[{ required: true }, { type: 'number', min: 0, max: 999_999_999 }]}
            style={{ flex: 1 }}
          >
            <InputNumber prefix="$" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="probability"
            label={t('label:probability')}
            rules={[{ type: 'number', min: 0, max: 100 }]}
            style={{ flex: 1 }}
          >
            <InputNumber suffix="%" style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Form.Item name="stage" label={t('label:stage')} rules={[{ required: true }]}>
          <Select
            options={Object.values(DealStage).map((s) => ({ value: s, label: t(`deals:stage.${s}`) }))}
            placeholder={t('common:placeholder.select', { property: t('label:stage') })}
          />
        </Form.Item>

        <Form.Item name="priority" label={t('label:priority')} rules={[{ required: true }]}>
          <Select
            options={Object.values(DealPriority).map((p) => ({ value: p, label: t(`deals:priority.${p}`) }))}
          />
        </Form.Item>

        <Form.Item name="contactId" label={t('label:contact')}>
          <Select
            showSearch
            options={contacts.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName}`,
            }))}
            filterOption={(input, option) =>
              (option?.label as string | undefined)?.toLowerCase().includes(input.toLowerCase()) ?? false
            }
            placeholder={t('common:search')}
            allowClear
          />
        </Form.Item>

        <Form.Item name="expectedCloseDate" label={t('label:expectedCloseDate')}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="notes" label={t('common:notes')}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
