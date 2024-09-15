// gmStreakHandler.ts
import { updateUserGMStreak, getUserGMData } from "../../client/firebaseFunctions";

export const handleGMClick = async (
  isGMChecked: boolean,
  setIsGMChecked: React.Dispatch<React.SetStateAction<boolean>>,
  gmStreak: number,
  setGMStreak: React.Dispatch<React.SetStateAction<number>>,
  userChatId: string | null
) => {
  if (isGMChecked) {
    alert("You have already checked in today!");
    return;
  }

  if (userChatId) {
    try {
      const gmData = await getUserGMData(userChatId);
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newStreak = 1;
      if (gmData.lastGMDate === yesterdayString) {
        newStreak = gmData.gmStreak + 1;
      }

      await updateUserGMStreak(userChatId, newStreak);
      setGMStreak(newStreak);
      setIsGMChecked(true);
    } catch (error) {
      console.error("Error updating GM streak:", error);
    }
  }
};