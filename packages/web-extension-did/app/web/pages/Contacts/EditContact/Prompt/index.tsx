import './index.less';
import SecondPageHeader from 'pages/components/SecondPageHeader';
import { IAddContactProps } from '..';
import NetworkModal from 'pages/Contacts/NetworkModal';
import EditContactForm from 'pages/Contacts/components/EditContactForm';

export default function EditContactPrompt({
  form,
  isNameDisable = false,
  isShowRemark = true,
  canSave = false,
  state,
  validName,
  validRemark,
  headerTitle,
  isShowDrawer,
  goBack,
  onFinish,
  handleInputValueChange,
  handleInputRemarkChange,
  closeDrawer,
  handleNetworkChange,
  handleCopy,
}: IAddContactProps) {
  return (
    <div className="edit-contact-prompt">
      <SecondPageHeader title={headerTitle} leftCallBack={goBack} />
      <EditContactForm
        form={form}
        isNameDisable={isNameDisable}
        isShowRemark={isShowRemark}
        canSave={canSave}
        validName={validName}
        validRemark={validRemark}
        state={state}
        onFinish={onFinish}
        handleInputValueChange={handleInputValueChange}
        handleInputRemarkChange={handleInputRemarkChange}
        handleCopy={handleCopy}
      />
      <NetworkModal open={isShowDrawer} onChange={handleNetworkChange} onClose={closeDrawer} />
    </div>
  );
}
