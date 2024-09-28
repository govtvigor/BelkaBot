// firebaseFunctions.ts

import { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from './firebase';
import { formatTonAddress } from '../utils/convertAddress';
import { increment, arrayUnion, orderBy, limit } from 'firebase/firestore';

export interface LeaderboardEntry {
  walletAddress: string;
  totalPoints: number;
}

export interface ReferralUser {
  username: string;
  pointsEarned: number;
}

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('totalPoints', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    const leaderboard: LeaderboardEntry[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      leaderboard.push({
        walletAddress: data.walletAddress || 'Unknown',
        totalPoints: data.totalPoints || 0,
      });
    });

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
};

export async function saveUserByChatId(chatId: string, referrerId?: string) {
  try {
      const userRef = doc(db, 'users', chatId);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
          const userData: any = {
              chatId: chatId,
              gmStreak: 0,
              lives: 3,
              totalPoints: 0,
              referralPoints: 0,
              referredBy: referrerId || null, // Set referredBy correctly
              referrals: [],
              referredUsers: {},
              walletAddress: null,
              gamesPlayed: 0,
              highestScore: 0,
              achievements: [],
          };
          await setDoc(userRef, userData);
          console.log('New user added with chatId:', chatId);

          if (referrerId && referrerId !== chatId) { // Prevent self-referral
              const referrerRef = doc(db, 'users', referrerId);
              const referrerSnap = await getDoc(referrerRef);
              if (referrerSnap.exists()) {
                  await updateDoc(referrerRef, {
                      referrals: arrayUnion(chatId),
                  });
                  console.log(`User ${chatId} referred by ${referrerId}`);
              } else {
                  console.log(`Referrer with chatId ${referrerId} does not exist.`);
              }
          }
      } else {
          console.log('User already exists with chatId:', chatId);
      }
  } catch (error) {
      console.error('Error saving user by chatId:', error);
  }
}

// firebaseFunctions.ts

const base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const encodeBase62 = (num: number): string => {
  if (num === 0) return '0';
  let str = '';
  while (num > 0) {
    str = base62Chars[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str;
};

export const getReferralLink = (userChatId: string): string => {
  const botUsername = 'squirrelapp_bot'; // Replace with your bot's username

  if (!botUsername) {
    console.error("Telegram bot username is not defined.");
    return "";
  }

  const chatIdNumber = parseInt(userChatId, 10);
  const referralCode = isNaN(chatIdNumber) ? userChatId : encodeBase62(chatIdNumber);

  return `https://t.me/${botUsername}?start=${referralCode}`;
};


export const getReferralData = async (userChatId: string): Promise<{
  totalReferrals: number;
  totalReferralPoints: number;
  referredUsers: ReferralUser[];
}> => {
  try {
    const userRef = doc(db, 'users', userChatId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const totalReferrals = data?.referrals?.length || 0;
      const totalReferralPoints = data?.referralPoints || 0;

      const referredUsers: ReferralUser[] = [];

      if (data?.referrals && data.referrals.length > 0) {
        for (const referredUserId of data.referrals) {
          const referredUserRef = doc(db, 'users', referredUserId);
          const referredUserSnap = await getDoc(referredUserRef);

          if (referredUserSnap.exists()) {
            const referredUserData = referredUserSnap.data();
            referredUsers.push({
              username: referredUserData?.username || 'Unknown',
              pointsEarned: referredUserData?.pointsEarnedForReferrer || 0,
            });
          }
        }
      }

      return {
        totalReferrals,
        totalReferralPoints,
        referredUsers,
      };
    } else {
      return {
        totalReferrals: 0,
        totalReferralPoints: 0,
        referredUsers: [],
      };
    }
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return {
      totalReferrals: 0,
      totalReferralPoints: 0,
      referredUsers: [],
    };
  }
};

export async function updateUserWallet(chatId: string | null, walletAddress: string) {
  if (!chatId) {
    console.error("Chat ID отсутствует.");
    return;
  }

  if (!walletAddress) {
    console.error("Адрес кошелька отсутствует.");
    return;
  }

  try {
    const userRef = doc(db, 'users', chatId);
    await updateDoc(userRef, {
      walletAddress: formatTonAddress(walletAddress)
    });
    console.log('Кошелек успешно обновлен для chatId:', chatId);
  } catch (error) {
    console.error('Ошибка при обновлении данных пользователя:', error);
  }
}

export const getChatIdFromApi = async (walletAddress: string): Promise<string | null> => {
  try {
    const formattedAddress = formatTonAddress(walletAddress);
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('walletAddress', '==', formattedAddress));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      return data.chatId || null;
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching chat ID:', error);
    return null;
  }
};

export const getUserLivesData = async (chatId: string): Promise<{ lives: number; lastLivesResetDate: string }> => {
  try {
    const userRef = doc(db, "users", chatId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        lives: data.lives || 0,
        lastLivesResetDate: data.lastLivesResetDate || "",
      };
    } else {
      console.log("No such document!");
      return {
        lives: 0,
        lastLivesResetDate: "",
      };
    }
  } catch (error) {
    console.error("Error getting user lives data from Firebase:", error);
    throw error;
  }
};

