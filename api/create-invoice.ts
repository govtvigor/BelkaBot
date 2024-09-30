// api/create-invoice.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

// Define the expected response structure from Telegram API
interface TelegramInvoiceResponse {
  ok: boolean;
  result?: string; // Invoice link
  description?: string;
}

export const createInvoice = async (
  chatId: string,
  title: string,
  description: string,
  amount: number
): Promise<string> => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
  const requestBody = {
    title,
    description,
    payload: `invoice_${chatId}_${Date.now()}`,
    currency: "XTR", // Ensure "XTR" is a supported currency
    prices: [{ label: "Life", amount: amount }], // Amount should be in the smallest currency unit
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  // Type the response according to the interface
  const data: TelegramInvoiceResponse = await response.json();

  if (data.ok && data.result) {
    return data.result; // Return the invoice link
  } else {
    throw new Error(data.description || "Failed to create invoice");
  }
};

// If you have an API endpoint in the same file, ensure it's properly exported
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { chatId, title, description, amount } = req.body;

  // Validate request body
  if (!chatId || !title || !description || typeof amount !== "number") {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const invoiceLink = await createInvoice(chatId, title, description, amount);
    res.status(200).json({ invoiceLink });
  } catch (error: any) {
    console.error("Error creating invoice:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
