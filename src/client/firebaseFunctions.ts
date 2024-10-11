// /client/firebaseFunctions.ts

import { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from './firebase';
import { formatTonAddress } from '../utils/convertAddress';
import { increment, arrayUnion, orderBy, deleteDoc, Timestamp, addDoc, writeBatch } from 'firebase/firestore';

export interface LeaderboardEntry {
  chatId: string;     
  totalPoints: number;
}

export interface ReferralUser {
  username: string;
  pointsEarned: number;
}

export const saveUserBet = async (
  chatId: string,
  storyId: string,
  selectedOption: string,
  betAmount: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', chatId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User does not exist');
    }

    const userData = userSnap.data();
    const currentPoints = userData.totalPoints || 0;

    if (currentPoints < betAmount) {
      throw new Error('Insufficient points to place bet');
    }

    // Deduct the bet amount from the user's totalPoints
    await updateDoc(userRef, {
      totalPoints: increment(-betAmount),
    });

    const betsCollection = collection(db, 'storyBets');
    await addDoc(betsCollection, {
      chatId,
      storyId,
      selectedOption,
      betAmount,
      processed: false,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving user bet:', error);
    throw error;
  }
};
export const getUserBet = async (chatId: string, storyId: string): Promise<any> => {
  try {
    const betsCollection = collection(db, 'storyBets');
    const betsQuery = query(
      betsCollection,
      where('chatId', '==', chatId),
      where('storyId', '==', storyId)
    );

    const betsSnapshot = await getDocs(betsQuery);

    if (!betsSnapshot.empty) {
      return betsSnapshot.docs[0].data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user bet:', error);
    throw error;
  }
};
export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('totalPoints', 'desc')); // No limit to fetch all users
    const querySnapshot = await getDocs(q);
    const leaderboard: LeaderboardEntry[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      leaderboard.push({
        chatId: docSnapshot.id,        // Use document ID as chatId
        totalPoints: data.totalPoints || 0,
      });
    });

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
};

export const getActiveStory = async (): Promise<any> => {
  try {
    const storiesCollection = collection(db, 'stories');
    const storyQuery = query(
      storiesCollection,
      where('isActive', '==', true)
    );

    const storiesSnapshot = await getDocs(storyQuery);

    if (!storiesSnapshot.empty) {
      const storyDoc = storiesSnapshot.docs[0];
      return { id: storyDoc.id, ...storyDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching active story:', error);
    throw error;
  }
};
export const processStoryBets = async (storyId: string): Promise<void> => {
  try {
    // Fetch the story to get the correctOption
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);

    if (!storySnap.exists()) {
      throw new Error('Story does not exist');
    }

    const storyData = storySnap.data();
    const correctOption = storyData.correctOption;

    if (!correctOption) {
      throw new Error('Story correctOption is not set');
    }

    // Fetch all unprocessed bets for this story
    const betsCollection = collection(db, 'storyBets');
    const betsQuery = query(
      betsCollection,
      where('storyId', '==', storyId),
      where('processed', '==', false)
    );

    const betsSnapshot = await getDocs(betsQuery);

    // Process each bet using writeBatch
    const batch = writeBatch(db); // Use writeBatch instead of db.batch()

    betsSnapshot.forEach((betDoc) => {
      const betData = betDoc.data();
      const userRef = doc(db, 'users', betData.chatId);

      if (betData.selectedOption === correctOption) {
        // User wins, award 2x bet amount
        batch.update(userRef, {
          totalPoints: increment(betData.betAmount * 2),
        });
      }

      // Mark the bet as processed
      batch.update(betDoc.ref, {
        processed: true,
      });
    });

    // Commit the batch
    await batch.commit();

    // Mark the story as processed
    await updateDoc(storyRef, {
      processed: true,
    });

  } catch (error) {
    console.error('Error processing story bets:', error);
    throw error;
  }
};
export const getUserLanguage = async (chatId: string): Promise<string> => {
  try {
    const userRef = doc(db, 'users', chatId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.languageCode || 'en'; // Return user's language or default to English
    } else {
      console.log("No such document for user:", chatId);
      return 'en'; // Default to English if no data found
    }
  } catch (error) {
    console.error('Error fetching user language from Firebase:', error);
    return 'en'; // Default to English if there's an error
  }
};

export async function saveUserByChatId(chatId: string, referrerId?: string, username?: string, languageCode?: string) {
  try {
      const userRef = doc(db, 'users', chatId);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
          const userData: any = {
              chatId: chatId,
              gmStreak: 0,
              lives: 3,
              totalPoints: 0,
              username: username || '',
              referralPoints: 0,
              referredBy: referrerId || null, 
              referrals: [],
              referredUsers: {},
              walletAddress: null,
              gamesPlayed: 0,
              highestScore: 0,
              achievements: [],
              completedTasks: [],
              languageCode: languageCode || 'en',
              tutorialCompleted: false, 
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

          // Optionally, update the languageCode if it's different
          const existingData = userSnapshot.data();
          if (languageCode && existingData.languageCode !== languageCode) {
              await updateDoc(userRef, { languageCode });
              console.log(`Updated languageCode for user ${chatId} to ${languageCode}`);
          }
      }
  } catch (error) {
      console.error('Error saving user by chatId:', error);
  }
}
export const updateUserTutorialCompleted = async (
  chatId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', chatId);
    await updateDoc(userRef, {
      tutorialCompleted: true,
    });
    console.log(`Tutorial completed for user ${chatId}`);
  } catch (error) {
    console.error('Error updating tutorialCompleted:', error);
    throw error;
  }
};



