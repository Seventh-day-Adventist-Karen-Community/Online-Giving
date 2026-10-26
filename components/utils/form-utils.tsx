"use client";

import React from "react";
import { ImSpinner6 } from "react-icons/im";

type FormUtilType = {
  loading: boolean;
  success?: boolean;
  successMessage?: string;
};

/** Loading overlay and success banner for a form container (the container must be `relative`). */
const FormUtils = ({ loading, success, successMessage }: FormUtilType) => (
  <>
    {loading && (
      <div className="flex flex-col text-center align-middle justify-center py-32 absolute h-full w-full left-0 top-0 bg-slate-50 opacity-70 transition-all z-40">
        <div className="flex flex-row justify-center w-full">
          <ImSpinner6 className="animate-spin" size={25} />
        </div>
      </div>
    )}
    {success && (
      <div
        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative transition-all"
        role="alert"
      >
        <strong className="font-bold pr-1">Success!</strong>
        <span className="block sm:inline">{successMessage ?? "Action Completed Successfully"}</span>
      </div>
    )}
  </>
);

export default FormUtils;
