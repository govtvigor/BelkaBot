// src/components/Profile/ReferralScreen.tsx

import React, { useState, useEffect, useContext } from "react";
import "./referralScreen.scss";
import { ChatIdContext } from "../../client/App";
import {
  getReferralData,
  getReferralLink,
} from "../../client/firebaseFunctions";

interface ReferralScreenProps {
  onClose: () => void;
}

interface ReferralUser {
  username: string;
  pointsEarned: number;
}

const ReferralScreen: React.FC<ReferralScreenProps> = ({ onClose }) => {
  const userChatId = useContext(ChatIdContext);
  const [referralLink, setReferralLink] = useState<string>("");
  const [totalReferrals, setTotalReferrals] = useState<number>(0);
  const [totalReferralPoints, setTotalReferralPoints] = useState<number>(0);
  const [referredUsers, setReferredUsers] = useState<ReferralUser[]>([]);
  const [copyMessage, setCopyMessage] = useState<string>("");

  useEffect(() => {
    if (userChatId) {
      // Generate the referral link
      const link = getReferralLink(userChatId);
      setReferralLink(link);

      // Fetch referral data
      getReferralData(userChatId).then((data) => {
        setTotalReferrals(data.totalReferrals);
        setTotalReferralPoints(data.totalReferralPoints);
        setReferredUsers(data.referredUsers);
      });
    }
  }, [userChatId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopyMessage("Link copied!");
      setTimeout(() => setCopyMessage(""), 2000); // Clear message after 2 seconds
    });
  };

  const handleShareLink = () => {
    console.log(process.env.TELEGRAM_BOT_TOKEN)
    // Use Telegram to share the link
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent("Join me on this awesome app!")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="referral-screen active">
      <div className="referral-screen-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2 className="screen-title">Invite Friends</h2>
        <div className="referral-link-section">
          <input type="text" readOnly value={referralLink} />
          <button onClick={handleCopyLink}>Copy Link</button>
          {copyMessage && <div className="copy-message">{copyMessage}</div>}
          <button onClick={handleShareLink}>Share on Telegram</button>
        </div>
        <div className="referral-stats">
          <div className="stat-block">
            <p>Total Referrals</p>
            <p>{totalReferrals}</p>
          </div>
          <div className="stat-block">
            <p>Points Earned</p>
            <p>{totalReferralPoints}</p>
          </div>
        </div>
        <div className="referred-users-list">
          <h3>Your Referred Friends</h3>
          {referredUsers.map((user, index) => (
            <div key={index} className="referred-user">
              <p>{user.username}</p>
              <p>{user.pointsEarned} points</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralScreen;
