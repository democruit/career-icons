import { icons, version } from "../dist/index.js";
import { animationPlan } from "../scripts/animation-plan.mjs";

const gallery = document.querySelector("#gallery");
const controls = Object.fromEntries(
  ["mode", "size", "reduced", "dark", "search"].map((id) => [id, document.getElementById(id)]),
);
const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
const items = icons.map((icon) => {
  const plan = animationPlan[icon.name];
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ci-hover";
  button.dataset.icon = icon.name;
  const sample = document.createElement("span");
  sample.className = "sample";
  // Package-owned, validated SVG artwork; no user markup enters this surface.
  sample.innerHTML = icon.svg;
  const svg = sample.querySelector("svg");
  svg.setAttribute("aria-hidden", "true");
  button.append(sample);
  for (const [className, text] of [
    ["name", icon.name],
    ["motion", icon.animation],
    ["description", plan.description],
  ]) {
    const label = document.createElement("span");
    label.className = className;
    label.textContent = text;
    button.append(label);
  }
  item.append(button);
  gallery.append(item);
  return { icon, plan, item, svg };
});

function update() {
  const query = controls.search.value.trim().toLowerCase();
  let count = 0;
  for (const { icon, plan, item, svg } of items) {
    item.hidden = ![
      icon.name,
      icon.title,
      icon.animation,
      plan.description,
      ...icon.tags,
      ...icon.aliases,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
    if (!item.hidden) count++;
    if (controls.mode.value === "none") svg.removeAttribute("data-ci-animate");
    else svg.setAttribute("data-ci-animate", controls.mode.value);
    svg.setAttribute("width", controls.size.value);
    svg.setAttribute("height", controls.size.value);
  }
  document.documentElement.dataset.ciReduced = String(controls.reduced.checked);
  document.documentElement.dataset.dark = String(controls.dark.checked);
  document.getElementById("status").textContent =
    `${count} / ${icons.length} icons · v${version} · ${controls.reduced.checked || preference.matches ? "Reduced motion active" : "Motion enabled"}`;
}
for (const control of Object.values(controls)) control.addEventListener("input", update);
preference.addEventListener("change", update);
update();
