import { Router } from "express";
import { getAllUsers, getMessages, sendMessage, readMessage } from "../controllers/messageController.ts";
import { verifyJWT } from "../services/jwt.ts";

const router: Router = Router();
router.get("/get-all-users", verifyJWT, getAllUsers);
router.post("/get-messages", verifyJWT, getMessages);
router.post("/send-message", verifyJWT, sendMessage);
router.post("/read-message", verifyJWT, readMessage);

export default router;
