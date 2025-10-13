import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerReturn {
  timeLeft: number;
  isActive: boolean;
  isExpired: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  formatTime: (format?: 'full' | 'short' | 'minimal') => string;
}

export function useTimer(
  initialTime: number,
  onExpire?: () => void,
  autoStart: boolean = true
): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout>();
  const onExpireRef = useRef(onExpire);

  // Update onExpire ref when it changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    if (timeLeft > 0) {
      setIsActive(true);
    }
  }, [timeLeft]);

  const reset = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(autoStart);
  }, [initialTime, autoStart]);

  const formatTime = useCallback((format: 'full' | 'short' | 'minimal' = 'full') => {
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    const seconds = timeLeft % 60;

    switch (format) {
      case 'minimal':
        if (days > 0) return `${days}g ${hours}s`;
        if (hours > 0) return `${hours}s ${minutes}d`;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      case 'short':
        if (days > 0) return `${days}g ${hours}s ${minutes}d`;
        if (hours > 0) return `${hours}s ${minutes}d ${seconds}sn`;
        return `${minutes}d ${seconds}sn`;
      
      case 'full':
      default:
        const parts = [];
        if (days > 0) parts.push(`${days} gün`);
        if (hours > 0) parts.push(`${hours} saat`);
        if (minutes > 0) parts.push(`${minutes} dakika`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} saniye`);
        return parts.join(', ');
    }
  }, [timeLeft]);

  return {
    timeLeft,
    isActive,
    isExpired: timeLeft === 0,
    start,
    pause,
    resume,
    reset,
    formatTime,
  };
}

// Hook for countdown to a specific date
export function useCountdown(
  targetDate: Date | string,
  onExpire?: () => void
): UseTimerReturn {
  const getTimeLeft = useCallback(() => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    return Math.max(0, Math.floor(difference / 1000));
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [isActive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const onExpireRef = useRef(onExpire);

  // Update onExpire ref when it changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newTimeLeft = getTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        if (onExpireRef.current) {
          onExpireRef.current();
        }
        clearInterval(intervalRef.current!);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getTimeLeft]);

  const formatTime = useCallback((format: 'full' | 'short' | 'minimal' = 'full') => {
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    const seconds = timeLeft % 60;

    switch (format) {
      case 'minimal':
        if (days > 0) return `${days}g ${hours}s`;
        if (hours > 0) return `${hours}s ${minutes}d`;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      case 'short':
        if (days > 0) return `${days}g ${hours}s ${minutes}d`;
        if (hours > 0) return `${hours}s ${minutes}d ${seconds}sn`;
        return `${minutes}d ${seconds}sn`;
      
      case 'full':
      default:
        const parts = [];
        if (days > 0) parts.push(`${days} gün`);
        if (hours > 0) parts.push(`${hours} saat`);
        if (minutes > 0) parts.push(`${minutes} dakika`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} saniye`);
        return parts.join(', ');
    }
  }, [timeLeft]);

  return {
    timeLeft,
    isActive,
    isExpired: timeLeft === 0,
    start: () => {},
    pause: () => {},
    resume: () => {},
    reset: () => {},
    formatTime,
  };
}

// Hook for auction countdown with status
export function useAuctionCountdown(endTime: string | Date) {
  const countdown = useCountdown(endTime);
  
  const getStatus = useCallback(() => {
    if (countdown.isExpired) return 'ended';
    if (countdown.timeLeft <= 300) return 'ending-soon'; // 5 minutes
    if (countdown.timeLeft <= 3600) return 'ending-today'; // 1 hour
    return 'active';
  }, [countdown.isExpired, countdown.timeLeft]);

  const getUrgencyLevel = useCallback(() => {
    if (countdown.isExpired) return 'expired';
    if (countdown.timeLeft <= 60) return 'critical'; // 1 minute
    if (countdown.timeLeft <= 300) return 'high'; // 5 minutes
    if (countdown.timeLeft <= 3600) return 'medium'; // 1 hour
    return 'low';
  }, [countdown.isExpired, countdown.timeLeft]);

  return {
    ...countdown,
    status: getStatus(),
    urgencyLevel: getUrgencyLevel(),
  };
}

// Hook for multiple timers (useful for auction lists)
export function useMultipleTimers(
  timers: Array<{ id: string; endTime: string | Date; onExpire?: () => void }>
) {
  const [timerStates, setTimerStates] = useState<
    Record<string, { timeLeft: number; isExpired: boolean; status: string }>
  >({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newStates: typeof timerStates = {};

      timers.forEach(({ id, endTime, onExpire }) => {
        const target = new Date(endTime).getTime();
        const timeLeft = Math.max(0, Math.floor((target - now) / 1000));
        const isExpired = timeLeft === 0;

        // Call onExpire if timer just expired
        if (isExpired && !timerStates[id]?.isExpired && onExpire) {
          onExpire();
        }

        let status = 'active';
        if (isExpired) status = 'ended';
        else if (timeLeft <= 300) status = 'ending-soon';
        else if (timeLeft <= 3600) status = 'ending-today';

        newStates[id] = { timeLeft, isExpired, status };
      });

      setTimerStates(newStates);
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, timerStates]);

  const formatTime = useCallback(
    (id: string, format: 'full' | 'short' | 'minimal' = 'short') => {
      const timer = timerStates[id];
      if (!timer) return '';

      const { timeLeft } = timer;
      const days = Math.floor(timeLeft / (24 * 60 * 60));
      const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
      const seconds = timeLeft % 60;

      switch (format) {
        case 'minimal':
          if (days > 0) return `${days}g ${hours}s`;
          if (hours > 0) return `${hours}s ${minutes}d`;
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        case 'short':
          if (days > 0) return `${days}g ${hours}s`;
          if (hours > 0) return `${hours}s ${minutes}d`;
          return `${minutes}d ${seconds}sn`;
        
        case 'full':
        default:
          const parts = [];
          if (days > 0) parts.push(`${days} gün`);
          if (hours > 0) parts.push(`${hours} saat`);
          if (minutes > 0) parts.push(`${minutes} dakika`);
          if (seconds > 0 || parts.length === 0) parts.push(`${seconds} saniye`);
          return parts.join(', ');
      }
    },
    [timerStates]
  );

  return {
    timers: timerStates,
    formatTime,
    getTimer: (id: string) => timerStates[id],
  };
}