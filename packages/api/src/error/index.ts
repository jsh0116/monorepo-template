export interface ResponseErrorData {
  errorCode: number;
  detail: string;
  extra?: string;
}

export enum ErrorType {
  NotConnted = 'NOT_CONNECTED',
}

export class ErrorData extends Error {
  errorType: ErrorType;
  data: ResponseErrorData;

  constructor(type: ErrorType, data: ResponseErrorData) {
    super(data.detail);
    this.errorType = type;
    this.data = data;
  }

  getData(): ResponseErrorData {
    return this.data;
  }
}
