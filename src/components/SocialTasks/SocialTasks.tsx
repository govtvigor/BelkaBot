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
}


const API_BASE_URL = "https://belka-bot.vercel.app/api"; // Ensure this points to your API

// Define your tasks here
const predefinedTasks: Omit<Task, "taskCompleted" | "hasJoined" | "canVerify" | "timer" | "isLoading">[] = [
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
  // Add more tasks here as needed
];

const SocialTasks: React.FC<SocialTaskProps> = ({ onMenuClick }) => {
  const userChatId = useContext(ChatIdContext); // User's Telegram chat ID
  const [tasksState, setTasksState] = useState<Task[]>(
    predefinedTasks.map(task => ({
      ...task,
      taskCompleted: false,
      hasJoined: false,
      canVerify: true,
      timer: 0,
      isLoading: false,
    }))
  );

  // Handle cooldown timers for all tasks
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    tasksState.forEach((task, index) => {
      if (task.timer > 0) {
        const timerId = setTimeout(() => {
          setTasksState(prev => {
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
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [tasksState]);

  // Check if the user has already completed any of the tasks
  useEffect(() => {
    const checkTaskCompletion = async () => {
      if (userChatId) {
        try {
          const userData = await getUserData(userChatId);
          setTasksState(prev =>
            prev.map(task => ({
              ...task,
              taskCompleted: userData?.completedTasks?.includes(task.id) || false,
            }))
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkTaskCompletion();
  }, [userChatId]);

  // Handle the Join button click for a specific task
  const handleJoin = (index: number) => {
    const task = tasksState[index];
    window.open(task.channelUrl, "_blank");
    setTasksState(prev => {
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

    setTasksState(prev => {
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
        body: JSON.stringify({ chatId: userChatId, taskId: task.id }),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to verify subscription.");
      }

      const data = await response.json();

      if (data.isMember) {
        setTasksState(prev => {
          const newTasks = [...prev];
          newTasks[index].taskCompleted = true;
          return newTasks;
        });
        alert(`Subscription verified! You have earned ${task.points} NUT points.`);

        // Award points
        await updateUserTotalPoints(userChatId, task.points);

        // Update task completion status in Firebase
        await updateUserTaskCompletion(userChatId, task.id);
      } else {
        alert("You are not a member of the channel.");
        setTasksState(prev => {
          const newTasks = [...prev];
          newTasks[index].canVerify = false;
          newTasks[index].timer = 30; // Start 30-second cooldown
          return newTasks;
        });
      }
    } catch (error: any) {
      console.error("Error verifying subscription:", error.message || error);
      alert(
        "An error occurred during verification. Please ensure you have joined the channel and try again."
      );
    } finally {
      setTasksState(prev => {
        const newTasks = [...prev];
        newTasks[index].isLoading = false;
        return newTasks;
      });
    }
  };

  return (
    <div className="social-tasks">
      <h2>Social Tasks</h2>
      <div className="tasks-container">
        {tasksState.map((task, index) => (
          <>
          <div className="task" key={task.id}>
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
                <button className="join-button" onClick={() => handleJoin(index)}>
                  Join
                </button>
              )}
            </div>
            
          </div>
          <div className="sep-line"></div>
          </>
          
        ))}
      </div>
      <Menu onMenuClick={onMenuClick} variant="social" />
    </div>
  );
};

export default SocialTasks;
