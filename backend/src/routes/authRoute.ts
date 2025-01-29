import { Router } from "express";
import { loginFacebookUser, loginGoogleUser } from "../controllers/authController.ts"

const router: Router = Router();
// router.post("/login", loginUser)
router.post("/login-facebook", loginFacebookUser)
router.post("/login-google", loginGoogleUser)
// router.post("/sign-up", signUpUser)

export default router;
