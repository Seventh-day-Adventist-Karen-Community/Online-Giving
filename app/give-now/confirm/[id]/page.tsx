"use client";

import React, { use, useEffect, useState } from "react";
import { IoIosCloseCircleOutline, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";
import { PrimaryButton, SuccessLink, TextButton } from "@components/buttons";
import { PaymentLoader } from "@components/loader";
import { ConfirmStatus } from "@data/mpesa";
import { Constants } from "@utils/constants";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40; // about two minutes

type Status =
  | { kind: "pending" }
  | { kind: "success"; message: string; receipt: string }
  | { kind: "failed"; message: string }
  | { kind: "timeout" };

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [status, setStatus] = useState<Status>({ kind: "pending" });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      const { result } = await ConfirmStatus(id);
      if (cancelled) return;

      if (result?.state === "COMPLETED") {
        setStatus({ kind: "success", message: result.ResultDescription, receipt: result.reference });
        return;
      }
      if (result?.state === "FAILED") {
        setStatus({ kind: "failed", message: result.ResultDescription });
        return;
      }
      // Still INITIATED, or a transient error: keep trying until we run out of attempts.
      if (attempts >= MAX_ATTEMPTS) {
        setStatus({ kind: "timeout" });
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          {status.kind === "pending" && (
            <div className="flex flex-col items-center gap-y-4 py-6">
              <PaymentLoader />
              <p className="text-sm text-gray-500">Confirming your payment — this usually takes a few seconds.</p>
            </div>
          )}

          {status.kind === "success" && (
            <div className="flex flex-col items-center gap-y-3 py-4">
              <IoMdCheckmarkCircleOutline className="w-16 h-16 sm:w-20 sm:h-20 text-green-500" />
              <p className="text-green-600 text-lg sm:text-xl font-semibold leading-snug">{status.message}</p>
              <div className="w-full pt-3">
                <SuccessLink link={`/give-now/receipt/${status.receipt}`} text="View Receipt" className="w-full" />
              </div>
            </div>
          )}

          {status.kind === "failed" && (
            <div className="flex flex-col items-center gap-y-3 py-4">
              <IoIosCloseCircleOutline className="w-16 h-16 sm:w-20 sm:h-20 text-red-500" />
              <p className="text-red-600 text-lg sm:text-xl font-semibold leading-snug">{status.message}</p>
              <div className="w-full pt-3">
                <PrimaryButton link="/" text="Try Again" className="w-full" />
              </div>
            </div>
          )}

          {status.kind === "timeout" && (
            <div className="flex flex-col items-center gap-y-3 py-4">
              <IoTimeOutline className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />
              <p className="text-gray-700 text-lg font-semibold leading-snug">We couldn&apos;t confirm your payment yet.</p>
              <p className="text-sm text-gray-500">
                If M-PESA has deducted the amount, you will receive a receipt by SMS or email shortly. Please check
                before trying again, or contact the treasury on {Constants.TREASURY_PHONE}.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-6 justify-center pt-5">
          <TextButton link="/" text="Give Again" />
        </div>
      </div>
    </div>
  );
};

export default Page;
