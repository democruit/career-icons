import { useState } from "react";
import { icons as collection } from "../../dist/index.js";
import * as components from "../../dist/react/index.js";
import {
  AtsPassIcon,
  CareerIconsProvider,
  LaidOffIcon,
  ResumeIcon,
  SalaryRangeIcon,
  VideoInterviewIcon,
} from "../../dist/react/index.js";

import { searchIcons } from "./catalog.mjs";

const icons = [
  { name: "Resume", motion: "Lines draw in", Icon: ResumeIcon },
  { name: "ATS pass", motion: "Check draws", Icon: AtsPassIcon },
  { name: "Video interview", motion: "Person pops", Icon: VideoInterviewIcon },
  { name: "Salary range", motion: "Handles slide apart", Icon: SalaryRangeIcon },
  { name: "Laid off", motion: "Box wiggles", Icon: LaidOffIcon },
];

const providerSample = `import "@democruit-labs/career-icons/animations.css";
import { CareerIconsProvider, ResumeIcon } from "@democruit-labs/career-icons/react";

<CareerIconsProvider size={32} animate="hover" color="#2563EB">
  <ResumeIcon />
</CareerIconsProvider>`;

const hoverSample = `<button type="button" className="ci-hover">
  <ResumeIcon animate="hover" />
  Save resume
</button>`;

const strokeStops = [1, 1.25, 1.5, 1.75, 2];
const categories = [...new Set(collection.map((icon) => icon.category))].sort();
const categoryLabel = (category) => category.replaceAll("-", " ");

