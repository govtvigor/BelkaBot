// paymentHandler.ts
import { updateUserLives } from "../../client/firebaseFunctions";

/**
 * Handles the purchase of extra lives using Telegram Stars.
 * @param stars - Current number of stars the user has.
 * @param lives - Current number of lives the user has.
 * @param setLives - React state setter for lives.
 * @param userChatId - User's Telegram chat ID.
 */
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
      // If deploying to Vercel, replace with your actual deployed URL
      // For local development, you can use a relative URL
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ""; // Ensure this is set in your environment variables

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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice.");
      }

      const data = await response.json();
      const invoiceLink = data.invoiceLink;

      if (!invoiceLink) {
        throw new Error("Invoice link not found in the response.");
      }

      // Ensure Telegram WebApp is ready
      if (window.Telegram && window.Telegram.WebApp) {
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
          } else {
            alert("Payment status unknown. Please contact support.");
          }
        });
      } else {
        console.error("Telegram WebApp is not available.");
        alert("Telegram WebApp is not available. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error.message || error);
      alert("Error creating invoice: " + (error.message || error));
    }
  } else {
    alert("You do not have enough stars!");
  }
};
