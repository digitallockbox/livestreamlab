const userController = require("../controllers/userController");

module.exports = [
	{ method: "GET", path: "/user/profile/:id", handler: userController.getProfile },
	{ method: "PATCH", path: "/user/profile/:id", handler: userController.updateProfile },
];
