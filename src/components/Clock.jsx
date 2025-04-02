import React, { useEffect, useState } from 'react';

export default function Clock({ isRunning }) {
  const [radius, setRadius] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    setSeconds(0);
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const updateRadius = () => {
      setRadius(Math.min(window.innerWidth * 0.23, window.innerHeight * 0.23));
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const hours = Math.floor(seconds / 3600) % 12;
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hourAngle = hours * 30 + (minutes / 60) * 30;
  const minuteAngle = minutes * 6;
  const secondAngle = remainingSeconds * 6;

  return (
    <div
      className="relative rounded-full border-2 border-gray-300 dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(35,35,35)] flex items-center justify-center shadow-md shadow-black/30"
      style={{ width: 'min(50vw, 50vh)', height: 'min(50vw, 50vh)' }}
    >
      {[...Array(12)].map((_, index) => {
        const angle = (index / 12) * 360;
        return (
          <div
            key={index}
            className="absolute bg-gray-500 dark:bg-gray-500 rounded-full"
            style={{
              width: index % 3 === 0 ? '1.5%' : '1%',
              height: index % 3 === 0 ? '6%' : '3%',
              top: '50%',
              left: '50%',
              transformOrigin: 'center',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
              opacity: index % 3 === 0 ? 0.9 : 0.5,
            }}
          ></div>
        );
      })}

      <div
        className="absolute bg-[#6B5B95] rounded-full shadow-md"
        style={{
          width: '2%',
          height: '25%',
          top: '50%',
          left: '50%',
          transformOrigin: 'bottom',
          transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
        }}
      ></div>

      <div
        className="absolute bg-gray-400 dark:bg-gray-300 rounded-full shadow-md"
        style={{
          width: '1.5%',
          height: '35%',
          top: '50%',
          left: '50%',
          transformOrigin: 'bottom',
          transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
        }}
      ></div>

      <div
        className="absolute bg-[#6B5B95] rounded-full shadow-md"
        style={{
          width: '0.8%',
          height: '40%',
          top: '50%',
          left: '50%',
          transformOrigin: 'bottom',
          transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
          opacity: 0.85,
        }}
      ></div>

      <div className="absolute w-[3%] h-[3%] bg-[#6B5B95] rounded-full shadow-md"></div>

      <div
        id="length"
        className="absolute bottom-[10%] bg-gray-200 dark:bg-[rgb(45,45,45)] text-gray-900 dark:text-white font-semibold text-[min(3vw,3vh)] py-2 px-[5%] rounded-lg border-2 border-gray-300 dark:border-[rgb(50,50,50)] shadow-md tracking-wide"
      >
        {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`}
      </div> 
    </div>
  );
}