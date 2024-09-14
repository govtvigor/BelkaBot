import { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from './firebase';
import { formatTonAddress } from '../utils/convertAddress';
import { increment, arrayUnion } from 'firebase/firestore';


export async function saveUserByChatId(chatId: string) {
  try {
    const userRef = doc(db, 'users', chatId); 
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        chatId: chatId,
        gmStreak: 0,
        lives: 3,
        totalPoints: 0,
        walletAddress: null,
        gamesPlayed: 0,      // Added default value
        highestScore: 0,     // Added default value
        achievements: [],    // Added default value
      });
      console.log('New user added with chatId:', chatId);
    } else {
      console.log('User already exists with chatId:', chatId);
    }
  } catch (error) {
    console.error('Error saving user by chatId:', error);
  }
}



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

  await updateDoc(userRef, {
    totalPoints: increment(pointsToAdd),
  });
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
