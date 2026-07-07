import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

function App() {
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setLabel(data.label);
    setText('');
    fetchMessages();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">SMS Spam Detector</h1>
        <p className="text-slate-400 mb-8">A React + Tailwind frontend with a Flask + SQLite backend.</p>

        <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl shadow-lg space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 rounded-lg bg-slate-800 border border-slate-700 p-3"
            placeholder="Enter SMS content..."
          />
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold">
            Check Message
          </button>
        </form>

        {label && (
          <div className={`mt-6 p-4 rounded-xl ${label === 'Spam' ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
            <h2 className="text-xl font-semibold">Result: {label}</h2>
          </div>
        )}

        <div className="mt-8 bg-slate-900 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Recent Messages</h3>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex justify-between items-center border-b border-slate-800 pb-2 gap-3">
                <span className="flex-1">{msg.text}</span>
                <span className={`font-semibold ${msg.label === 'Spam' ? 'text-red-400' : 'text-green-400'}`}>
                  {msg.label}
                </span>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-sm bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
