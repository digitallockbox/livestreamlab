const authController = require("../controllers/authController");

module.exports = [
	{ method: "GET", path: "/auth/:provider/start", handler: authController.providerStart },
	{ method: "GET", path: "/auth/:provider/callback", handler: authController.providerCallback },
	{ method: "POST", path: "/auth/phantom", handler: authController.phantomLogin },
	{ method: "POST", path: "/auth/login", handler: authController.login },
	{ method: "GET", path: "/auth/session", handler: authController.session },
	{ method: "POST", path: "/auth/logout", handler: authController.logout },
];
