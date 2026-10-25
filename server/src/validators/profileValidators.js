const {
  body,
} = require("express-validator");

const updateProfileValidation = [
  body("headline")
    .optional()
    .isLength({ max: 255 })
    .withMessage(
      "Headline is too long"
    ),

  body("bio")
    .optional()
    .isLength({ max: 5000 })
    .withMessage(
      "Bio is too long"
    ),

  body("website")
    .optional({
      values: "falsy",
    })
    .isURL()
    .withMessage(
      "Invalid website URL"
    ),

  body("linkedinUrl")
    .optional({
      values: "falsy",
    })
    .isURL()
    .withMessage(
      "Invalid LinkedIn URL"
    ),

  body("githubUrl")
    .optional({
      values: "falsy",
    })
    .isURL()
    .withMessage(
      "Invalid GitHub URL"
    ),
];

module.exports = {
  updateProfileValidation,
};