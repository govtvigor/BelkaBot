// src/components/SocialTasks/SocialTasks.tsx

import React, { useState, useEffect, useContext } from "react";
import "./socialTasks.scss";
import { ChatIdContext } from "../../client/App";
import Menu from "../../components/Menu/Menu";
import { useTranslation } from 'react-i18next';
import {
  getUserData,
  updateUserTotalPoints,
  updateUserTaskCompletion,
} from "../../client/firebaseFunctions";
import mainChannelIcon from '../../assets/mainChannelAvatar.jpg';
import secondChannelIcon from '../../assets/secondChannelAvatar.jpg';

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
  imageUrl?: string; 
  timerEnd?: number; // Remains number | undefined
}

const API_BASE_URL = "https://belka-bot.vercel.app/api"; 

const LOCAL_STORAGE_KEY = "socialTasksTimers";

const saveTimerEndToLocalStorage = (taskId: string, timerEnd: number) => {
  const timers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
  timers[taskId] = timerEnd;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timers));
};

const loadTimerEndFromLocalStorage = (taskId: string): number | undefined => {
  const timers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
  return timers[taskId] ?? undefined; // Return undefined instead of null
};

const removeTimerEndFromLocalStorage = (taskId: string) => {
  const timers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
  delete timers[taskId];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timers));
};

const predefinedTasks: Omit<
  Task,
  "taskCompleted" | "hasJoined" | "canVerify" | "timer" | "isLoading" | "type" | "timerEnd"
>[] = [
  {
    id: "joinTelegramChannel",
    description: "tasks.main_task",
    channelUrl: "https://t.me/squirreala",
    points: 500,
    imageUrl: mainChannelIcon, 
  },
  {
    id: "joinAnotherChannel",
    description: "tasks.second_task",
    channelUrl: "https://t.me/avcryptoo",
    points: 300,
    imageUrl: secondChannelIcon, 
  },
  // Twitter Tasks
  {
    id: "followTwitter",
    description: "tasks.twitter_follow",
    channelUrl: "https://twitter.com/peysubz",
    points: 200,
  },
  {
    id: "likeTweet",
    description: "tasks.twitter_like",
    channelUrl:
      "https://x.com/peysubz/status/1833581877338509620",
    points: 100,
  },
  {
    id: "retweetTweet",
    description: "tasks.twitter_repost",
    channelUrl:
      "https://x.com/peysubz/status/1833581877338509620",
    points: 150,
  },
];

