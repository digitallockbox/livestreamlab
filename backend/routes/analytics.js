const analyticsController = require("../controllers/analyticsController");

module.exports = [
	{ method: "GET", path: "/analytics/overview", handler: analyticsController.getOverview },
	{ method: "GET", path: "/analytics/streamAnalytics", handler: analyticsController.getStreamAnalytics },
	{ method: "GET", path: "/analytics/contentAnalytics", handler: analyticsController.getContentAnalytics },
];