// Update user data
export const updateUserData = async (
  chatId: string,
  data: Partial<any>
): Promise<void> => {
  await updateDoc(doc(db, "users", chatId), data);
};

// Update task completion status
export const updateUserTaskCompletion = async (
  chatId: string,
  taskId: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", chatId);
    await updateDoc(userRef, {
      completedTasks: arrayUnion(taskId),
    });
  } catch (error) {
    console.error(`Error updating task completion for user '${chatId}':`, error);
    throw error;
  }
};

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
  const botUsername = 'squirrelapp_bot'; 

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

      if (data?.referredUsers) {
        const referredUsersData = data.referredUsers; 

        for (const referredUserId in referredUsersData) {
          const bonusPoints = referredUsersData[referredUserId];

          const referredUserRef = doc(db, 'users', referredUserId);
          const referredUserSnap = await getDoc(referredUserRef);

          let username = 'Unknown';
          if (referredUserSnap.exists()) {
            const referredUserData = referredUserSnap.data();
            username = referredUserData?.username || 'Unknown';
          }

          referredUsers.push({
            username,
            pointsEarned: bonusPoints,
          });
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
  } catch (error) {
    console.error('Error updating user lives in Firebase:', error);
    throw error;
  }
};





export const updateUserLivesAndLastResetDate = async (
  chatId: string,
  newLives: number | undefined,
  lastLivesResetDate: string
): Promise<void> => {
  if (typeof chatId !== "string" || chatId.trim() === "") {
    throw new Error("Invalid chatId passed to updateUserLivesAndLastResetDate");
  }

  try {
    const userRef = doc(db, "users", chatId);
    const updateData: any = {
      lastLivesResetDate: lastLivesResetDate,
    };
    if (newLives !== undefined) {
      updateData.lives = newLives;
    }
    await updateDoc(userRef, updateData);
    console.log(
      `Updated lastLivesResetDate for user ${chatId} to ${lastLivesResetDate}` +
      (newLives !== undefined ? ` and lives to ${newLives}` : '')
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
      const bonusPoints = Math.round(pointsToAdd * 0.2); // Use Math.round instead of Math.floor
    
      const referrerRef = doc(db, "users", referrerId);
      await updateDoc(referrerRef, {
        referralPoints: increment(bonusPoints),
        [`referredUsers.${chatId}`]: increment(bonusPoints),
      });
    
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
