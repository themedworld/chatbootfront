'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from './Chatbot.module.css';
interface Hotel {
  hotel: string;
  rating: number;
  address: string;
  description: string;
}


export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salut ! Dites-moi la ville ou vos préférences, et je vous propose les meilleurs hôtels. 🌍' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const messagesEndRef = useRef<HTMLDivElement | null>(null);
const scrollToBottom = () => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!inputValue.trim()) return;

  const messageContent = inputValue.trim();
  const userMessage = { role: 'user', content: messageContent };
  setMessages((prev) => [...prev, userMessage]);
  setInputValue('');
  setIsLoading(true);

  try {
   const res = await fetch("https://backendhotelrec.onrender.com/recommend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userMessage.content }) // 🛠️ correction ici
});

if (!res.ok) {
  const text = await res.text(); // pour voir le HTML de l’erreur
  throw new Error(`Erreur API: ${res.status} - ${text}`);
}

const data = await res.json();

if (data.recommandations && data.recommandations.length > 0) {
  const reply = [
    data.message,
    ...data.recommandations.map((hotel: Hotel) =>
      `🏨 ${hotel.hotel} — ⭐ ${hotel.rating}/50 à ${hotel.address}\n📝 ${hotel.description.slice(0, 150)}...`
    ),
    data.footer
  ].join('\n\n');
  setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);


} else {
  setMessages((prev) => [...prev, {
    role: 'assistant',
    content: data.message || "😕 Aucune recommandation trouvée."
  }]);
}

  } catch (error) {
    console.error("Erreur:", error);
    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: "❌ Une erreur est survenue côté serveur."
    }]);
  } finally {
    setIsLoading(false);
  }
};


  return (
   <div className={`${styles.container} container-fluid py-4`}>
  <Head>
    <title>LoisirBot</title>
    <meta name="description" content="Chatbot de recommandations de hotel" />
  </Head>

  <header className={`${styles.header} text-center mb-4`}>
    <h1 className="fw-bold">🤖 Tuna✔️is</h1>
    <p className="lead">Découvrez des suggestions d’hôtels faites pour vous !</p>
  </header>

  <div className={`${styles.chatContainer} row justify-content-center`}>
    <div className="col-12 col-md-10 col-lg-8">
      <div className={`${styles.messages} mb-3`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage} mb-2`}
          >
            <div className={`${styles.messageContent} p-2 rounded bg-light`}>
              {message.content.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage} mb-2`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={`${styles.inputForm} input-group`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Parle-moi de tes envies de sorties..."
          className={`form-control ${styles.inputField}`}
          disabled={isLoading}
        />
        <button type="submit" className={`btn btn-primary ${styles.submitButton}`} disabled={isLoading}>
          Envoyer
        </button>
      </form>
    </div>
  </div>
</div>

  );
}
