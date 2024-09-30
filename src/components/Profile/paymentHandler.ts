// paymentHandler.ts
import { updateUserLives } from "../../client/firebaseFunctions";

export const handleBuyLives = async (
  stars: number,
  lives: number,
  setLives: React.Dispatch<React.SetStateAction<number>>,
  userChatId: string | null
) => {
  const livesCost = 1; // Cost per life in stars

  if (stars >= livesCost) {
    try {
      if (!userChatId) {
        alert("Error: Chat ID is missing. Please try again.");
        return;
      }

      // Define your API base URL
      const API_BASE_URL = "https://belka-bot.vercel.app"; // Replace with your actual deployed URL

      // Make a POST request to the create-invoice serverless function
      const response = await fetch(`${API_BASE_URL}/api/create-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: userChatId,
          title: "Extra Life",
          description: "Purchase an additional life",
          amount: livesCost,
        }),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create invoice.");
      }

      const data = await response.json();
      const invoiceLink = data.invoiceLink;

      // Ensure Telegram WebApp is ready
      window.Telegram.WebApp.ready();

      // Open the invoice in Telegram
      window.Telegram.WebApp.openInvoice(invoiceLink, async (invoiceStatus) => {
        if (invoiceStatus === "paid") {
          alert("Star Payment Success!");

          const newLives = lives + 3; // Award 3 extra lives
          setLives(newLives);

          // Update lives in Firebase
          await updateUserLives(userChatId, newLives);
        } else if (invoiceStatus === "failed") {
          alert("Payment Failed! Please try again.");
        }
      });
    } catch (error: any) {
      console.error("Error creating invoice:", error.message || error);
      alert("Error creating invoice: " + (error.message || error));
    }
  } else {
    alert("You do not have enough stars!");
  }
};
