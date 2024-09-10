export const createInvoice = async (botToken: string, chatId: string, title: string, description: string, amount: number) => {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
    console.log(process.env);
    const requestBody = {
        title,
        description,
        payload: `invoice_${chatId}_${Date.now()}`,
        currency: "XTR",
        prices: [{ label: "Life", amount: amount * 100 }], // Modify as per your structure
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

