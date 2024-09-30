import React, { useState, useEffect, useContext } from "react";
import "./socialTasks.scss";
import { ChatIdContext } from "../../client/App";
import Menu from "../../components/Menu/Menu";
import {
  getUserData,
  updateUserTotalPoints,
  updateUserTaskCompletion,
} from "../../client/firebaseFunctions";

interface SocialTaskProps {
  onMenuClick: (screen: "game" | "profile" | "social") => void;
}

const TELEGRAM_CHANNEL_URL = "https://t.me/squirlTest"; // Replace with your channel URL
const TASK_ID = "joinTelegramChannel"; // Unique identifier for the task

const SocialTasks: React.FC<SocialTaskProps> = ({ onMenuClick }) => {
  const userChatId = useContext(ChatIdContext); // User's Telegram chat ID
  const [canVerify, setCanVerify] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  // Handle cooldown timer
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && !canVerify) {
      setCanVerify(true);
    }
    return () => clearTimeout(countdown);
  }, [timer, canVerify]);

  // Check if the user has already completed the task
  useEffect(() => {
    const checkTaskCompletion = async () => {
      if (userChatId) {
        try {
          const userData = await getUserData(userChatId);
          if (userData?.completedTasks?.includes(TASK_ID)) {
            setTaskCompleted(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkTaskCompletion();
  }, [userChatId]);

  // Handle the Join button click
  const handleJoin = () => {
    window.open(TELEGRAM_CHANNEL_URL, "_blank");
    setHasJoined(true);
  };

  // Handle the Verify button click
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

      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to verify subscription.");
      }

      const data = await response.json();

      if (data.isMember) {
        setTaskCompleted(true);
        alert("Subscription verified! You have earned 500 NUT points.");

        // Award points
        await updateUserTotalPoints(userChatId, 500);

        // Update task completion status in Firebase
        await updateUserTaskCompletion(userChatId, TASK_ID);
      } else {
        alert("You are not a member of the channel.");
        setCanVerify(false);
        setTimer(30); // Start 30-second cooldown
      }
    } catch (error: any) {
      console.error("Error verifying subscription:", error.message || error);
      alert(
        "An error occurred during verification. Please ensure you have joined the channel and try again."
      );
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
