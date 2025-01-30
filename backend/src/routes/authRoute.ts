import { Router } from "express";
import { login, loginFacebookUser, loginGoogleUser, registerUser } from "../controllers/authController.ts";

const router: Router = Router();
// router.post("/login", loginUser)
router.post("/login", login);
router.post("/login-facebook", loginFacebookUser);
router.post("/login-google", loginGoogleUser);
router.post("/register", registerUser);

export default router;
