"use client";

import React from "react";
import { motion } from "framer-motion";
import { AiOutlineAlert } from "react-icons/ai";
import { BiErrorCircle } from "react-icons/bi";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { FcInfo } from "react-icons/fc";
import { Constants } from "../../utils/constants";
import { ToastType } from "./types";

const TICK_MS = 100;

const initialAnimation = (position?: string) => {
  switch (position) {
    case "top-left":
    case "bottom-left":
      return { opacity: 0, x: -50, scale: 0.3 };
    case "top-right":
    case "bottom-right":
      return { opacity: 0, x: 50, scale: 0.3 };
    default:
      return { opacity: 0, y: -50, scale: 0.3 };
  }
};

const exitAnimation = (position?: string) => {
  switch (position) {
    case "top-left":
    case "bottom-left":
      return { opacity: 0, x: -20, scale: 0.5 };
    case "top-right":
    case "bottom-right":
      return { opacity: 0, x: 20, scale: 0.5 };
    default:
      return { opacity: 0, y: -20, scale: 0.5 };
  }
};

const tone: Record<ToastType, { box: string; text: string; bar: string }> = {
  [ToastType.ERROR]: { box: "bg-red-200", text: "text-red-700", bar: "border-red-700" },
  [ToastType.SUCCESS]: { box: "bg-green-200", text: "text-green-700", bar: "border-green-700" },
  [ToastType.ALERT]: { box: "bg-yellow-200", text: "text-yellow-700", bar: "border-yellow-700" },
  [ToastType.INFO]: { box: "bg-white", text: "text-blue-300", bar: "border-blue-700" },
};

const ToastItem = ({ message, type, position }: { message: string; type: ToastType; position?: string }) => {
  const [dismissed, setDismissed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [remaining, setRemaining] = React.useState(Constants.TOAST_TIMEOUT);

  // Count down while the toast is visible and not being hovered/touched.
  React.useEffect(() => {
    if (dismissed || hovered || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [dismissed, hovered, remaining]);

  const { box, text, bar } = tone[type];
  const visible = message && !dismissed && remaining > 0;
  const width = Math.max(0, (remaining / Constants.TOAST_TIMEOUT) * 100);

  if (!visible) return null;

  return (
    <motion.div layout initial={initialAnimation(position)} animate={{ opacity: 1, y: 0, x: 0, scale: 1 }} exit={exitAnimation(position)}>
      <div
        className="transition-all z-50 cursor-pointer delay-75 relative rounded-lg overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
      >
        <div className={`flex items-center w-full max-w-sm p-4 rounded-lg shadow-md ${box} ${text}`} role="alert">
          <div className="inline-flex items-center justify-center flex-shrink-0">
            {type === ToastType.ERROR ? (
              <BiErrorCircle size={30} />
            ) : type === ToastType.SUCCESS ? (
              <BsFillCheckCircleFill size={30} />
            ) : type === ToastType.ALERT ? (
              <AiOutlineAlert size={30} />
            ) : (
              <FcInfo size={30} />
            )}
          </div>
          <div className="ml-3 text-sm font-normal">{message}</div>
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 bg-transparent hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 ${text}`}
            aria-label="Close"
            onClick={() => setDismissed(true)}
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className={`absolute h-8 border-b-4 bottom-0 px-2 transition-all ${bar}`} style={{ width: `${width}%` }} />
      </div>
    </motion.div>
  );
};

export default ToastItem;