export const updateUserLives = async (chatId: string, newLives: number): Promise<void> => {
  if (typeof chatId !== 'string' || chatId.trim() === '') {
    throw new Error('Invalid chatId passed to updateUserLives');
  }

  try {
    const userRef = doc(db, 'users', chatId);
    await updateDoc(userRef, {
      lives: newLives,
    });
    console.log(`Updated lives for user ${chatId} to ${newLives}`);
  } catch (error) {
    console.error('Error updating user lives in Firebase:', error);
    throw error;
  }
};

export const updateUserLivesAndLastResetDate = async (
  chatId: string,
  newLives: number,
  lastLivesResetDate: string
): Promise<void> => {
  if (typeof chatId !== "string" || chatId.trim() === "") {
    throw new Error("Invalid chatId passed to updateUserLivesAndLastResetDate");
  }

  try {
    const userRef = doc(db, "users", chatId);
    await updateDoc(userRef, {
      lives: newLives,
      lastLivesResetDate: lastLivesResetDate,
    });
    console.log(
      `Updated lives for user ${chatId} to ${newLives} and lastLivesResetDate to ${lastLivesResetDate}`
    );
  } catch (error) {
    console.error("Error updating user lives and last reset date in Firebase:", error);
    throw error;
  }
};

export const getUserGMData = async (chatId: string): Promise<{ gmStreak: number; lastGMDate: string }> => {
  const userRef = doc(db, "users", chatId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      gmStreak: data.gmStreak || 0,
      lastGMDate: data.lastGMDate || "",
    };
  } else {
    return {
      gmStreak: 0,
      lastGMDate: "",
    };
  }
};

export const updateUserGMStreak = async (chatId: string, gmStreak: number): Promise<void> => {
  try {
    const userRef = doc(db, "users", chatId);
    const today = new Date().toDateString();
    await updateDoc(userRef, {
      gmStreak: gmStreak,
      lastGMDate: today,
    });
    console.log(`Updated GM streak for user ${chatId} to ${gmStreak}`);
  } catch (error) {
    console.error("Error updating GM streak in Firebase:", error);
    throw error;
  }
};

export const updateUserTotalPoints = async (chatId: string, pointsToAdd: number): Promise<void> => {
  if (!chatId) throw new Error("Invalid chatId");
  const userRef = doc(db, "users", chatId);

  try {
    await updateDoc(userRef, {
      totalPoints: increment(pointsToAdd),
    });

    // Fetch user data to check for referrer
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error("User does not exist:", chatId);
      return;
    }

    const userData = userSnap.data();
    const referrerId = userData?.referredBy;

    if (referrerId && referrerId !== chatId) { // Prevent self-referral
      const bonusPoints = Math.floor(pointsToAdd * 0.2); // 20% bonus

      const referrerRef = doc(db, "users", referrerId);
      await updateDoc(referrerRef, {
        referralPoints: increment(bonusPoints),
        [`referredUsers.${chatId}`]: increment(bonusPoints),
      });

      console.log(`Awarded ${bonusPoints} points to referrer ${referrerId}`);
    }
  } catch (error) {
    console.error("Error updating user total points:", error);
    throw error;
  }
};

export const getUserTotalPoints = async (chatId: string): Promise<number> => {
  const userRef = doc(db, "users", chatId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.totalPoints || 0;
  } else {
    return 0;
  }
};

export const updateUserGameStats = async (chatId: string, score: number): Promise<void> => {
  if (!chatId) throw new Error("Invalid chatId");
  const userRef = doc(db, "users", chatId);

  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    // If user doesn't exist, initialize the necessary fields
    await setDoc(userRef, {
      chatId,
      gamesPlayed: 1,
      highestScore: score,
      achievements: [],
      // Initialize other fields as needed
    });
    return;
  }

  const userData = userSnap.data();

  const newHighestScore = Math.max(userData.highestScore || 0, score);

  await updateDoc(userRef, {
    gamesPlayed: increment(1),
    highestScore: newHighestScore,
  });
};

export const getUserData = async (chatId: string): Promise<any> => {
  const userRef = doc(db, "users", chatId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    return null;
  }
};

export const updateUserAchievements = async (chatId: string, newAchievements: string[]): Promise<void> => {
  const userRef = doc(db, "users", chatId);

  await updateDoc(userRef, {
    achievements: arrayUnion(...newAchievements),
  });
};

export const getUserAchievements = async (chatId: string): Promise<string[]> => {
  const userRef = doc(db, "users", chatId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.achievements || [];
  } else {
    return [];
  }
};