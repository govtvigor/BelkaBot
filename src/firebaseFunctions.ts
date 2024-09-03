// src/firebaseFunctions.ts
import { db, doc, setDoc, getDoc } from './firebase';

export async function saveUserToFirestore(walletAddress: string) {
  try {
    const userRef = doc(db, 'users', walletAddress);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      // Если пользователь не существует, создаем нового
      await setDoc(userRef, {
        walletAddress: walletAddress.toString(),
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