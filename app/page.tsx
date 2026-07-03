"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
    if (!isStarted) setIsStarted(true);
  };

  const [sessionType, setSessionType] = useState("work");
  const [workSessionCount, setWorkSessionCount] = useState(0);

  const sound = useRef<HTMLAudioElement | null>(null);

  const [generalPreferences, setGeneralPreferences] = useState({
    testMode: false,
    disableSound: false,
  });

  const timerSpeed = generalPreferences.testMode ? 10 : 1000;

  useEffect(() => {
    sound.current = new Audio("/sounds/myinstants.mp3");
  }, []);

  const [durations, setDurations] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  useEffect(() => {
    try {
      const saved1 = localStorage.getItem("duration preferences");
      const saved2 = localStorage.getItem("general preferences");

      if (!saved1 || !saved2) return;

      const durationPreferences = JSON.parse(saved1);
      const generalPreferences = JSON.parse(saved2);

      setDurations(durationPreferences);
      setGeneralPreferences(generalPreferences);
    } catch {
      console.error("Invalid saved preferences");
    }
  }, []);

  function setDurationsToDefault() {
    setDurations({
      work: 25,
      shortBreak: 5,
      longBreak: 15,
    });
  }

  useEffect(() => {
    const item = {
      work: durations.work,
      shortBreak: durations.shortBreak,
      longBreak: durations.longBreak,
    };
    localStorage.setItem("duration preferences", JSON.stringify(item));
    if (!isStarted) setSeconds(durations.work * 60);
  }, [durations, isStarted]);

  useEffect(() => {
    const item = {
      testMode: generalPreferences.testMode,
      disableSound: generalPreferences.disableSound,
    };
    localStorage.setItem("general preferences", JSON.stringify(item));
  }, [generalPreferences]);

  const [seconds, setSeconds] = useState(durations.work * 60);

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(durations.work * 60);
    setIsStarted(false);
    setSessionType("work");
    setWorkSessionCount(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isRunning) return;

      if (seconds) {
        setSeconds((prev) => prev - 1);
        return;
      }

      if (sound.current && !generalPreferences.disableSound) {
        sound.current.currentTime = 0;
        sound.current.play().catch(console.error);
      }

      if (sessionType === "short break" || sessionType === "long break") {
        setSessionType("work");
        setSeconds(durations.work * 60);
        return;
      }

      const newWorkSessionCount = workSessionCount + 1;
      setWorkSessionCount(newWorkSessionCount);

      if (newWorkSessionCount % 4 === 0) {
        setSessionType("long break");
        setSeconds(durations.longBreak * 60);
      } else {
        setSessionType("short break");
        setSeconds(durations.shortBreak * 60);
      }
    }, timerSpeed);
    return () => {
      clearTimeout(timer);
    };
  }, [
    isRunning,
    seconds,
    durations,
    sessionType,
    workSessionCount,
    timerSpeed,
  ]);

  let shownSeconds = seconds;
  let minutes = Math.trunc(seconds / 60);
  const hours = Math.trunc(minutes / 60);

  if (minutes >= 1) {
    shownSeconds = seconds % 60;
  }
  if (hours >= 1) {
    minutes = minutes % 60;
  }

  return (
    <div
      className="
        flex flex-col sm:px-8 md:px-12 lg:px-20 xl:px-24 2xl:px-32 gap-25 h-full w-full items-center text-center text-color2 [&_button]:cursor-pointer
        "
    >
      <header className="flex gap-8 mt-4 [&_button]:tracking-wide">
        <button
          className={`${generalPreferences.testMode ? "text-green-500" : "text-red-500"}`}
          onClick={() => {
            const newValue = !generalPreferences.testMode;
            setGeneralPreferences((prev) => ({
              ...prev,
              testMode: newValue,
            }));
          }}
        >
          test mode
        </button>
        <button
          className={`${generalPreferences.disableSound ? "text-green-500" : "text-red-500"}`}
          onClick={() => {
            const newValue = !generalPreferences.disableSound;
            setGeneralPreferences((prev) => ({
              ...prev,
              disableSound: newValue,
            }));
          }}
        >
          disable sound
        </button>
      </header>
      <main>
        <h2 className="text-2xl font-semibold">{sessionType}</h2>
        <h3 className="">work sessions: {workSessionCount}</h3>
        <h1 className="text-8xl mt-1 mb-4">
          {`${hours < 10 ? "0" : ""}${hours}` + ":"}
          {`${minutes < 10 ? "0" : ""}${minutes}` + ":"}
          {`${shownSeconds < 10 ? "0" : ""}` + shownSeconds}
        </h1>
        <div
          className="
            flex gap-3 justify-center
            [&_button]:py-0.5 [&_button]:px-2
            [&_button]:uppercase [&_button]:tracking-widest [&_button]:rounded-sm [&_button]:bg-color2 [&_button]:text-color4
          "
        >
          <button
            onClick={() => {
              toggleTimer();
            }}
          >
            {!isStarted ? "start" : isRunning ? "pause" : "resume"}
          </button>
          {isStarted && <button onClick={() => resetTimer()}>reset</button>}
        </div>
      </main>

      <section
        className="
          flex flex-col justify-center items-center w-full p-1 border-t-2
          [&_button]:py-0.5 [&_button]:px-2
          [&_button]:uppercase [&_button]:tracking-widest [&_button]:rounded-sm [&_button]:bg-color2 [&_button]:text-color4"
      >
        <h3 className="uppercase text-lg font-semibold">customize</h3>
        <div
          className="
          grid grid-cols-2 mt-10 text-right gap-3
        "
        >
          <label htmlFor="workDuration">work session: {durations.work}</label>
          <input
            id="workDuration"
            type="range"
            min="1"
            max="120"
            className="slider"
            value={durations.work}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setDurations((prev) => ({
                ...prev,
                work: newValue,
              }));
            }}
          />
          <label htmlFor="shortBreakDuration">
            short break session: {durations.shortBreak}
          </label>
          <input
            id="shortBreakDuration"
            type="range"
            min="1"
            max="120"
            className="slider"
            value={durations.shortBreak}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setDurations((prev) => ({
                ...prev,
                shortBreak: newValue,
              }));
            }}
          />
          <label htmlFor="longBreakDuration">
            long break session: {durations.longBreak}
          </label>
          <input
            id="longBreakDuration"
            type="range"
            min="1"
            max="120"
            className="slider"
            value={durations.longBreak}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setDurations((prev) => ({
                ...prev,
                longBreak: newValue,
              }));
            }}
          />
        </div>
        <p className="mt-2">(minutes)</p>
        <button
          className="mt-4 text-sm"
          onClick={(e) => {
            e.preventDefault();
            setDurationsToDefault();
          }}
        >
          default
        </button>
      </section>
    </div>
  );
}
