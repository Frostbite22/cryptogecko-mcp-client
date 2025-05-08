// src/components/ChatComponent.tsx

import { useState } from 'react';
import CryptoMcpClient from './CryptoMcpClient'; // Adjust path if needed

const chatClient = new CryptoMcpClient("http://localhost:8000", process.env.REACT_APP_ANTHROPIC_API_KEY);

export default function ChatComponent() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await chatClient.connect(); // connect once per session ideally
      const res = await chatClient.processQuery(query);
      setResponse(res);
    } catch (err) {
      setResponse(`Error: ${err}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4 font-bold">Crypto Chat</h1>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={4}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about crypto prices or trends..."
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSend}
        disabled={loading || !query}
      >
        {loading ? 'Processing...' : 'Send'}
      </button>
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Response:</h2>
        <pre className="whitespace-pre-wrap">{response}</pre>
      </div>
    </div>
  );
}
