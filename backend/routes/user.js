const userController = require("../controllers/userController");

module.exports = [
	{ method: "GET", path: "/user/profile/:id", handler: userController.getProfile, roles: ["admin", "creator"] },
	{ method: "PATCH", path: "/user/profile/:id", handler: userController.updateProfile, roles: ["admin", "creator"] },
];
