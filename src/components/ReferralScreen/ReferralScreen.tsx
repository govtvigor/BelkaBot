// ReferralScreen.tsx

import React, { useState, useEffect, useContext } from "react";
import "./referralScreen.scss";
import { ChatIdContext } from "../../client/App";
import { getReferralData, getReferralLink } from "../../client/firebaseFunctions";

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
      setTimeout(() => setCopyMessage(""), 2000);
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
        <div className="screen-title">Share the link & earn</div>
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
              Share
            </button>
          </div>
          {copyMessage && <div className="copy-message">{copyMessage}</div>}
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
          {referredUsers.length > 0 ? (
            referredUsers.map((user, index) => (
              <div key={index} className="referred-user">
                <p>{user.username}</p>
                <p>{user.pointsEarned} points</p>
              </div>
            ))
          ) : (
            <p>No referrals yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralScreen;
