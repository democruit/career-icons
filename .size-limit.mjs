import { readdirSync } from "node:fs";

const names = readdirSync(new URL("./icons/", import.meta.url))
  .filter((name) => name.endsWith(".svg"))
  .map((name) => name.slice(0, -4))
  .sort();

export default [
  { path: "dist/animations.css", limit: "3 kB", gzip: true },
  ...names.map((name) => {
    const component = `${name
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join("")}Icon`;
    return {
      name: `${component} including shared React runtime`,
      path: "dist/react/index.js",
      import: `{ ${component} }`,
      ignore: ["react"],
      limit: "1 kB",
      gzip: true,
    };
  }),
];
