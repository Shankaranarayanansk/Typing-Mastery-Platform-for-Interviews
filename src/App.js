import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wordList, setWordList] = useState('');
  const [wordArray, setWordArray] = useState([]);
  const [wordStatus, setWordStatus] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(10);
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
    setResult(null);
    setScore(10);
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
      return '';
    });

    setWordStatus(updatedStatus);

    const incorrectWordsCount = updatedStatus.filter(status => status === 'incorrect').length;
    setScore(Math.max(10 - 0.1 * incorrectWordsCount, 0).toFixed(1));
  };

  const handleSubmit = () => {
    const correctCount = wordStatus.filter(status => status === 'correct').length;
    const totalWords = wordArray.length;
    const finalScore = Math.min(Math.floor((correctCount / totalWords) * 10), 10); // Calculate score out of 10
    setResult(finalScore);
    setIsTimerRunning(false); // Stop timer
  };

  const handlePaste = (e) => {
    e.preventDefault();
    toast.error('Pasting text is disabled in this typing area.');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentValue = textareaRef.current.value;
      const cursorPos = textareaRef.current.selectionStart;
      const newValue = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
      setTypedText(newValue);
      textareaRef.current.focus();
      setScore(prevScore => Math.max(prevScore - 0.1, 0).toFixed(1));
    }
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
        setTimeLeft(prevTime => {
          if (prevTime <= 0) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            handleSubmit();
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
      <Toaster position="top-right" expand={true} richColors   />
      <h1>Typing Practice</h1>
      <div className="timer">
        Time Left: {formatTime(timeLeft)}
      </div>
      <textarea
        placeholder="Enter up to 400 words here..."
        value={wordList}
        onChange={handleWordListChange}
      />
      <button onClick={handleGenerateText}>Generate Text</button>
      <div className="typing-area">
        <p className="text-to-type">
          {inputText.split(' ').map((word, index) => (
            <span
              key={index}
              className={wordStatus[index] === 'correct' ? 'correct' : (wordStatus[index] === 'incorrect' ? 'incorrect' : '')}
            >
              {word}
              {' '}
            </span>
          ))}
        </p>
        <textarea
          placeholder="Start typing here..."
          value={typedText}
          onChange={handleTypingChange}
          ref={textareaRef}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSubmit} disabled={!isTimerRunning}>Submit</button>
      </div>
      {result !== null && (
        <div className="result">
          <h2>Your score: {result} out of 10</h2>
          <h3>Detailed Reasons:</h3>
          <ul>
            {wordStatus.map((status, index) => (
              <li key={index}>
                Word "{wordArray[index]}": {status === 'correct' ? 'Correct' : 'Incorrect'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
