import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  urgentDays?: number; // Days threshold to show urgent styling (default 2)
}

export const CountdownTimer = ({ targetDate, urgentDays = 2 }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      totalMs: difference,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isUrgent = timeLeft.days < urgentDays && timeLeft.totalMs > 0;

  const timeUnits = [
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <div className={`flex justify-center gap-3 md:gap-4 ${isUrgent ? 'countdown-urgent' : ''}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-3 md:gap-4">
          <div className={`card-premium text-center min-w-[70px] md:min-w-[80px] py-3 px-4 transition-all duration-300 ${isUrgent ? 'border-destructive' : ''}`}>
            <div className={`text-2xl md:text-3xl font-bold ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              {unit.label}
            </div>
          </div>
          {index < timeUnits.length - 1 && (
            <span className={`text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>:</span>
          )}
        </div>
      ))}
    </div>
  );
};
