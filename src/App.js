import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wordList, setWordList] = useState('');
  const [wordArray, setWordArray] = useState([]);
  const [wordStatus, setWordStatus] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  const handleWordListChange = (e) => {
    setWordList(e.target.value);
  };

  const handleGenerateText = () => {
    const words = wordList.split(/\s+/).slice(0, 400).join(' ');
    setWordArray(words.split(' '));
    setInputText(words);
    setTypedText('');
    setWordStatus(new Array(words.split(' ').length).fill(''));
    setTimeLeft(1200); // Reset timer
    setIsTimerRunning(true); // Start timer
  };

  const handleTypingChange = (e) => {
    const text = e.target.value;
    setTypedText(text);

    const typedWords = text.split(/\s+/);
    const updatedStatus = wordArray.map((word, index) => {
      if (typedWords[index] === word) return 'correct';
      if (typedWords[index] !== undefined) return 'incorrect';
      return 'missing';
    });

    setWordStatus(updatedStatus);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    toast.error('Pasting text is disabled in this typing area.');
  };

  useEffect(() => {
    textareaRef.current.addEventListener('paste', handlePaste);
    return () => {
      textareaRef.current.removeEventListener('paste', handlePaste);
    };
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            return 0;
          }
          if (prevTime <= 300) {
            toast.warning('Only 5 minutes left, hurry up!');
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <Toaster position="top-right" expand={true} richColors />
      <h1>Typing Practice</h1>
      <div className="timer">Time Left: {formatTime(timeLeft)}</div>
      <textarea
        placeholder="Enter up to 400 words here..."
        value={wordList}
        onChange={handleWordListChange}
      />
      <button onClick={handleGenerateText}>Generate Text</button>
      <div className="typing-container">
        <div className="text-to-type">
          {inputText.split(' ').map((word, index) => (
            <span
              key={index}
              className={wordStatus[index]}
            >
              {word}{' '}
            </span>
          ))}
        </div>
        <textarea
          className="typing-area"
          placeholder="Start typing here..."
          value={typedText}
          onChange={handleTypingChange}
          ref={textareaRef}
        />
      </div>
    </div>
  );
}

export default App;
