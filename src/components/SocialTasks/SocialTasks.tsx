import React, { useState, useEffect, useContext } from "react";
import "./socialTasks.scss";
import { ChatIdContext } from "../../client/App";
import Menu from "../../components/Menu/Menu";
import { getUserData, updateUserTotalPoints, updateUserTaskCompletion } from "../../client/firebaseFunctions";

interface SocialTaskProps {
  onMenuClick: (screen: "game" | "profile" | "social") => void;
}

interface TaskCompletionStatus {
  [taskId: string]: boolean;
}

const TELEGRAM_CHANNEL_URL = "https://t.me/squirlTest"; // Replace with your channel URL

const SocialTasks: React.FC<SocialTaskProps> = ({ onMenuClick }) => {
  const userChatId = useContext(ChatIdContext); // Ensure ChatIdContext provides the user's Telegram chat ID
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [canVerify, setCanVerify] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && !canVerify) {
      setCanVerify(true);
    }
    return () => clearTimeout(countdown);
  }, [timer, canVerify]);

  useEffect(() => {
    const checkTaskCompletion = async () => {
      if (userChatId) {
        try {
          const userData = await getUserData(userChatId);
          if (userData?.completedTasks?.includes("joinTelegramChannel")) {
            setTaskCompleted(true);
            setHasJoined(true); // Assume task is completed if joined
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkTaskCompletion();
  }, [userChatId]);

  const handleJoin = () => {
    window.open(TELEGRAM_CHANNEL_URL, "_blank");
    setHasJoined(true);
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
        setTaskCompleted(true);
        alert("Subscription verified! You have earned 500 NUT points.");

        // Award points
        await updateUserTotalPoints(userChatId, 500);

        // Update task completion status in Firebase
        await updateUserTaskCompletion(userChatId, "joinTelegramChannel");
      } else {
        alert("You are not a member of the channel.");
        setCanVerify(false);
        setTimer(30); // Start cooldown
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
            {taskCompleted ? (
              <button className="completed-button" disabled>
                Completed
              </button>
            ) : hasJoined ? (
              <button
                className={`verify-button ${!canVerify ? "disabled" : ""}`}
                onClick={handleVerify}
                disabled={!canVerify}
              >
                {canVerify ? "Verify" : `Verify (${timer})`}
              </button>
            ) : (
              <button className="join-button" onClick={handleJoin}>
                Join
              </button>
            )}
          </div>
        </div>
      </div>
      <Menu onMenuClick={onMenuClick} variant="social" />
    </div>
  );
};

export default SocialTasks;
