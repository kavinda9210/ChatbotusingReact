import { useState } from 'react';
import './chat.css';
import axios from 'axios';
import './script.js'

function App() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const recommendedQuestions = [
    "What should I look for when buying a used vehicle?",
    "Is it better to buy or lease a car?",
    "How do I know if I am getting a good deal on a car?",
    "What are the key differences between gas, hybrid, and electric vehicles?",
    "What are the necessary steps for registering a new or used vehicle?",
  ];

  const removeMarkdown = (text) => {
    // This function removes bold markdown (e.g., **text**) and other unwanted markdown patterns
    return text.replace(/\*\*(.*?)\*\*/g, '$1');  // Removes **bold** markdown
  };

  async function generateAnswer() {
    if (!question.trim()) return;
    setChatHistory((prev) => [...prev, { type: 'question', content: question }]);
    setQuestion('');
    setShowRecommendations(false);
    setChatHistory((prev) => [...prev, { type: 'answer', content: 'Loading...' }]);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyC9FpQriKpCZbYCxw110wZ0mSS8p_4ejHQ',
        {
          contents: [{ parts: [{ text: question }] }],
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;

      // Remove markdown or special characters from the generated text
      const sanitizedText = removeMarkdown(generatedText);

      setChatHistory((prev) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = { type: 'answer', content: sanitizedText };
        return updatedHistory;
      });
    } catch (error) {
      setChatHistory((prev) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = { type: 'answer', content: 'Error generating response. Please try again.' };
        return updatedHistory;
      });
    }
  }

  const handleRecommendedClick = (question) => {
    setQuestion(question);
    setShowRecommendations(false);
    generateAnswer();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateAnswer();
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-item">Contacts</div>
        <div className="sidebar-item">Exit</div>
        <div className="sidebar-item active"><button
          onClick={() => window.location.href = 'http://localhost:5173'}
        >
          Exit
        </button></div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h2>AI Assistant</h2>
        </div>
        <div className="chat-body">
          {showRecommendations && chatHistory.length === 0 && (
            <div className="recommended-questions">
              {recommendedQuestions.map((item, index) => (
                <div
                  key={index}
                  className="recommended-question"
                  onClick={() => handleRecommendedClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
          {chatHistory.map((entry, index) => (
            <div key={index} className={`chat-bubble ${entry.type}`}>
              {entry.type === 'answer' ? (
                <pre>{entry.content}</pre>
              ) : (
                entry.content
              )}
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="chat-input"
            onKeyDown={handleKeyPress}  // Listen for "Enter" key
          ></textarea>
          <button onClick={generateAnswer} className="chat-button">Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
