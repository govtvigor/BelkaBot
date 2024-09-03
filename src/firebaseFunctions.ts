// src/firebaseFunctions.ts
import { db, doc, setDoc, getDoc } from './firebase';
import { formatTonAddress } from './utils/convertAddress';

export async function saveUserToFirestore(walletAddress: string) {
  try {
    // Format the address to non-bounceable format
    const formattedAddress = formatTonAddress(walletAddress);

    const userRef = doc(db, 'users', formattedAddress);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      // If the user doesn't exist, create a new one
      await setDoc(userRef, {
        walletAddress: formattedAddress, // Use the formatted address for storage
        gmStreak: 0,
        lives: 3,
        totalPoints: 0
      });
      console.log('New user added to Firestore.');
    } else {
      console.log('User already exists in Firestore.');
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}
export const getUserFromFirestore = async (walletAddress: string) => {
    const userDoc = doc(db, 'users', walletAddress);
    const docSnap = await getDoc(userDoc);
  
    if (docSnap.exists()) {
      return docSnap.data(); // Возвращаем данные пользователя
    } else {
      console.log("Пользователь не найден!");
      return null;
    }
  };