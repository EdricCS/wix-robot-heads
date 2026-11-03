
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { RobotHead } from "robot-heads";
import "./style.css";

function RobotEmbed() {
  const stageRef = useRef(null);
  const [robotSize, setRobotSize] = useState(150);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateSize = () => {
      const width = stage.clientWidth || window.innerWidth;
      const height = stage.clientHeight || window.innerHeight;

      const nextSize = Math.max(
  80,
  Math.min(280, Math.min(width, height) - 32)
);

      setRobotSize(Math.round(nextSize));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);

    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <main className="embed-stage" ref={stageRef}>
      <RobotHead
        shape="rectangle"
        state="idle"
        size={robotSize}
        color="#e6e6ea"
        trimColor="#c27a52"
        screenColor="#ffc46b"
        speed={0.5}
        antenna={false}
        interactive={true}
      />
    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(<RobotEmbed />);
