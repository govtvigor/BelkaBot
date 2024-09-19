// src/components/Profile/TaskModal/TaskModal.tsx

import React, { useState, useEffect, useRef } from "react";
import "./taskModal.scss";

interface TaskModalProps {
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose }) => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleVerify = () => {
    // Simulate verification process
    setIsVerifying(true);
    setTimeout(() => {
      // TODO: Implement actual verification logic with Telegram API
      const subscribed = true; // Replace with actual verification result

      if (subscribed) {
        setIsVerified(true);
      } else {
        // Start 30-second cooldown timer
        setTimer(30);
      }
      setIsVerifying(false);
    }, 1500); // Simulated network delay
  };

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer]);

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Social Tasks</h2>
        <div className="task">
          <p>Subscribe to our Telegram channel</p>
          {isVerified ? (
            <button className="verified-button" disabled>
              Verified
            </button>
          ) : (
            <button
              className="verify-button"
              onClick={handleVerify}
              disabled={isVerifying || timer > 0}
            >
              {isVerifying
                ? "Verifying..."
                : timer > 0
                ? `Verify (${timer}s)`
                : "Verify"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
