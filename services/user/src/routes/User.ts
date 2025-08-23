import express from "express"
import { getMyProfile, getUserProfile, login, updateProfilePic, updateUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();


router.post("/login",login);
router.get("/profile",isAuth,getMyProfile);
router.get("/user/:id",getUserProfile);
router.post("/user/update",isAuth,updateUser);
router.post("/user/update/pic",isAuth,uploadFile,updateProfilePic);

export default router;