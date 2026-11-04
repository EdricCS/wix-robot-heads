import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { RobotHead } from "robot-heads";
import "./style.css";

function RobotEmbed() {
  const trackingActiveRef = useRef(false);

  // ROBOT SETTINGS
  const robotSize = 110;
  const robotX = "12vw";
  const robotY = "0vh";

  useEffect(() => {
    const handleParentMessage = (event) => {
      if (event.source !== window.parent) return;

      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "WIX_ROBOT_PING") {
        let parentOrigin = "*";

        try {
          if (document.referrer) {
            parentOrigin = new URL(document.referrer).origin;
          }
        } catch {}

        window.parent.postMessage(
          { source: "wix-robot-embed", type: "ROBOT_READY" },
          parentOrigin
        );
        return;
      }

      if (message.type === "WIX_ROBOT_ACTIVE") {
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

    let parentOrigin = "*";

    try {
      if (document.referrer) {
        parentOrigin = new URL(document.referrer).origin;
      }
    } catch {}

    window.parent.postMessage(
      { source: "wix-robot-embed", type: "ROBOT_READY" },
      parentOrigin
    );

    return () => {
      window.removeEventListener("message", handleParentMessage);
    };
  }, []);

  return (
    <main className="embed-stage">
      <div
        style={{
          transform: `translate(${robotX}, ${robotY})`,
        }}
      >
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
      </div>
    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(<RobotEmbed />);
