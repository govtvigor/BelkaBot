import { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from './firebase';
import { formatTonAddress } from '../utils/convertAddress';
import { increment } from 'firebase/firestore';


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
        walletAddress: null 
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
export const getUserLives = async (chatId: string): Promise<number | undefined> => {
  try {
    const userRef = doc(db, "users", chatId);  // Assuming "users" is the collection name and `chatId` is the document ID
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.lives || 0;  // Return lives, default to 0 if lives doesn't exist
    } else {
      console.log("No such document!");
      return undefined;
    }
  } catch (error) {
    console.error("Error getting user lives from Firebase:", error);
    throw error;
  }
};
export const updateUserLives = async (chatId: string, newLives: number): Promise<void> => {
  if (typeof chatId !== 'string' || chatId.trim() === '') {
    throw new Error("Invalid chatId passed to updateUserLives");
  }

  try {
    const userRef = doc(db, "users", chatId);  // Ensure "users" is the collection and chatId is the document ID
    await updateDoc(userRef, {
      lives: newLives  // Update the lives field
    });
    console.log(`Updated lives for user ${chatId} to ${newLives}`);
  } catch (error) {
    console.error("Error updating user lives in Firebase:", error);
    throw error;
  }
};
export const updateUserGMStreak = async (chatId: string, gmStreak: number): Promise<void> => {
  try {
    const userRef = doc(db, "users", chatId);  // Reference to the user document
    await updateDoc(userRef, {
      gmStreak: gmStreak  // Update the gmStreak field
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

