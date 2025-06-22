import axios from 'axios';

export const explainCode = async (code) => {
  const response = await axios.post(`${process.env.OLLAMA_API_URL}/api/generate`, {
    model: 'llama3',
    prompt: `Explain the following code:\n${code}`,
    stream: false
  });

  return response.data.response;
};
