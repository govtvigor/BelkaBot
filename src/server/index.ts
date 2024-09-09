import express from 'express';
import { createInvoice } from './api/create-invoice'; // Adjust the path
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();  // Only load .env variables in development
}
const app = express();


app.use(express.json());

app.post('/api/create-invoice', async (req, res) => {
  const { chatId, title, description, amount } = req.body;
  
  try {
    const invoiceLink = await createInvoice(chatId, title, description, amount);
    res.json({ invoiceLink });
  } catch (error) {
    res.status(500).json({ error: error});
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
