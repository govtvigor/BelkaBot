// api/create-invoice.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Import node-fetch

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Define the expected response structure from Telegram API
interface TelegramInvoiceResponse {
  ok: boolean;
  result?: string; // Invoice link
  description?: string;
}

/**
 * Creates an invoice link using Telegram Bot API.
 * @param chatId - User's Telegram chat ID.
 * @param title - Title of the invoice.
 * @param description - Description of the invoice.
 * @param amount - Amount in the smallest currency unit.
 * @returns Invoice link as a string.
 */
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
    prices: [
      {
        label: "Life",
        amount: amount, // Amount should be in the smallest currency unit
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  // Assert the type of the response to TelegramInvoiceResponse
  const data = (await response.json()) as TelegramInvoiceResponse;

  if (data.ok && data.result) {
    return data.result; // Return the invoice link
  } else {
    throw new Error(data.description || "Failed to create invoice");
  }
};

/**
 * Serverless function to handle invoice creation requests.
 */
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
