import { CustomError } from "../utils/CustomError.ts";

export class AuthenticationError extends CustomError {
  statusCode = 401;
  constructor() {
    super("Authentication error");
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
  serialize(): { success: boolean; message: string } {
    return { success: false, message: "Authentication error" };
  }
}
