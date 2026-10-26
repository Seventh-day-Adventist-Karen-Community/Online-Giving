export type MpesaLineType = {
  code: string;
  amount: number | string;
};

export type MpesaType = {
  name: string;
  name_error?: string;
  phone: string;
  phone_error?: string;
  email: string;
  email_error?: string;
  /** Selected church unit: the raw integer primary key, kept as a string by the <select>. */
  unit: string;
  lines?: MpesaLineType[];
  total?: number;
  errored: boolean;
  save: boolean;
};

export type ChurchUnitType = {
  /** Relay global ID (base64 "TypeName:pk"), used as the React key. */
  id: string;
  name: string;
  /** Raw integer primary key, which is what the `unit: Int` mutation input expects. */
  pk: number;
};

export type PaymentType = {
  code: string;
  sequenceNo: number;
  description: string;
  name: string;
};

export type InitiatedPaymentType = {
  id: string;
  externalReference: string;
  reference: string;
  state: "INITIATED" | "FAILED" | "COMPLETED";
  ResultDescription: string;
};

export type PaidTransactionLineType = {
  code: string;
  amount: number;
  description: string;
  name: string;
};

export type PaidTransactionType = {
  no: string;
  name: string;
  phone: string;
  email: string;
  reference: string;
  externalReference: string;
  createdAt: string;
  paymentMode: string;
  lines: PaidTransactionLineType[];
  amount: number;
};

/** Server actions return this instead of throwing, because Next hides thrown messages in production. */
export type ActionResult<T> = { result: T; error?: undefined } | { result?: undefined; error: string };
