// api/invoice.ts
export const createInvoice = async (chatId: string, title: string, description: string, livesCost: number) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 

    try {
        const response = await fetch("/api/create-invoice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                description,
                prices: [{ label: "Extra Life", amount: livesCost * 10 }],
                chatId
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create invoice");
        }

        const { invoiceLink } = await response.json();
        return invoiceLink;
    } catch (error) {
        throw new Error("Error creating invoice: " + error);
    }
};
