// socialTasks.tsx

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

interface Task {
  id: string;
  description: string;
  channelUrl: string;
  points: number;
  taskCompleted: boolean;
  hasJoined: boolean;
  canVerify: boolean;
  timer: number;
  isLoading: boolean;
  type: "telegram" | "twitter";
}

const API_BASE_URL = "https://belka-bot.vercel.app/api"; // Ensure this points to your API

// Define your tasks here
const predefinedTasks: Omit<
  Task,
  "taskCompleted" | "hasJoined" | "canVerify" | "timer" | "isLoading" | "type"
>[] = [
  // Existing Telegram tasks
  {
    id: "joinTelegramChannel",
    description: "Join Telegram Channel to get 500 NUT points",
    channelUrl: "https://t.me/squirreala",
    points: 500,
  },
  {
    id: "joinAnotherChannel",
    description: "Join our second channel to get 300 NUT points",
    channelUrl: "https://t.me/avcryptoo",
    points: 300,
  },
  // New Twitter tasks
  {
    id: "followTwitter",
    description: "Follow us on Twitter to earn 200 NUT points",
    channelUrl: "https://twitter.com/peysubz", // Replace with your Twitter profile URL
    points: 200,
  },
  {
    id: "likeTweet",
    description: "Like our pinned tweet to earn 100 NUT points",
    channelUrl:
      "https://x.com/peysubz/status/1833581877338509620", // Replace with your specific tweet URL
    points: 100,
  },
  {
    id: "retweetTweet",
    description: "Retweet our pinned tweet to earn 150 NUT points",
    channelUrl:
      "https://x.com/peysubz/status/1833581877338509620", // Replace with your specific tweet URL
    points: 150,
  },
];

