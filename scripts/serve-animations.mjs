import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
export function serveAnimations(port = 5199) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const path = resolve(root, `.${pathname === "/" ? "/docs/animations.html" : pathname}`);
      if (!path.startsWith(`${root}${sep}`)) {
        response.writeHead(403).end();
        return;
      }
      response.writeHead(200, {
        "Content-Type": `${types[extname(path)] ?? "application/octet-stream"}; charset=utf-8`,
      });
      response.end(await readFile(path));
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((resolveServer) => {
    server.listen(port, "127.0.0.1", () => resolveServer(server));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await serveAnimations();
  console.log("Motion review: http://127.0.0.1:5199/docs/animations.html");
}
