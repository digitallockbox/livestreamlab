const authController = require("../controllers/authController");

module.exports = [
	{ method: "POST", path: "/auth/login", handler: authController.login },
	{ method: "POST", path: "/auth/logout", handler: authController.logout },
];
