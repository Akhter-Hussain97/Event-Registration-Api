const express = require("express");
const router = express.Router();

const {
  registerUser,
  cancelRegistration
} = require("../controllers/registrationController");

router.post("/", registerUser);
router.delete("/:id", cancelRegistration);

module.exports = router;