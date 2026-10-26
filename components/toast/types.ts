export interface ToastParameterType {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}

export enum ToastType {
  INFO = "INFO",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  ALERT = "ALERT",
}

export interface MessageType {
  index: number;
  type: ToastType;
  message: string;
}
