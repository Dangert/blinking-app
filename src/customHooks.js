import { useState, useEffect, useRef } from "react";

export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerStart = useRef();
  const _isMounted = useRef(true);

  useEffect(() => {
    return () => {
        _isMounted.current = false;
    }
  }, []);

  useEffect(
    () => {
      let interval;
      if (isRunning && _isMounted) {
        timerStart.current = new Date().getTime();
        interval = setInterval(
          () => {
            const dateNow = new Date().getTime();
            setElapsedTime(dateNow - timerStart.current);
          }, 10
        );
      }
      return () => clearInterval(interval);
    },
    [isRunning]
  );

  return {
    isRunning,
    setIsRunning,
    elapsedTime,
    setElapsedTime
  };
};

export const useStopwatch = () => {
  const { isRunning, setIsRunning, elapsedTime, setElapsedTime } = useTimer();

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  return {
    elapsedTime: elapsedTime.toFixed(1),
    resetStopwatch: () => handleReset(),
    startStopwatch: () => setIsRunning(true),
    stopStopwatch: () => setIsRunning(false),
    isRunning
  };
};