function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState(24);
  const [dark, setDark] = useState(false);
  const matches = searchIcons(collection, search, category);
  return (
    <section aria-labelledby="catalog-heading">
      <div className="section-row">
        <h2 id="catalog-heading">Browse all {collection.length} icons</h2>
        <a href="#usage-heading">React usage</a>
      </div>
      <div className="catalog-controls">
        <label className="search-field">
          Search icons
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Resume, interview, compensation…"
          />
        </label>
        <div className="catalog-field">
          <label htmlFor="catalog-category">Category</label>
          <select
            id="catalog-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {categoryLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="catalog-field">
          <label htmlFor="catalog-size">Preview size</label>
          <select
            id="catalog-size"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          >
            {[16, 24, 48].map((value) => (
              <option key={value} value={value}>
                {value}px
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="toggle"
          aria-pressed={dark}
          onClick={() => setDark((value) => !value)}
        >
          Dark background
        </button>
      </div>
      <p role="status" aria-live="polite">
        {matches.length} of {collection.length} icons
      </p>
      {matches.length ? (
        <ul className={`icon-gallery${dark ? " icon-gallery-dark" : ""}`} aria-label="Icon results">
          {matches.map((icon) => {
            const name = `${icon.name
              .split("-")
              .map((part) => part[0].toUpperCase() + part.slice(1))
              .join("")}Icon`;
            // biome-ignore lint/performance/noDynamicNamespaceImportAccess: The catalog intentionally displays every icon.
            const Icon = components[name];
            return (
              <li key={icon.name}>
                <div className="icon-sample">
                  <Icon size={size} strokeWidth={2} aria-hidden="true" />
                </div>
                <span>{icon.title}</span>
                <small>{icon.name}</small>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No icons match. Try a broader search or another category.</p>
      )}
    </section>
  );
}

export function App() {
  const capture = new URLSearchParams(window.location.search).has("capture");
  const [preview, setPreview] = useState(capture);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [absoluteStrokeWidth, setAbsoluteStrokeWidth] = useState(false);

  if (capture) {
    return (
      <main className="capture">
        <h1>Pilot animations</h1>
        <CareerIconsProvider size={96} animate="always" color="#0f172a">
          <IconList />
        </CareerIconsProvider>
      </main>
    );
  }

  return (
    <>
      <header className="site-header">
        <p className="brand">
          <a href="https://democruit.com">Democruit</a> career icons
        </p>
        <h1>60 icons for your next career move.</h1>
        <p className="lede">
          Original outline icons for resumes, job applications, interviews and everything that
          follows. A 24px grid, friendly 2px strokes and ten career categories.
        </p>
      </header>
      <main>
        <Catalog />
        <section aria-labelledby="preview-heading">
          <div className="section-row">
            <h2 id="preview-heading">Pilot icons</h2>
            <button
              type="button"
              className="toggle"
              aria-pressed={preview}
              onClick={() => setPreview((value) => !value)}
            >
              Preview animations
            </button>
          </div>
          <div className="controls">
            <fieldset className="stroke-picker">
              <legend>Stroke width</legend>
              {strokeStops.map((stop) => (
                <label key={stop}>
                  <input
                    type="radio"
                    name="stroke-width"
                    value={stop}
                    checked={strokeWidth === stop}
                    onChange={() => setStrokeWidth(stop)}
                  />
                  {stop}
                </label>
              ))}
            </fieldset>
            <button
              type="button"
              className="toggle"
              aria-pressed={absoluteStrokeWidth}
              onClick={() => setAbsoluteStrokeWidth((value) => !value)}
            >
              absoluteStrokeWidth
            </button>
          </div>
          <CareerIconsProvider
            size={64}
            strokeWidth={strokeWidth}
            absoluteStrokeWidth={absoluteStrokeWidth}
            animate={preview ? "always" : "none"}
            color="#0f172a"
          >
            <IconList />
          </CareerIconsProvider>
        </section>

        <section aria-labelledby="color-heading">
          <h2 id="color-heading">Color inheritance</h2>
          <p>
            Stroke stays <code>currentColor</code>. A parent button color paints the icon. The{" "}
            <code>color</code> prop overrides that.
          </p>
          <div className="button-row">
            <button type="button" className="save">
              <ResumeIcon aria-hidden="true" />
              Save resume
            </button>
            <button type="button" className="save save-quiet">
              <ResumeIcon aria-hidden="true" color="#2563EB" />
              Accent icon
            </button>
          </div>
        </section>

        <section aria-labelledby="usage-heading">
          <h2 id="usage-heading">React usage</h2>
          <p>
            Install <code>@democruit-labs/career-icons</code>, then import individual icons from the
            React entry.
          </p>
          <pre>
            <code>{`npm install @democruit-labs/career-icons\n\nimport { ResumeIcon } from "@democruit-labs/career-icons/react";\n\n<ResumeIcon size={24} aria-label="Resume" />`}</code>
          </pre>
          <p>
            Icons inherit the parent color. Use <code>aria-hidden="true"</code> alongside a text
            label, or provide an accessible label for a meaningful standalone icon.
          </p>
        </section>

        <section aria-labelledby="provider-heading">
          <h2 id="provider-heading">Provider</h2>
          <p>Prop values win over the provider, which wins over the built-in defaults.</p>
          <pre>
            <code>{providerSample}</code>
          </pre>
        </section>

        <section aria-labelledby="hover-heading">
          <h2 id="hover-heading">Hover a parent</h2>
          <p>
            <code>animate="hover"</code> runs once on the icon or any ancestor with{" "}
            <code>ci-hover</code>.
          </p>
          <div className="ci-hover card">
            <p>Hover this card</p>
            <ul className="stage stage-compact">
              {icons.map(({ name, Icon }) => (
                <li key={name}>
                  <Icon aria-hidden="true" animate="hover" size={40} />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
          <pre>
            <code>{hoverSample}</code>
          </pre>
        </section>
      </main>
      <footer>
        Built by <a href="https://democruit.com">Democruit</a>
      </footer>
    </>
  );
}

function IconList() {
  return (
    <ul className="stage">
      {icons.map(({ name, motion, Icon }) => (
        <li key={name}>
          <Icon aria-hidden="true" />
          <span>{name}</span>
          <small>{motion}</small>
        </li>
      ))}
    </ul>
  );
}
