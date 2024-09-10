// gmStreakHandler.ts
import { updateUserGMStreak } from "../../client/firebaseFunctions";

export const handleGMClick = async (
  isGMChecked: boolean,
  setIsGMChecked: React.Dispatch<React.SetStateAction<boolean>>,
  gmStreak: number,
  setGMStreak: React.Dispatch<React.SetStateAction<number>>,
  userChatId: string | null
) => {
  const today = new Date().toDateString();
  const lastGMDate = localStorage.getItem("lastGMDate");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  if (!isGMChecked) {
    setIsGMChecked(true);
    localStorage.setItem("lastGMDate", today);

    let newStreak;
    if (lastGMDate === yesterdayString) {
      newStreak = gmStreak + 1;
      setGMStreak(newStreak);
      localStorage.setItem("gmStreak", newStreak.toString());
    } else {
      newStreak = 1;
      setGMStreak(1);
      localStorage.setItem("gmStreak", "1");
    }

    // Save GM streak to Firebase
    if (userChatId) {
      try {
        await updateUserGMStreak(userChatId, newStreak);
      } catch (error) {
        console.error("Error saving GM streak to Firebase:", error);
      }
    }
  }
};
