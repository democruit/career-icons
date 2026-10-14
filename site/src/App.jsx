import { useState } from "react";
import {
  AtsPassIcon,
  CareerIconsProvider,
  LaidOffIcon,
  ResumeIcon,
  SalaryRangeIcon,
  VideoInterviewIcon,
} from "../../dist/react/index.js";

const icons = [
  { name: "Resume", motion: "Lines draw in", Icon: ResumeIcon },
  { name: "ATS pass", motion: "Check draws", Icon: AtsPassIcon },
  { name: "Video interview", motion: "Person pops", Icon: VideoInterviewIcon },
  { name: "Salary range", motion: "Handles slide apart", Icon: SalaryRangeIcon },
  { name: "Laid off", motion: "Box wiggles", Icon: LaidOffIcon },
];

const providerSample = `import "@democruit/career-icons/animations.css";
import { CareerIconsProvider, ResumeIcon } from "@democruit/career-icons/react";

<CareerIconsProvider size={32} animate="hover" color="#2563EB">
  <ResumeIcon />
</CareerIconsProvider>`;

const hoverSample = `<button type="button" className="ci-hover">
  <ResumeIcon animate="hover" />
  Save resume
</button>`;

export function App() {
  const capture = new URLSearchParams(window.location.search).has("capture");
  const [preview, setPreview] = useState(capture);

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
        <h1>Animation preview</h1>
        <p className="lede">
          Icons inherit color, take defaults from <code>CareerIconsProvider</code>, and stay still
          until <code>animations.css</code> is imported.
        </p>
      </header>
      <main>
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
          <CareerIconsProvider size={64} animate={preview ? "always" : "none"} color="#0f172a">
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
