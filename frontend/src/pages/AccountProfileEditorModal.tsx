import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

import type { AccountProfileDraft } from "./AccountCenterPage.helpers";

export interface AccountProfileEditorModalLabels {
  title: string;
  displayName: string;
  avatarURL: string;
  bio: string;
  save: string;
  cancel: string;
  invalidAvatarURL: string;
  displayNameTooLong: string;
  bioTooLong: string;
}

interface AccountProfileEditorModalProps {
  open: boolean;
  submitting: boolean;
  initialValues: AccountProfileDraft;
  labels: AccountProfileEditorModalLabels;
  onCancel: () => void;
  onSubmit: (values: AccountProfileDraft) => Promise<void> | void;
}

function validateAvatarURL(value: string, invalidMessage: string): Promise<void> {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return Promise.resolve();
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return Promise.resolve();
    }
  } catch {
    return Promise.reject(new Error(invalidMessage));
  }

  return Promise.reject(new Error(invalidMessage));
}

export default function AccountProfileEditorModal({
  open,
  submitting,
  initialValues,
  labels,
  onCancel,
  onSubmit
}: AccountProfileEditorModalProps) {
  const [form] = Form.useForm<AccountProfileDraft>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    form.setFieldsValue(initialValues);
  }, [form, initialValues, open]);

  const handleConfirm = () => {
    void form.validateFields().then((values) => {
      void onSubmit(values);
    });
  };

  return (
    <Modal
      open={open}
      title={labels.title}
      okText={labels.save}
      cancelText={labels.cancel}
      confirmLoading={submitting}
      onCancel={onCancel}
      onOk={handleConfirm}
      destroyOnClose
      maskClosable={!submitting}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item<AccountProfileDraft>
          name="displayName"
          label={labels.displayName}
          rules={[{ max: 64, message: labels.displayNameTooLong }]}
        >
          <Input autoComplete="name" />
        </Form.Item>
        <Form.Item<AccountProfileDraft>
          name="avatarURL"
          label={labels.avatarURL}
          rules={[
            {
              validator: (_rule, value) => validateAvatarURL(String(value || ""), labels.invalidAvatarURL)
            }
          ]}
        >
          <Input autoComplete="url" placeholder="https://" />
        </Form.Item>
        <Form.Item<AccountProfileDraft>
          name="bio"
          label={labels.bio}
          rules={[{ max: 500, message: labels.bioTooLong }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
