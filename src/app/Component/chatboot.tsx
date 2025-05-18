'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from './Chatbot.module.css';


export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salut ! Dites-moi la ville ou vos préférences, et je vous propose les meilleurs hôtels. 🌍' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!inputValue.trim()) return;

  const messageContent = inputValue.trim();
  const userMessage = { role: 'user', content: messageContent };
  setMessages((prev) => [...prev, userMessage]);
  setInputValue('');
  setIsLoading(true);

  try {
    const res = await fetch("https://ton-api-backend.onrender.com/recommend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userMessage })
});

if (!res.ok) {
  const text = await res.text(); // pour voir le HTML de l’erreur
  throw new Error(`Erreur API: ${res.status} - ${text}`);
}

const data = await res.json();


if (data.recommandations && data.recommandations.length > 0) {
  const reply = [
    data.message,
    ...data.recommandations.map((hotel) =>
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
    <div className={styles.container}>
      <Head>
        <title>LoisirBot</title>
        <meta name="description" content="Chatbot de recommandations de hotel" />
      </Head>

      <header className={styles.header}>
        <h1>🤖 Tuna✔️is</h1>
        <p>Découvrez des suggestions d’hôtels faites pour vous !</p>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              <div className={styles.messageContent}>
                {message.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={ "Parle-moi de tes envies de sorties..."}
            className={styles.inputField}
            disabled={isLoading}
          />
          <button type="submit" className={styles.submitButton} disabled={isLoading}>Envoyer</button>
        </form>
      </div>
    </div>
  );
}
