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
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [hasWarned, setHasWarned] = useState(false); // Track if 5-minute warning has been shown
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
    setTimeLeft(1200); // Reset timer
    setIsTimerRunning(true); // Start timer
    setTimeTaken(0);
    setHasWarned(false); // Reset warning state
  };

  const handleTypingChange = (e) => {
    const text = e.target.value;
    setTypedText(text);

    const typedWords = text.split(/\s+/);
    const updatedStatus = wordArray.map((word, index) => {
      if (typedWords[index] === word) return 'correct';
      if (typedWords[index] !== undefined) {
        if (typedWords[index].length === word.length) {
          let mismatches = 0;
          for (let i = 0; i < word.length; i++) {
            if (typedWords[index][i] !== word[i]) {
              mismatches++;
            }
          }
          return mismatches > 2 ? 'incorrect' : 'spelling-mistake';
        }
        return 'incorrect';
      }
      return '';
    });

    setWordStatus(updatedStatus);
  };

  const handleSubmit = () => {
    const mismatchCount = wordStatus.filter(status => status === 'incorrect').length;
    const spellingMistakeCount = wordStatus.filter(status => status === 'spelling-mistake').length;

    setResult({
      mismatchCount,
      spellingMistakeCount,
      timeTaken: 1200 - timeLeft,
    });
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
          if (prevTime <= 300 && !hasWarned) {
            toast.warning('Only 5 minutes left, hurry up!');
            setHasWarned(true); // Ensure the warning is shown only once
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, hasWarned]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <Toaster position="top-right" expand={true} richColors />
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
      <div className="typing-container">
        <div className="text-to-type">
          {inputText.split(' ').map((word, index) => (
            <span
              key={index}
              className={wordStatus[index]}
              style={{ color: wordStatus[index] === 'incorrect' ? 'red' : wordStatus[index] === 'correct' ? 'green' : 'black' }}
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
          onKeyDown={handleKeyDown}
        />
      </div>
      <button onClick={handleSubmit} disabled={!isTimerRunning}>Submit</button>
      {result !== null && (
        <div className="result-modal">
          <h2>Results</h2>
          <p>Mismatched Words Count: {result.mismatchCount}</p>
          <p>Spelling Mistakes Count: {result.spellingMistakeCount}</p>
          <p>Time Taken: {formatTime(result.timeTaken)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
