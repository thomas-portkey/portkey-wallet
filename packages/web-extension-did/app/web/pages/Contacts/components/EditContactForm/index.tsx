import { Button, Form, Input, message, FormProps } from 'antd';
import { useState, useCallback } from 'react';
import DeleteContact from 'pages/Contacts/DeleteContact';
import { useDeleteContact } from '@portkey-wallet/hooks/hooks-ca/contact';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import IdAndAddress from '../IdAndAddress';
import { ValidData } from 'pages/Contacts/EditContact';
import './index.less';

const { Item: FormItem } = Form;

interface IEditContactFormProps extends FormProps {
  state: any;
  validName: ValidData;
  validRemark?: ValidData;
  isNameDisable?: boolean;
  isShowRemark?: boolean;
  canSave?: boolean;
  handleInputValueChange: (v: string) => void;
  handleInputRemarkChange: (v: string) => void;
  handleCopy: (val: string) => void;
}

export default function EditContactForm({
  form,
  state,
  validName,
  validRemark,
  isNameDisable = false,
  isShowRemark = true,
  canSave = false,
  handleInputValueChange,
  handleInputRemarkChange,
  handleCopy,
  onFinish,
}: IEditContactFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteContactApi = useDeleteContact();
  const [delOpen, setDelOpen] = useState<boolean>(false);

  const handleDelConfirm = useCallback(async () => {
    await deleteContactApi(state);
    navigate('/setting/contacts');
    message.success('Contact deleted successfully');
  }, [deleteContactApi, navigate, state]);

  return (
    <Form
      form={form}
      autoComplete="off"
      layout="vertical"
      className="flex-column edit-contact-form"
      initialValues={state}
      requiredMark={false}
      onFinish={onFinish}>
      <div className="form-content">
        <FormItem name="name" label={t('Name')} validateStatus={validName.validateStatus} help={validName.errorMsg}>
          <Input
            placeholder={t('Enter name')}
            onChange={(e) => handleInputValueChange(e.target.value)}
            maxLength={16}
            disabled={isNameDisable}
          />
        </FormItem>

        {isShowRemark && (
          <FormItem
            name="remark"
            label={t('Remrk')}
            validateStatus={validRemark?.validateStatus}
            help={validRemark?.errorMsg}>
            <Input
              placeholder={t('Enter remark')}
              onChange={(e) => handleInputRemarkChange(e.target.value)}
              maxLength={16}
            />
          </FormItem>
        )}
      </div>

      <IdAndAddress portkeyId={'22'} relationOneId={''} addresses={[]} handleCopy={handleCopy} />

      <div className="form-btn">
        <div className="flex-between form-btn-edit">
          <Button
            danger
            onClick={() => {
              setDelOpen(true);
            }}>
            {t('Delete')}
          </Button>
          <Button htmlType="submit" type="primary" disabled={canSave}>
            {t('Save')}
          </Button>
        </div>
        <DeleteContact
          open={delOpen}
          onCancel={() => {
            setDelOpen(false);
          }}
          onConfirm={handleDelConfirm}
        />
      </div>
    </Form>
  );
}
