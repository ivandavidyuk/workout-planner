import React, { useState, useEffect } from "react";

interface TimerProps {
  initialTime?: number; // время в секундах
  onComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime = 120, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      onComplete && onComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  const adjustTime = (delta: number) => {
    setTimeLeft((prev) => Math.max(prev + delta, 0));
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-3xl font-mono">
        {Math.floor(timeLeft / 60)
          .toString()
          .padStart(2, "0")}
        :
        {(timeLeft % 60).toString().padStart(2, "0")}
      </div>
      <div className="flex space-x-2">
        <button onClick={() => adjustTime(10)} className="bg-green-500 text-white px-2 py-1 rounded">
          +10s
        </button>
        <button onClick={() => adjustTime(-10)} className="bg-red-500 text-white px-2 py-1 rounded">
          -10s
        </button>
      </div>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="bg-indigo-500 text-white px-4 py-2 rounded"
      >
        {isRunning ? "Пауза" : "Старт"}
      </button>
    </div>
  );
};

export default Timer;
