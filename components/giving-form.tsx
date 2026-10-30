"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { PrimarySubmitButton, TextFormButton } from "@components/buttons";
import { Loader3 } from "@components/loader";
import { MessageContext, MessagesContextType } from "@components/toast/context";
import FormUtils from "@components/utils/form-utils";
import { GivingInputComponent } from "@components/utils/input-component";
import Switch from "@components/utils/switch";
import { FetchChurchUnits, FetchPaymentTypes, PostMpesa } from "@data/mpesa";
import type { ChurchUnitType, MpesaType, PaymentType } from "@data/types";
import { MpesaActionEnum, MpesaReducer } from "@reducers/mpesaReducer";
import { Constants } from "@utils/constants";
import ValidateEmail, { ValidatePhoneNumber } from "@utils/validate-util";

const SUCCESS_MESSAGE = "Transaction initiated. Please enter your MPESA PIN on your phone.";
const STORAGE_KEY = "giving-mpesa";

// These categories are always shown; everything else is added on demand.
const FIXED_TYPE_PATTERNS = [/tithe/i, /local\s*church\s*budget/i];
const isFixedPayType = (payType: PaymentType) =>
  FIXED_TYPE_PATTERNS.some((p) => p.test(payType.description) || p.test(payType.code));

const GIVING_STEPS = [
  "Enter your correct Safaricom phone number",
  "Enter an amount for any giving categories you'd like",
  "Click on the submit button",
  "You will receive a prompt on your phone to enter your M-PESA pin",
  "Enter your M-PESA pin",
  "You will receive a confirmation message on your phone",
  "Wait for the receipt to be sent to you by SMS/email",
];

const initData: MpesaType = {
  name: "",
  phone: "",
  email: "",
  unit: "",
  errored: true,
  save: false,
  lines: [],
};

type SavedDetails = Pick<MpesaType, "name" | "phone" | "email" | "unit">;

