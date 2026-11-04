import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { RobotHead } from "robot-heads";
import "./style.css";

function RobotEmbed() {
  const stageRef = useRef(null);
  const trackingActiveRef = useRef(false);
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

  useEffect(() => {
    const handleParentMessage = (event) => {
      // Only accept messages sent by the Wix page that embeds this iframe.
      if (event.source !== window.parent) return;

      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "WIX_ROBOT_ACTIVE") {
        // Track only while Wix reports that the pointer is inside section27.
        trackingActiveRef.current = message.active === true;
        if (!trackingActiveRef.current) {
          document.dispatchEvent(new PointerEvent("pointerleave"));
        }
        return;
      }

      if (
        message.type === "WIX_ROBOT_CURSOR" &&
        trackingActiveRef.current &&
        Number.isFinite(message.x) &&
        Number.isFinite(message.y)
      ) {
        // The robot-heads animation already listens for pointermove events.
        // Re-dispatch the Wix coordinates inside this iframe so its existing
        // eye and head tracking can use them.
        document.dispatchEvent(
          new PointerEvent("pointermove", {
            clientX: message.x,
            clientY: message.y,
            bubbles: true,
          })
        );
      }

      if (message.type === "WIX_ROBOT_LEAVE") {
        document.dispatchEvent(new PointerEvent("pointerleave"));
      }
    };

    window.addEventListener("message", handleParentMessage);

    // Let Wix page code know this iframe is ready to receive messages.
    let parentOrigin = "*";
    try {
      if (document.referrer) {
        parentOrigin = new URL(document.referrer).origin;
      }
    } catch {
      // Keep the fallback origin if the referrer is unavailable.
    }

    window.parent.postMessage(
      { source: "wix-robot-embed", type: "ROBOT_READY" },
      parentOrigin
    );

    return () => {
      window.removeEventListener("message", handleParentMessage);
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
        speed={1.5}
        antenna={false}
        interactive={true}
      />
    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(<RobotEmbed />);
