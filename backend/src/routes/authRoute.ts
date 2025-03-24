import { Router } from "express";
import { login, loginFacebookUser, loginGoogleUser, registerUser, changeProfilePicture } from "../controllers/authController.ts";
import { verifyJWT } from "../services/jwt.ts";

const router: Router = Router();
// router.post("/login", loginUser)
router.post("/login", login);
router.post("/login-facebook", loginFacebookUser);
router.post("/login-google", loginGoogleUser);
router.post("/change-profile-picture", verifyJWT, changeProfilePicture);
router.post("/register", registerUser);

export default router;
