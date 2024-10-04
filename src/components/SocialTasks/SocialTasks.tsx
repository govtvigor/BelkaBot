// src/components/SocialTasks/SocialTasks.tsx

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
      type:
        task.id.startsWith("joinTelegram") || task.id.startsWith("joinAnotherChannel")
          ? "telegram"
          : "twitter",
    }))
  );

  // Remove Twitter-related state
  // const [twitterUsername, setTwitterUsername] = useState<string>("");

  useEffect(() => {
    const checkTaskCompletion = async () => {
      if (userChatId) {
        try {
          const userData = await getUserData(userChatId);
          setTasksState((prev) =>
            prev.map((task) => ({
              ...task,
              taskCompleted: userData?.completedTasks?.includes(task.id) || false,
              hasJoined:
                task.type === "telegram"
                  ? userData?.joinedChannels?.includes(task.id) || false
                  : false,
            }))
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkTaskCompletion();
  }, [userChatId]);

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

  // Handle the Join or Perform Action button click for a specific task
  const handleAction = async (index: number) => {
    const task = tasksState[index];

    if (task.type === "telegram") {
      // Handle Telegram tasks
      window.open(task.channelUrl, "_blank");
      setTasksState((prev) => {
        const newTasks = [...prev];
        newTasks[index].hasJoined = true;
        return newTasks;
      });
      // Optionally, award points immediately or wait for user confirmation
    } else if (task.type === "twitter") {
      // Handle Twitter tasks
      if (!userChatId) {
        alert("User chat ID is missing. Please authenticate again.");
        return;
      }

      // Perform the action: Redirect to Twitter channel
      window.open(task.channelUrl, "_blank");

      // Inform the user
     
      setTasksState((prev) => {
        const newTasks = [...prev];
        newTasks[index].isLoading = true;
        return newTasks;
      });

      setTimeout(async () => {
        try {
          // Mark the task as completed
          setTasksState((prev) => {
            const newTasks = [...prev];
            newTasks[index].taskCompleted = true;
            newTasks[index].isLoading = false;
            return newTasks;
          });

          // Award points
          await updateUserTotalPoints(userChatId, task.points);

          // Update task completion status in Firebase
          await updateUserTaskCompletion(userChatId, task.id);

          alert(`You have earned ${task.points} NUT points for completing the task!`);
        } catch (error) {
          console.error("Error awarding points:", error);
          alert("An error occurred while awarding points. Please try again.");
          setTasksState((prev) => {
            const newTasks = [...prev];
            newTasks[index].isLoading = false;
            return newTasks;
          });
        }
      }, 10000); // 10 seconds
    }
  };

  return (
    <div className="social-tasks">
      <h2>Social Tasks</h2>

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
                ) : task.type === "telegram" && task.hasJoined ? (
                  <button className="joined-button" disabled>
                    Joined
                  </button>
                ) : task.type === "twitter" && task.isLoading ? (
                  <button className="loading-button" disabled>
                    Processing...
                  </button>
                ) : (
                  <button
                    className={`action-button ${
                      task.isLoading ? "disabled" : ""
                    }`}
                    onClick={() => handleAction(index)}
                    disabled={task.isLoading}
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
