import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
export const createInvoice = async (chatId: string, title: string, description: string, amount: number) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
    const requestBody = {
        title,
        description,
        payload: `invoice_${chatId}_${Date.now()}`,
        currency: "XTR",
        prices: [{ label: "Life", amount: amount }], // Modify as per your structure
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.ok) {
        return data.result;
    } else {
        throw new Error(data.description || "Failed to create invoice");
    }
};

