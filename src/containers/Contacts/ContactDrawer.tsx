import { useCallback, useEffect } from 'react';
import { Drawer, Form, Input, Select, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@hooks/useAppStore';
import { useAbortableLock } from '@hooks/useAbortableLock';
import { createContact, updateContact } from '@redux/contacts/actions';
import { selectContactById } from '@redux/contacts/slice';
import { closeContactDrawer } from '@redux/ui/slice';
import { ContactAssembler } from '@assemblers/ContactAssembler';
import { contactAddSchema, contactEditSchema } from '@validators/ContactValidator';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { ContactStatus, ContactSource } from '@models/Contact.model';
import type { ContactFormData } from '@models/Contact.model';
import { Colors, Spacing, BorderRadius } from '@styles/colors';
import { useAuth } from '@context/AuthContext/AuthContext';
import { applyZodErrorsToForm, isFormValidationError, pickFields } from '@helpers/form/form.helper';

interface ContactDrawerProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  entityId: string | null;
}

/** Fields rendered by the form (the only ones an edit may change). */
const FORM_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'status', 'source', 'notes'] as const;

const PHONE_PATTERN = /^\+?[\d\s-()]+$/;

export function ContactDrawer({ open, mode, entityId }: ContactDrawerProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['contacts', 'label', 'common']);
  const { message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm<ContactFormData>();

  const contact = useAppSelector(entityId ? selectContactById(entityId) : () => null);

  const { isLocked, lockFailed } = useAbortableLock(
    'contact',
    entityId ?? '',
    user?.id ?? '',
    open && mode === 'edit' && !!entityId,
  );

  // Re-run on every open: resetFields() on close wipes the values, so the
  // create defaults (Lead / Website) must be applied again on each opening.
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      form.setFieldsValue(ContactAssembler.assembleEmptyForm());
    } else if (contact) {
      form.setFieldsValue(ContactAssembler.assembleNormalizedFormContact(contact));
    }
  }, [open, contact, mode, form]);

  const handleClose = useCallback(() => {
    form.resetFields();
    dispatch(closeContactDrawer());
  }, [dispatch, form]);

  const handleSubmit = useCallback(async () => {
    let values: ContactFormData;
    try {
      values = await form.validateFields();
    } catch (error) {
      // antd already shows the field errors; anything else is unexpected.
      if (!isFormValidationError(error)) void message.error(t('common:validationFailed'));
      return;
    }

    if (mode === 'create') {
      const result = contactAddSchema.safeParse({
        ...values,
        ownerId: user?.id ?? '',
        tags: values.tags ?? [],
        lastContactedAt: values.lastContactedAt ?? null,
      });
      if (!result.success) {
        if (!applyZodErrorsToForm(form, result.error.issues, FORM_FIELDS)) {
          void message.error(t('common:validationFailed'));
        }
        return;
      }
      await dispatch(createContact(result.data));
    } else if (mode === 'edit' && contact) {
      // Only send what the form edits, so fields not shown (tags, owner,
      // company...) are preserved by the merge in updateContact.
      const result = contactEditSchema.safeParse(pickFields(values, FORM_FIELDS));
      if (!result.success) {
        if (!applyZodErrorsToForm(form, result.error.issues, FORM_FIELDS)) {
          void message.error(t('common:validationFailed'));
        }
        return;
      }
      await dispatch(updateContact({ id: contact.id, payload: result.data, current: contact }));
    }

    handleClose();
  }, [mode, contact, form, dispatch, handleClose, user, message, t]);

  const isReadOnly = mode === 'view' || isLocked || lockFailed;

  let title = t('contacts:contactDetails');
  if (mode === 'create') title = t('contacts:addContact');
  else if (mode === 'edit') title = t('contacts:editContact');

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleClose}
      width={520}
      forceRender
      extra={
        !isReadOnly && (
          <Space>
            <Button onClick={handleClose}>{t('common:cancel')}</Button>
            <Button type="primary" onClick={handleSubmit}>
              {t('common:save')}
            </Button>
          </Space>
        )
      }
    >
      {(isLocked || lockFailed) && (
        <div role="alert" style={{ marginBottom: Spacing.md, padding: Spacing.xs, background: Colors.warningBg, borderRadius: BorderRadius.sm }}>
          <Icon name="lock" color="warning" /> {t(isLocked ? 'common:lockedByAnotherUser' : 'common:lockAcquireFailed')}
        </div>
      )}

      <Form form={form} layout="vertical" disabled={isReadOnly}>
        <Space size={16} style={{ width: '100%' }}>
          <Form.Item name="firstName" label={t('label:firstName')} rules={[{ required: true }]} style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label={t('label:lastName')} rules={[{ required: true }]} style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </Space>

        <Form.Item name="email" label={t('label:email')} rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="phone" label={t('label:phone')} rules={[{ pattern: PHONE_PATTERN, message: 'Invalid phone format' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="jobTitle" label={t('label:jobTitle')}>
          <Input />
        </Form.Item>

        <Form.Item name="status" label={t('common:status')} rules={[{ required: true }]}>
          <Select
            options={Object.values(ContactStatus).map((s) => ({
              value: s,
              label: t(`contacts:status.${s}`),
            }))}
          />
        </Form.Item>

        <Form.Item name="source" label={t('label:source')} rules={[{ required: true }]}>
          <Select
            options={Object.values(ContactSource).map((s) => ({
              value: s,
              label: t(`contacts:source.${s}`),
            }))}
          />
        </Form.Item>

        <Form.Item name="notes" label={t('common:notes')}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