const GivingForm = () => {
  const Messages = useContext(MessageContext) as MessagesContextType;
  const router = useRouter();

  const [state, dispatch] = useReducer(MpesaReducer, initData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [payTypes, setPayTypes] = useState<PaymentType[]>();
  const [churchUnits, setChurchUnits] = useState<ChurchUnitType[]>();
  const [addedOtherIndexes, setAddedOtherIndexes] = useState<number[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);

  const formErrored = Boolean(state.name_error || state.phone_error || state.email_error);

  const loadTypes = useCallback(async () => {
    const { result, error } = await FetchPaymentTypes();
    if (result) setPayTypes(result);
    else Messages.setErrors(error);
  }, [Messages]);

  const loadUnits = useCallback(async () => {
    const { result, error } = await FetchChurchUnits();
    if (result) setChurchUnits(result);
    else Messages.setErrors(error);
  }, [Messages]);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || formErrored) return;
    setSuccess(false);
    setLoading(true);
    const { result, error } = await PostMpesa(state);
    if (result) {
      if (state.save) {
        const saved: SavedDetails = { name: state.name, phone: state.phone, email: state.email, unit: state.unit };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
      setSuccess(true);
      Messages.setSuccess(SUCCESS_MESSAGE, { position: "top-center" });
      router.push(`/give-now/confirm/${result.id}`);
    } else {
      Messages.setErrors(error || "There was an error!", { position: "top-center" });
    }
    setLoading(false);
  };

  const moveNext = async () => {
    if (payTypes === undefined) await loadTypes();
    if (churchUnits === undefined) await loadUnits();
    if (!formErrored) setPage(2);
  };

  const updateLines = (index: number, amount: number | string) => {
    const lines = [...(state.lines ?? [])];
    lines[index] = { code: payTypes?.[index].code ?? "", amount };
    dispatch({ type: MpesaActionEnum.CHANGE_LINES, payload: lines });
  };

  const addGivingCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number(e.target.value);
    if (!Number.isNaN(index) && !addedOtherIndexes.includes(index)) {
      setAddedOtherIndexes((prev) => [...prev, index]);
    }
    e.target.value = "";
  };

  const removeGivingCategory = (index: number) => {
    updateLines(index, 0);
    setAddedOtherIndexes((prev) => prev.filter((i) => i !== index));
  };

  const toggleRemember = () => {
    dispatch({ type: MpesaActionEnum.SWITCH_SAVE });
    if (state.save) window.localStorage.removeItem(STORAGE_KEY);
  };

  // Validate the contact fields whenever they change.
  useEffect(() => {
    dispatch({
      type: MpesaActionEnum.CHANGE_NAME_ERROR,
      payload: state.name.trim() === "" ? "Name is a required field!" : "",
    });
    dispatch({
      type: MpesaActionEnum.CHANGE_PHONE_ERROR,
      payload:
        state.phone.trim() === ""
          ? "Phone Number is a required field! i.e 07xxxxxxxx"
          : !ValidatePhoneNumber(state.phone.trim())
            ? "Invalid Phone Number!"
            : "",
    });
    dispatch({
      type: MpesaActionEnum.CHANGE_EMAIL_ERROR,
      payload: state.email.trim() !== "" && !ValidateEmail(state.email.trim()) ? "Invalid Email Address!" : "",
    });
  }, [state.name, state.phone, state.email]);

  // On first load: greet, restore remembered details, and fetch the form options.
  useEffect(() => {
    Messages.setAlert(
      "Welcome to our enhanced giving experience! Enjoy a smoother, and more impactful way to support the work of God.",
      { position: "top-center" },
    );
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedDetails>;
        dispatch({
          type: MpesaActionEnum.RESET,
          payload: {
            ...initData,
            name: saved.name ?? "",
            phone: saved.phone ?? "",
            email: saved.email ?? "",
            unit: saved.unit ?? "",
            save: true,
          },
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    // These only set state after their network call resolves, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTypes();
    loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setShowInstructions(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showInstructions]);

  const indexedPayTypes = (payTypes ?? []).map((payType, index) => ({ ...payType, index }));
  const fixedPayTypes = indexedPayTypes.filter(isFixedPayType);
  const otherPayTypes = indexedPayTypes.filter((p) => !isFixedPayType(p));
  const addedOtherPayTypes = otherPayTypes.filter((p) => addedOtherIndexes.includes(p.index));
  const availableOtherPayTypes = otherPayTypes.filter((p) => !addedOtherIndexes.includes(p.index));
  const total = (state.total ?? 0).toFixed(2);

  const amountInput = (payType: (typeof indexedPayTypes)[number]) => (
    <GivingInputComponent
      min={0}
      type="number"
      placeholder="0"
      value={state.lines?.[payType.index]?.amount}
      name={payType.code}
      displayName={payType.description}
      onChange={(e) => updateLines(payType.index, e.target.value)}
    />
  );

  return (
    <div className="flex flex-col flex-grow lg:min-h-screen bg-gray-50">
      <section className="relative w-full overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-top bg-fixed"
          style={{ backgroundImage: `url(${Constants.IMAGE_BASE_URL}/kcc/Resources/giving-kcc-back.jpg)` }}
          // style={{ backgroundImage: `./giving.jpg` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon-950/20 via-maroon-900/40 to-maroon-800/10" />
        <div className="relative z-10 max-w-lg mx-auto px-6 pt-14 pb-16 sm:pt-16 sm:pb-20 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo-white.svg" width={160} height={80} alt="Karen Community SDA logo" className="h-12 w-auto" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">Give with a cheerful heart</h1>
          <p className="mt-4 text-gray-50/90 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Support the church&apos;s tithes, offerings, development, church budget&hellip; in a few taps, right from
            your phone.
          </p>
        </div>
      </section>

      <div className="relative z-20 flex flex-col items-center px-4 pb-16 -mt-8 sm:-mt-10">
        <div className="w-full max-w-md sm:max-w-lg">
          <form
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 relative"
            onSubmit={submitForm}
          >
            {/* <FormUtils loading={loading} success={success} successMessage={SUCCESS_MESSAGE} /> */}

            {page === 1 && (
              <div className="flex flex-col gap-y-3">
                <GivingInputComponent
                  type="text"
                  value={state.name}
                  error={state.name_error}
                  name="Name"
                  autoComplete="name"
                  onChange={(e) => dispatch({ type: MpesaActionEnum.CHANGE_NAME, payload: e.target.value })}
                />
                <GivingInputComponent
                  type="tel"
                  value={state.phone}
                  error={state.phone_error}
                  name="Phone No."
                  autoComplete="tel"
                  onChange={(e) => dispatch({ type: MpesaActionEnum.CHANGE_PHONE, payload: e.target.value })}
                />
                <GivingInputComponent
                  type="email"
                  value={state.email}
                  error={state.email_error}
                  name="Email"
                  displayName="Email (optional)"
                  autoComplete="email"
                  onChange={(e) => dispatch({ type: MpesaActionEnum.CHANGE_EMAIL, payload: e.target.value })}
                />
                <div className="flex flex-col gap-y-1">
                  <label htmlFor="church-unit" className="text-sm font-medium text-gray-700">
                    Church Unit (optional)
                  </label>
                  <select
                    id="church-unit"
                    value={state.unit}
                    onChange={(e) => dispatch({ type: MpesaActionEnum.CHANGE_UNIT, payload: e.target.value })}
                    className="block px-3 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent"
                  >
                    <option value="">Select Church Unit &hellip;</option>
                    {churchUnits?.map((unit) => (
                      <option key={unit.id} value={unit.pk}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Switch checked={state.save} text="Remember me" setEnabled={toggleRemember} />
                <div className="pt-3">
                  <PrimarySubmitButton
                    type="button"
                    text="Next"
                    onClick={moveNext}
                    icon={<MdNavigateNext />}
                    className="w-full md:w-auto bg-maroon-900 hover:bg-maroon-950"
                  />
                </div>
              </div>
            )}

            {page === 2 && (
              <div className="flex flex-col gap-y-3">
                <div>
                  <TextFormButton
                    text="Go Back"
                    type="button"
                    onClick={() => setPage(1)}
                    icon={<MdNavigateBefore />}
                    reverse
                    className="px-0 rounded-none"
                  />
                </div>

                <p className="text-sm text-gray-500 -mt-1">Every amount below is optional — give as you&apos;re led.</p>

                {fixedPayTypes.map((payType) => (
                  <React.Fragment key={payType.code}>{amountInput(payType)}</React.Fragment>
                ))}

                {addedOtherPayTypes.length > 0 && (
                  <div className="flex flex-col gap-y-3 pt-1">
                    {addedOtherPayTypes.map((payType) => (
                      <div key={payType.code} className="flex items-end gap-2">
                        <div className="flex-1">{amountInput(payType)}</div>
                        <button
                          type="button"
                          aria-label={`Remove ${payType.description}`}
                          onClick={() => removeGivingCategory(payType.index)}
                          className="mb-4 text-gray-400 hover:text-maroon-600 transition-colors shrink-0"
                        >
                          <IoClose size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {availableOtherPayTypes.length > 0 && (
                  <div className="pt-1">
                    <label htmlFor="add-giving-category" className="block text-sm font-semibold text-gray-800 mb-2">
                      Add another giving category
                    </label>
                    <select
                      id="add-giving-category"
                      defaultValue=""
                      onChange={addGivingCategory}
                      className="block px-2.5 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-maroon-600"
                    >
                      <option value="" disabled>
                        Choose a category &hellip;
                      </option>
                      {availableOtherPayTypes.map((payType) => (
                        <option key={payType.code} value={payType.index}>
                          {payType.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4">
                  <PrimarySubmitButton
                    type="submit"
                    disabled={loading}
                    text={`Give KES ${total}`}
                    icon={loading && <Loader3 />}
                    className="w-full bg-maroon-900 hover:bg-maroon-950"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowInstructions(true)}
        aria-label="How giving with M-Pesa works"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-maroon-900 text-white shadow-lg hover:bg-maroon-950 transition-colors"
      >
        <HiOutlineInformationCircle size={26} />
      </button>

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInstructions(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-xl max-h-[85vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 text-maroon-700 font-bold">
                <HiOutlineInformationCircle className="w-6 h-6 shrink-0" />
                How giving with M-Pesa works
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-maroon-900 transition-colors shrink-0"
              >
                <IoClose size={22} />
              </button>
            </div>
            <ol className="list-decimal list-inside text-sm sm:text-base leading-6 pl-5 space-y-2">
              {GIVING_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default GivingForm;
