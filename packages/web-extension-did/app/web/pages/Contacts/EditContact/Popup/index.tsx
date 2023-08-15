import './index.less';
import CustomSvg from 'components/CustomSvg';
import NetworkDrawer from '../../NetworkDrawer';
import BackHeader from 'components/BackHeader';
import { IAddContactProps } from '..';
import EditContactForm from 'pages/Contacts/components/EditContactForm';

export default function EditContactPopup({
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
    <div className="edit-contact-popup min-width-max-height">
      <div className="edit-contact-title">
        <BackHeader
          title={headerTitle}
          leftCallBack={goBack}
          rightElement={<CustomSvg type="Close2" onClick={goBack} />}
        />
      </div>
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
      <NetworkDrawer
        open={isShowDrawer}
        height={528}
        maskClosable={true}
        placement="bottom"
        onChange={handleNetworkChange}
        onClose={closeDrawer}
      />
    </div>
  );
}
