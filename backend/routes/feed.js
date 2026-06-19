const feedController = require("../controllers/feedController");

module.exports = [
	{ method: "GET", path: "/feed", handler: feedController.getFeed },
];
