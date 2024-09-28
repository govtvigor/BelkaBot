import React, { useState, useEffect, useContext } from "react";
import "./socialTasks.scss"; 
import { ChatIdContext } from "../../client/App"; 
import Menu from "../../components/Menu/Menu";

interface SocialTask {
  onMenuClick: (screen: "game" | "profile" | "social") => void;
  id?: string;
  description?: string;
  action?: () => void;
  verify?: () => Promise<boolean>;
  
}

const TELEGRAM_CHANNEL_URL = "https://t.me/squirlTest"; // Replace with your channel URL

const SocialTasks: React.FC<SocialTask> = ({ onMenuClick }) => {
  const userChatId = useContext(ChatIdContext); // Ensure ChatIdContext provides the user's Telegram chat ID
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [canVerify, setCanVerify] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && !canVerify) {
      setCanVerify(true);
    }
    return () => clearTimeout(countdown);
  }, [timer, canVerify]);

  const handleJoin = () => {
    window.open(TELEGRAM_CHANNEL_URL, "_blank");
  };

  const handleVerify = async () => {
    if (!userChatId) {
      alert("User not authenticated.");
      return;
    }

    try {
      const response = await fetch("/api/checkSubscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: userChatId }),
      });

      const data = await response.json();

      if (response.ok && data.isMember) {
        setHasJoined(true);
        alert("Subscription verified! You have earned points.");
       
      } else {
        alert("You are not a member of the channel.");
        setCanVerify(false);
        setTimer(30); 
      }
    } catch (error) {
      console.error("Error verifying subscription:", error);
      alert("An error occurred during verification. Please try again.");
    }
  };

  return (
    <div className="social-tasks">
      <h2>Social Tasks</h2>
      <div className="tasks-container">
        
      <div className="task">
        <div className="task-text">
        <p>Join Telegram Channel to get 500 NUT points</p>
        </div>
        <div className="task-button">
        {!hasJoined ? (
          canVerify ? (
            <button className="join-button" onClick={handleJoin}>
              Join
            </button>
          ) : (
            <button className="verify-button disabled" disabled>
              Verify ({timer})
            </button>
          )
        ) : (
          <button className="verify-button" onClick={handleVerify}>
            Verify
          </button>
        )}
        </div>
      </div>
      </div>
      <Menu onMenuClick={onMenuClick}  variant="social"/>
    </div>
  );
};

export default SocialTasks;
