import { CustomError } from "../utils/CustomError.ts";

export class InternalServerError extends CustomError {
  statusCode = 500;
  constructor() {
    super("An unexpected error occurred. Please try again later.");
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
  serialize(): { success: boolean; message: string } {
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}
