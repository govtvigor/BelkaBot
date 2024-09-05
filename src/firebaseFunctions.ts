import { db, doc, setDoc, getDoc } from './firebase'; // Ensure ./firebase exports initialized Firestore (db)
import { formatTonAddress } from './utils/convertAddress';

export async function saveUserToFirestore(walletAddress: string, chatId: string | null = null) {
  try {
    const formattedAddress = formatTonAddress(walletAddress);
    const userRef = doc(db, 'users', formattedAddress);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      // Создаем новый документ, если пользователя нет
      await setDoc(userRef, {
        walletAddress: formattedAddress,
        gmStreak: 0,
        lives: 3,
        totalPoints: 0,
        chatId, // Сохраняем chatId сразу при создании
      });
      console.log('New user added to Firestore.');
    } else {
      console.log('User already exists in Firestore.');
      
      // Обновляем chatId, если он изменился
      if (chatId && userSnapshot.data().chatId !== chatId) {
        await setDoc(userRef, { chatId }, { merge: true });
        console.log('User chatId updated in Firestore.');
      }
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}


export const getUserFromFirestore = async (walletAddress: string) => {
  const userDoc = doc(db, 'users', walletAddress);
  const docSnap = await getDoc(userDoc);

  if (docSnap.exists()) {
    return docSnap.data(); // Return user data
  } else {
    console.log("User not found!");
    return null;
  }
};

// Modified function to get the chat ID
export const getChatIdFromApi = async (walletAddress: string): Promise<string | null> => {
  try {
    const formattedAddress = formatTonAddress(walletAddress); // Форматируем адрес
    const userDoc = doc(db, 'users', formattedAddress);  // Ссылка на документ пользователя
    const docSnap = await getDoc(userDoc); // Получаем снимок документа

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data?.chatId || null; // Возвращаем 'chatId' или null, если он отсутствует
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching chat ID:', error);
    return null;
  }
};


