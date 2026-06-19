const http = require("http");
const { URL } = require("url");
const { verifyToken } = require("./services/authService");

const feedRoutes = require("./routes/feed");
const systemRoutes = require("./routes/system");
const analyticsRoutes = require("./routes/analytics");
const streamRoutes = require("./routes/stream");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const web3Routes = require("./routes/web3");

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
  ...web3Routes,
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
    redirect(location, statusCode = 302) {
      res.writeHead(statusCode, { Location: location });
      res.end();
    },
  };
}

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
}

function parseUser(headers) {
  const auth = headers.authorization || headers.Authorization;
  if (!auth || typeof auth !== "string") return null;
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return verifyToken(token);
}

const server = http.createServer(async (req, res) => {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

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
      headers: req.headers,
      user: parseUser(req.headers),
    };

    const resContext = createResponse(res);

    if (route.roles && !reqContext.user) {
      return resContext.status(401).json({ error: "Unauthorized" });
    }

    if (route.roles && reqContext.user && !route.roles.includes(reqContext.user.role)) {
      return resContext.status(403).json({ error: "Forbidden" });
    }

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
