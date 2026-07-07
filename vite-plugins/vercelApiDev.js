import { loadEnv } from "vite";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function augmentResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
  };
  return res;
}

// Lets `npm run dev` serve /api/*.js the same way Vercel's Node serverless
// runtime would (req.query, req.body, res.status().json()), so the exact
// same handler files run locally and in production — no vercel CLI needed.
export function vercelApiDevPlugin() {
  return {
    name: "vercel-api-dev-middleware",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) {
          next();
          return;
        }

        const [pathPart, queryString] = req.url.split("?");
        const fnName = pathPart.replace("/api/", "").split("/")[0];

        let mod;
        try {
          mod = await server.ssrLoadModule(`/api/${fnName}.js`);
        } catch (err) {
          next(err);
          return;
        }
        if (!mod?.default) {
          next();
          return;
        }

        req.query = Object.fromEntries(new URLSearchParams(queryString || ""));

        if (req.method !== "GET" && req.method !== "HEAD") {
          const raw = await readBody(req);
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = {};
          }
        }

        augmentResponse(res);
        try {
          await mod.default(req, res);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
