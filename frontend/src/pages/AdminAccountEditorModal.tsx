import { Alert, Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";

export interface AdminAccountEditorAccount {
  id: number;
  username: string;
  role: string;
  status: string;
}

export interface AdminAccountEditorValues {
  role: string;
  status: string;
}

interface AdminAccountEditorModalProps {
  open: boolean;
  submitting: boolean;
  errorMessage: string;
  account: AdminAccountEditorAccount | null;
  onCancel: () => void;
  onSubmit: (values: AdminAccountEditorValues) => Promise<void> | void;
}

export default function AdminAccountEditorModal({
  open,
  submitting,
  errorMessage,
  account,
  onCancel,
  onSubmit
}: AdminAccountEditorModalProps) {
  const [form] = Form.useForm<AdminAccountEditorValues>();

  useEffect(() => {
    if (!open || !account) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({
      role: account.role,
      status: account.status
    });
  }, [account, form, open]);

  const handleConfirm = () => {
    void form.validateFields().then((values) => {
      const normalized: AdminAccountEditorValues = {
        role: values.role.trim(),
        status: values.status.trim().toLowerCase()
      };
      void onSubmit(normalized);
    });
  };

  return (
    <Modal
      open={open}
      title="Edit Account"
      wrapClassName="account-workbench-editor-modal"
      okText="Save"
      cancelText="Cancel"
      confirmLoading={submitting}
      onCancel={onCancel}
      onOk={handleConfirm}
      destroyOnClose
      maskClosable={!submitting}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        {errorMessage ? <Alert type="error" message={errorMessage} showIcon className="account-workbench-editor-alert" /> : null}
        <Form.Item label="Username">
          <Input value={account?.username || ""} disabled />
        </Form.Item>
        <Form.Item<AdminAccountEditorValues>
          name="role"
          label="Role"
          rules={[
            { required: true, message: "Role is required." },
            { max: 60, message: "Role must be 60 characters or fewer." }
          ]}
        >
          <Select
            options={[
              { value: "viewer", label: "viewer" },
              { value: "member", label: "member" },
              { value: "admin", label: "admin" },
              { value: "super_admin", label: "super_admin" }
            ]}
          />
        </Form.Item>
        <Form.Item<AdminAccountEditorValues>
          name="status"
          label="Status"
          rules={[{ required: true, message: "Status is required." }]}
        >
          <Select
            options={[
              { value: "active", label: "active" },
              { value: "disabled", label: "disabled" }
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
