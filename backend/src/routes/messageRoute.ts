import { Router } from "express";
import { getAllUsers, getMessages, sendMessage } from "../controllers/messageController.ts";
import { verifyJWT } from "../services/jwt.ts";

const router: Router = Router();
router.get("/get-all-users", verifyJWT, getAllUsers);
router.post("/get-messages", verifyJWT, getMessages);
router.post("/send-message", verifyJWT, sendMessage);

export default router;
