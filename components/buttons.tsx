import React, { MouseEventHandler } from "react";
import Link from "next/link";

type LinkInput = {
  text: string;
  title?: string;
  link: string;
  icon?: React.ReactNode;
  reverse?: boolean;
  className?: string;
};

type ButtonInput = {
  text: string;
  title?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  reverse?: boolean;
  type?: "submit" | "reset" | "button";
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const Content = ({ text, icon }: { text: string; icon?: React.ReactNode }) => (
  <>
    {text}
    {icon && <span className="self-center">{icon}</span>}
  </>
);

const layout = (reverse?: boolean) =>
  `flex flex-nowrap gap-3 content-center items-center justify-center text-center ${reverse ? "flex-row-reverse" : "flex-row"}`;

export const PrimaryButton = ({ link, title, text, icon, reverse, className = "" }: LinkInput) => (
  <Link
    href={link}
    title={title}
    className={`w-full md:w-auto bg-maroon-600 hover:bg-maroon-700 text-white py-2 px-7 rounded-full shadow-md hover:shadow-lg font-semibold z-0 transition-all ${layout(reverse)} ${className}`}
  >
    <Content text={text} icon={icon} />
  </Link>
);

export const PrimarySubmitButton = ({ type, title, text, icon, disabled, reverse, onClick, className = "" }: ButtonInput) => (
  <button
    disabled={disabled}
    type={type}
    onClick={onClick}
    title={title}
    className={`w-full md:w-auto bg-maroon-600 hover:bg-maroon-700 text-white py-2 px-7 rounded-full shadow-md hover:shadow-lg font-semibold z-0 transition-all ${layout(reverse)} ${className}`}
  >
    <Content text={text} icon={icon} />
  </button>
);

export const TextFormButton = ({ type, title, text, icon, disabled, reverse, onClick, className = "" }: ButtonInput) => (
  <button
    disabled={disabled}
    type={type}
    onClick={onClick}
    title={title}
    className={`w-full md:w-auto bg-transparent border-b-2 border-transparent hover:border-maroon-800 px-7 rounded-full font-semibold z-0 transition-all ${layout(reverse)} ${className}`}
  >
    <Content text={text} icon={icon} />
  </button>
);

export const SuccessLink = ({ link, title, text, icon, reverse, className = "" }: LinkInput) => (
  <Link
    href={link}
    title={title}
    className={`w-full md:w-auto bg-green-500 hover:bg-green-600 text-gray-50 py-2 px-7 rounded-full shadow-md hover:shadow-lg font-semibold z-0 border border-green-500 hover:border-green-600 transition-all ${layout(reverse)} ${className}`}
  >
    <Content text={text} icon={icon} />
  </Link>
);

export const TextButton = ({ link, title, text, icon, reverse }: LinkInput) => (
  <Link
    href={link}
    title={title}
    className={`w-full md:w-auto bg-transparent text-maroon-600 rounded-full font-semibold z-0 transition-all flex flex-nowrap gap-3 items-center ${reverse ? "flex-row-reverse" : "flex-row"}`}
  >
    <Content text={text} icon={icon} />
  </Link>
);
