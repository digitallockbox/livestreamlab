const http = require("http");
const { URL } = require("url");

const feedRoutes = require("./routes/feed");
const systemRoutes = require("./routes/system");
const analyticsRoutes = require("./routes/analytics");
const streamRoutes = require("./routes/stream");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const PORT = Number(process.env.BACKEND_PORT || 4000);

const routes = [
  {
    method: "GET",
    path: "/",
    handler: async (_req, res) => {
      res.json({
        service: "livestreamlab-backend",
        status: "ok",
        uptime: process.uptime(),
      });
    },
  },
  ...feedRoutes,
  ...systemRoutes,
  ...analyticsRoutes,
  ...streamRoutes,
  ...authRoutes,
  ...userRoutes,
];

function parseBody(rawBody) {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function matchRoute(routePath, incomingPath) {
  const routeParts = routePath.split("/").filter(Boolean);
  const incomingParts = incomingPath.split("/").filter(Boolean);

  if (routeParts.length !== incomingParts.length) {
    return null;
  }

  const params = {};
  for (let index = 0; index < routeParts.length; index += 1) {
    const routePart = routeParts[index];
    const incomingPart = incomingParts[index];

    if (routePart.startsWith(":")) {
      params[routePart.slice(1)] = decodeURIComponent(incomingPart);
      continue;
    }

    if (routePart !== incomingPart) {
      return null;
    }
  }

  return params;
}

function createResponse(res) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      res.writeHead(this.statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    },
  };
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  const pathName = requestUrl.pathname;

  const route = routes.find((candidate) => {
    if (candidate.method !== req.method) return false;
    return matchRoute(candidate.path, pathName) !== null;
  });

  if (!route) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
    return;
  }

  const params = matchRoute(route.path, pathName) || {};
  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += chunk;
  });

  req.on("end", async () => {
    const reqContext = {
      method: req.method,
      params,
      query: Object.fromEntries(requestUrl.searchParams.entries()),
      body: parseBody(rawBody),
    };

    const resContext = createResponse(res);

    try {
      await route.handler(reqContext, resContext, (error) => {
        throw error;
      });
    } catch (error) {
      console.error(error);
      if (!res.writableEnded) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
