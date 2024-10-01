// paymentHandler.ts
import { updateUserLives } from "../../client/firebaseFunctions";
import { createInvoice } from "../../../api/create-invoice";

export const handleBuyLives = async (
  stars: number,
  lives: number,
  setLives: React.Dispatch<React.SetStateAction<number>>,
  userChatId: string | null
) => {
  const livesCost = 1;

  if (stars >= livesCost) {
    try {
      if (!userChatId) {
        alert("Error: Chat ID is missing. Please try again.");
        return;
      }

      const invoiceLink = await createInvoice(
        userChatId,
        "Extra Life",
        "Purchase an additional life",
        livesCost
      );

      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.openInvoice(invoiceLink, async (invoiceStatus) => {
        if (invoiceStatus === "paid") {
          alert("Star Payment Success!");

          const newLives = lives + 3;
          setLives(newLives);

          // Update lives in Firebase
          await updateUserLives(userChatId, newLives);
        } else if (invoiceStatus === "failed") {
          alert("Payment Failed! Please try again.");
        }
      });
    } catch (error) {
      alert("Error creating invoice: " + error);
    }
  } else {
    alert("You do not have enough stars!");
  }
};
