import { CustomError } from "../utils/CustomError.ts";

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor() {
    super("Bad request");
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  serialize(): { success: boolean; message: string } {
    return { success: false, message: "Bad request" };
  }
}