const SocialTasks: React.FC<SocialTaskProps> = ({ onMenuClick }) => {
  const userChatId = useContext(ChatIdContext); // User's Telegram chat ID
  const [tasksState, setTasksState] = useState<Task[]>(
    predefinedTasks.map((task) => ({
      ...task,
      taskCompleted: false,
      hasJoined: false,
      canVerify: true,
      timer: 0,
      isLoading: false,
      type: task.id.startsWith("joinTelegram") || task.id.startsWith("joinAnotherChannel") ? "telegram" : "twitter",
    }))
  );

  // State to store Twitter username
  const [twitterUsername, setTwitterUsername] = useState<string>("");

  // Handle cooldown timers for all tasks
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    tasksState.forEach((task, index) => {
      if (task.timer > 0) {
        const timerId = setTimeout(() => {
          setTasksState((prev) => {
            const newTasks = [...prev];
            newTasks[index].timer -= 1;
            if (newTasks[index].timer === 0) {
              newTasks[index].canVerify = true;
            }
            return newTasks;
          });
        }, 1000);
        timers.push(timerId);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [tasksState]);

  // Check if the user has already completed any of the tasks
  useEffect(() => {
    const checkTaskCompletion = async () => {
      if (userChatId) {
        try {
          const userData = await getUserData(userChatId);
          setTasksState((prev) =>
            prev.map((task) => ({
              ...task,
              taskCompleted: userData?.completedTasks?.includes(task.id) || false,
            }))
          );
          if (userData?.twitterUsername) {
            setTwitterUsername(userData.twitterUsername);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkTaskCompletion();
  }, [userChatId]);

  // Handle the Join or Action button click for a specific task
  const handleAction = (index: number) => {
    const task = tasksState[index];
    window.open(task.channelUrl, "_blank");
    setTasksState((prev) => {
      const newTasks = [...prev];
      newTasks[index].hasJoined = true;
      return newTasks;
    });
  };

  // Handle the Verify button click for a specific task
  const handleVerify = async (index: number) => {
    const task = tasksState[index];
    if (!userChatId) {
      alert("User not authenticated.");
      return;
    }

    // For Twitter tasks, ensure twitterUsername is provided
    const payload: any = { chatId: userChatId, taskId: task.id };
    if (task.type === "twitter") {
      if (!twitterUsername.trim()) {
        alert("Please connect your Twitter account.");
        return;
      }
      payload.twitterUsername = twitterUsername.trim();
    }

    setTasksState((prev) => {
      const newTasks = [...prev];
      newTasks[index].isLoading = true;
      return newTasks;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/checkSubscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to verify subscription.");
      }

      const data = await response.json();

      if (task.type === "telegram" && data.isMember) {
        // Telegram verification successful
        setTasksState((prev) => {
          const newTasks = [...prev];
          newTasks[index].taskCompleted = true;
          return newTasks;
        });
        alert(`Subscription verified! You have earned ${task.points} NUT points.`);

        // Award points
        await updateUserTotalPoints(userChatId, task.points);

        // Update task completion status in Firebase
        await updateUserTaskCompletion(userChatId, task.id);
      } else if (task.type === "twitter" && data.isVerified) {
        // Twitter verification successful
        setTasksState((prev) => {
          const newTasks = [...prev];
          newTasks[index].taskCompleted = true;
          return newTasks;
        });
        alert(`Action verified! You have earned ${task.points} NUT points.`);

        // Award points
        await updateUserTotalPoints(userChatId, task.points);

        // Update task completion status in Firebase
        await updateUserTaskCompletion(userChatId, task.id);
      } else {
        // Verification failed
        if (task.type === "telegram") {
          alert("You are not a member of the channel.");
        } else if (task.type === "twitter") {
          alert("Verification failed. Please ensure you have completed the required actions on Twitter.");
        }
        setTasksState((prev) => {
          const newTasks = [...prev];
          newTasks[index].canVerify = false;
          newTasks[index].timer = 30; // Start 30-second cooldown
          return newTasks;
        });
      }
    } catch (error: any) {
      console.error("Error verifying subscription:", error.message || error);
      alert(
        "An error occurred during verification. Please ensure you have completed the actions and try again."
      );
    } finally {
      setTasksState((prev) => {
        const newTasks = [...prev];
        newTasks[index].isLoading = false;
        return newTasks;
      });
    }
  };

  const handleConnectTwitter = () => {
    // Redirect to your backend endpoint that initiates Twitter OAuth
    window.location.href = `${API_BASE_URL}/auth/twitter?chatId=${userChatId}`;
  };

  useEffect(() => {
    const fetchTwitterUsername = async () => {
      if (userChatId) {
        const response = await fetch(`${API_BASE_URL}/getTwitterUsername?chatId=${userChatId}`);
        if (response.ok) {
          const data = await response.json();
          setTwitterUsername(data.username);
        }
      }
    };
    fetchTwitterUsername();
  }, [userChatId]);

  return (
    <div className="social-tasks">
      <h2>Social Tasks</h2>

      {/* Twitter Authentication */}
      <div className="twitter-auth">
        {!twitterUsername ? (
          <button onClick={handleConnectTwitter}>Connect Twitter</button>
        ) : (
          <p>Connected as @{twitterUsername}</p>
        )}
      </div>

      <div className="tasks-container">
        {tasksState.map((task, index) => (
          <React.Fragment key={task.id}>
            <div className={`task ${task.type}`}>
              <div className="task-text">
                <p>{task.description}</p>
              </div>
              <div className="task-button">
                {task.taskCompleted ? (
                  <button className="completed-button" disabled>
                    Completed
                  </button>
                ) : task.hasJoined ? (
                  <button
                    className={`verify-button ${!task.canVerify ? "disabled" : ""}`}
                    onClick={() => handleVerify(index)}
                    disabled={!task.canVerify || task.isLoading}
                  >
                    {task.isLoading
                      ? "Verifying..."
                      : task.canVerify
                      ? "Verify"
                      : `Verify (${task.timer})`}
                  </button>
                ) : (
                  <button
                    className="join-button"
                    onClick={() => handleAction(index)}
                  >
                    {task.type === "twitter" ? "Perform Action" : "Join"}
                  </button>
                )}
              </div>
            </div>
            <div className="sep-line"></div>
          </React.Fragment>
        ))}
      </div>
      <Menu onMenuClick={onMenuClick} variant="social" />
    </div>
  );
};

export default SocialTasks;