const SocialTasks: React.FC<SocialTaskProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const userChatId = useContext(ChatIdContext); // User's Telegram chat ID

  const [tasksState, setTasksState] = useState<Task[]>(() =>
    predefinedTasks.map((task) => {
      const type: "telegram" | "twitter" =
        task.id.startsWith("joinTelegram") || task.id.startsWith("joinAnotherChannel")
          ? "telegram"
          : "twitter";
      const timerEnd = loadTimerEndFromLocalStorage(task.id);
      let timer = 0;
      let canVerify = false;
      if (timerEnd && timerEnd > Date.now()) {
        timer = Math.floor((timerEnd - Date.now()) / 1000);
        canVerify = true;
      }
      return {
        ...task,
        taskCompleted: false,
        hasJoined: false,
        canVerify: timer > 0 ? true : false,
        timer: timer,
        isLoading: false,
        type,
        timerEnd: timer > 0 && timerEnd !== undefined ? timerEnd : undefined, // Ensure timerEnd is number or undefined
      };
    })
  );

  // Effect to handle the countdown timer for tasks
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTasksState((prevTasks) =>
        prevTasks.map((task) => {
          if (task.timer > 0) {
            const newTimer = task.timer - 1;
            if (newTimer <= 0) {
              // Timer finished
              removeTimerEndFromLocalStorage(task.id);
              return {
                ...task,
                timer: 0,
                canVerify: true,
                timerEnd: undefined,
              };
            }
            return {
              ...task,
              timer: newTimer,
              // canVerify remains true once timer starts
            };
          }
          return task;
        })
      );
    }, 1000); 

    return () => clearInterval(timerInterval);
  }, []);

  // Load user data and update taskCompleted and hasJoined
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

  // Handle the Join or Action button click for a specific task
  const handleAction = async (index: number) => {
    const task = tasksState[index];

    window.open(task.channelUrl, "_blank");
    setTasksState((prev) => {
      const newTasks = [...prev];
      newTasks[index].hasJoined = true;
      newTasks[index].canVerify = true;
      return newTasks;
    });
  };

  // Handle the Verify button click for a specific task
  const handleVerify = async (index: number) => {
    const task = tasksState[index];
    if (!userChatId) {
      alert(t('tasks.error_user_not_authenticated') || "User not authenticated.");
      return;
    }

    setTasksState((prev) => {
      const newTasks = [...prev];
      newTasks[index].isLoading = true;
      return newTasks;
    });

    setTimeout(async () => {
      try {
        if (task.type === "telegram") {
          const response = await fetch(`${API_BASE_URL}/checkSubscription`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ chatId: userChatId, taskId: task.id }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || t('tasks.error_verifying_subscription') || "Failed to verify subscription.");
          }

          const data = await response.json();
          if (data.isMember) {
            setTasksState((prev) => {
              const newTasks = [...prev];
              newTasks[index].taskCompleted = true;
              return newTasks;
            });

            await updateUserTotalPoints(userChatId, task.points);
            await updateUserTaskCompletion(userChatId, task.id);
            alert(t('tasks.subscription_verified', { points: task.points }) || `Subscription verified! You have earned ${task.points} NUT points.`);
          } else {
            alert(t('tasks.not_a_member') || "You are not a member of the channel.");
            const timerEnd = Date.now() + 30000; // 30-second timer
            setTasksState((prev) => {
              const newTasks = [...prev];
              newTasks[index].canVerify = false;
              newTasks[index].timer = 30; // Start at 30 seconds
              newTasks[index].timerEnd = timerEnd; // Set timerEnd
              // Save timerEnd to localStorage
              saveTimerEndToLocalStorage(task.id, timerEnd);
              return newTasks;
            });
          }
        } else if (task.type === "twitter") {
          setTasksState((prev) => {
            const newTasks = [...prev];
            newTasks[index].taskCompleted = true;
            newTasks[index].isLoading = false;
            return newTasks;
          });

          await updateUserTotalPoints(userChatId, task.points);
          await updateUserTaskCompletion(userChatId, task.id);
          alert(t('tasks.points_earned', { points: task.points }) || `You have earned ${task.points} NUT points!`);
        }
      } catch (error) {
        console.error("Error verifying task:", error);
        alert(t('tasks.error_occurred') || "An error occurred. Please try again.");
      } finally {
        setTasksState((prev) => {
          const newTasks = [...prev];
          newTasks[index].isLoading = false;
          return newTasks;
        });
      }
    }, 5000); // 5-second delay for verification
  };

  return (
    <div className="social-tasks">
      <h2>{t('tasks.social_tasks')}</h2>
      <div className="tasks-container">
        {tasksState.map((task, index) => (
          <React.Fragment key={task.id}>
            <div className={`task ${task.type}`}>
              <div className="task-text">
                <p>{t(task.description)}</p>
                {/* Only show image if task is of type telegram and has an imageUrl */}
              </div>
              <div className="task-image-block">
                {task.type === "telegram" && task.imageUrl && (
                  <img src={task.imageUrl} alt={t('tasks.task_channel_image_alt') || "Task Channel"} className="task-image" />
                )}
              </div>
              <div className="task-button">
                {task.taskCompleted ? (
                  <button className="completed-button" disabled>
                    {t('tasks.completed')}
                  </button>
                ) : task.hasJoined ? (
                  <button
                    className={`verify-button ${!task.canVerify ? "disabled" : ""}`}
                    onClick={() => handleVerify(index)}
                    disabled={!task.canVerify || task.isLoading}
                  >
                    {task.isLoading
                      ? t('tasks.verifying')
                      : task.canVerify
                      ? t('tasks.verify')
                      : ` (${task.timer})`} {/* Display remaining timer */}
                  </button>
                ) : (
                  <button className="join-button" onClick={() => handleAction(index)}>
                    {task.type === "telegram"
                      ? t('tasks.join')
                      : task.id === "followTwitter"
                      ? t('tasks.follow')
                      : task.id === "likeTweet"
                      ? t('tasks.like')
                      : t('tasks.retweet')}
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
