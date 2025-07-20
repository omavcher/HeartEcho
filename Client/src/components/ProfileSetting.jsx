'use client';

import '../styles/ProfileSetting.css';
import '../styles/ProfileSetting2.css';
import BioSection from './ProfileSetting/BioSection';
import AiAssSection from './ProfileSetting/AiAssSection';
import ChatMaSection from './ProfileSetting/ChatMaSection';
import SubScribeSection from './ProfileSetting/SubScribeSection';
import Eable2FSection from './ProfileSetting/Eable2FSection';
import DeleteAcSection from './ProfileSetting/DeleteAcSection';
import SecuqureSection from './ProfileSetting/SecuqureSection';
import LiveChatSection from './ProfileSetting/LiveChatSection';
import FaqSection from './ProfileSetting/FaqSection';
import TicketSection from './ProfileSetting/TicketSection';

function ProfileSetting({ selectedSettingId, onBackSBTNSelect }) {
  const renderContent = () => {
    switch (selectedSettingId) {
      case 1:
        return <BioSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 2:
        return <BioSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 3:
        return <AiAssSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 4:
        return <ChatMaSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 5:
        return <AiAssSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 6:
        return <SubScribeSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 7:
        return <Eable2FSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 8:
        return <DeleteAcSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 9:
        return <SecuqureSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 10:
        return <LiveChatSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 11:
        return <FaqSection onBackSBTNSelect={onBackSBTNSelect} />;
      case 12:
        return <TicketSection onBackSBTNSelect={onBackSBTNSelect} />;
      default:
        return <div>Select a setting to view details.</div>;
    }
  };

  return <div className="profile-setting-container">{renderContent()}</div>;
}

export default ProfileSetting;