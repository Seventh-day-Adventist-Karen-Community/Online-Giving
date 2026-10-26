"use client";

import React from "react";

const Switch = ({ checked, text, setEnabled }: { checked: boolean; text: string; setEnabled: () => void }) => (
  <label className="inline-flex relative items-center cursor-pointer my-auto hover:text-maroon-700">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={setEnabled} />
    <div className="w-9 h-5 bg-gray-500 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-maroon-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maroon-700" />
    <span className="ml-2 text-sm font-medium">{text}</span>
  </label>
);

export default Switch;
