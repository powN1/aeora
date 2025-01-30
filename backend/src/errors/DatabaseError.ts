import { CustomError } from "../utils/CustomError.ts";

export class DatabaseError extends CustomError {
  statusCode = 500;
  constructor() {
    super("Database error");
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
  serialize(): { success: boolean; message: string } {
    return { success: false, message: "Database error" };
  }
}
