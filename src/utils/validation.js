const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateProfileData = (req) => {
  const userEditedFields = req.body;
  const allowedProfileEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "age",
    "gender",
    "skills",
    "about",
  ];

  const isValidatedProfileData = Object.keys(userEditedFields).every((key) =>
    allowedProfileEditFields.includes(key),
  );

  return isValidatedProfileData;
};

module.exports = { validateSignupData, validateProfileData };
