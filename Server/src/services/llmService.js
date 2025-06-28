import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const explainCode = async (code) => {
  const baseUrl = process.env.OLLAMA_API_URL;
  console.log('OLLAMA_API_URL:', baseUrl);

  if (!baseUrl) {
    throw new Error('OLLAMA_API_URL is not set in environment variables.');
  }

  const response = await axios.post(`${baseUrl}/api/chat`, {
    model: 'llama3',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that explains code clearly.',
      },
      {
        role: 'user',
        content: `Explain the following code:\n\n${code}`,
      }
    ],
    stream: false
  });

  return response.data.message?.content || 'No explanation received.';
};