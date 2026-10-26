import type { MpesaLineType, MpesaType } from "@data/types";

export enum MpesaActionEnum {
  CHANGE_NAME = "change_name",
  CHANGE_NAME_ERROR = "change_name_error",
  CHANGE_PHONE = "change_phone",
  CHANGE_PHONE_ERROR = "change_phone_error",
  CHANGE_EMAIL = "change_email",
  CHANGE_EMAIL_ERROR = "change_email_error",
  CHANGE_UNIT = "change_unit",
  CHANGE_LINES = "change_lines",
  SWITCH_SAVE = "switch_save",
  RESET = "reset",
}

type TextAction = {
  type:
    | MpesaActionEnum.CHANGE_NAME
    | MpesaActionEnum.CHANGE_NAME_ERROR
    | MpesaActionEnum.CHANGE_PHONE
    | MpesaActionEnum.CHANGE_PHONE_ERROR
    | MpesaActionEnum.CHANGE_EMAIL
    | MpesaActionEnum.CHANGE_EMAIL_ERROR
    | MpesaActionEnum.CHANGE_UNIT;
  payload: string;
};
type LinesAction = { type: MpesaActionEnum.CHANGE_LINES; payload: (MpesaLineType | undefined)[] };
type SaveAction = { type: MpesaActionEnum.SWITCH_SAVE };
type ResetAction = { type: MpesaActionEnum.RESET; payload: MpesaType };

export type MpesaAction = TextAction | LinesAction | SaveAction | ResetAction;

const calculateTotal = (lines: (MpesaLineType | undefined)[]): number =>
  lines.reduce<number>((total, line) => {
    const amount = Number(line?.amount);
    return total + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);

export function MpesaReducer(state: MpesaType, action: MpesaAction): MpesaType {
  switch (action.type) {
    case MpesaActionEnum.CHANGE_NAME:
      return { ...state, name: action.payload, name_error: undefined, errored: false };
    case MpesaActionEnum.CHANGE_NAME_ERROR:
      return { ...state, name_error: action.payload, errored: true };
    case MpesaActionEnum.CHANGE_PHONE:
      return { ...state, phone: action.payload, phone_error: undefined, errored: false };
    case MpesaActionEnum.CHANGE_PHONE_ERROR:
      return { ...state, phone_error: action.payload, errored: true };
    case MpesaActionEnum.CHANGE_EMAIL:
      return { ...state, email: action.payload, email_error: undefined, errored: false };
    case MpesaActionEnum.CHANGE_EMAIL_ERROR:
      return { ...state, email_error: action.payload, errored: true };
    case MpesaActionEnum.CHANGE_UNIT:
      return { ...state, unit: action.payload };
    case MpesaActionEnum.CHANGE_LINES:
      return {
        ...state,
        lines: [...action.payload] as MpesaLineType[],
        total: calculateTotal(action.payload),
        errored: false,
      };
    case MpesaActionEnum.SWITCH_SAVE:
      return { ...state, save: !state.save };
    case MpesaActionEnum.RESET:
      return { ...action.payload };
    default:
      return state;
  }
}
