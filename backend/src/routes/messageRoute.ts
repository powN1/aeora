import { Router } from "express";
import { getAllUsers, getMessages, deleteMessage, sendMessage, readMessage, reactToMessage, deleteDemoMessages } from "../controllers/messageController.ts";
import { verifyJWT } from "../services/jwt.ts";

const router: Router = Router();
router.post("/delete-message", verifyJWT, deleteMessage);
router.post("/delete-demo-messages", deleteDemoMessages);
router.get("/get-all-users", verifyJWT, getAllUsers);
router.post("/get-messages", verifyJWT, getMessages);
router.post("/react-to-message", verifyJWT, reactToMessage);
router.post("/read-message", verifyJWT, readMessage);
router.post("/send-message", verifyJWT, sendMessage);

export default router;
