// ReferralScreen.tsx

import React, { useState, useEffect, useContext } from "react";
import "./referralScreen.scss";
import { ChatIdContext } from "../../client/App";
import { getReferralData, getReferralLink } from "../../client/firebaseFunctions";
import { useTranslation } from "react-i18next";

interface ReferralScreenProps {
  onClose: () => void;
}

interface ReferralUser {
  username: string;
  pointsEarned: number;
}

const ReferralScreen: React.FC<ReferralScreenProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const userChatId = useContext(ChatIdContext);
  const [referralLink, setReferralLink] = useState<string>("");
  const [totalReferrals, setTotalReferrals] = useState<number>(0);
  const [totalReferralPoints, setTotalReferralPoints] = useState<number>(0);
  const [referredUsers, setReferredUsers] = useState<ReferralUser[]>([]);
  const [copyMessage, setCopyMessage] = useState<string>("");

  useEffect(() => {
    if (userChatId) {
      const link = getReferralLink(userChatId);
      setReferralLink(link);

      getReferralData(userChatId).then((data) => {
        setTotalReferrals(data.totalReferrals);
        setTotalReferralPoints(data.totalReferralPoints);
        setReferredUsers(data.referredUsers);
      }).catch((error) => {
        console.error("Error fetching referral data:", error);
      });
    }
  }, [userChatId]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopyMessage("Link was copied!");
      setTimeout(() => setCopyMessage(""), 1000);
    }).catch((error) => {
      console.error("Error copying link:", error);
    });
  };

  const handleShareLink = () => {
    if (!referralLink) return;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
      "Join me on this awesome app!"
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="referral-screen active">
      <div className="referral-screen-content">
        <div className="screen-title">{t('refs.share_link')}</div>
        <button className="close-button" onClick={onClose}>
          X
        </button>

        <div className="referral-link-section">
          <div className="referral-link-input-container">
            <input
              type="text"
              readOnly
              value={referralLink}
              onClick={handleCopyLink}
              className="referral-link-input"
              title="Click to copy the referral link"
            />
            <button className="share-button" onClick={handleShareLink}>
              {t('refs.share_button')}
            </button>
          </div>
          {copyMessage && <div className="copy-message">{copyMessage}</div>}
        </div>

        <div className="referral-stats">
          <div className="stat-block">
            <p>{t('refs.total_refs')}</p>
            <p>{totalReferrals}</p>
          </div>
          <div className="stat-block">
            <p>{t('refs.points_earned_ref')}</p>
            <p>{totalReferralPoints}</p>
          </div>
        </div>
        <div className="referred-users-list">
          <h3>{t('refs.ref_friends')}</h3>
          {referredUsers.length > 0 ? (
            referredUsers.map((user, index) => (
              <div key={index} className="referred-user">
                <p>{user.username}</p>
                <p>{user.pointsEarned} points</p>
              </div>
            ))
          ) : (
            <p className="no-refs">{t('refs.no_refs')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralScreen;
