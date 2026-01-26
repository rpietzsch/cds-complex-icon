import React from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
import * as CarbonIcons from "@carbon/icons-react";

const html = htm.bind(React.createElement);

const iconNames = Object.keys(CarbonIcons)
  .filter((name) => {
    if (name === "default") return false;
    const value = CarbonIcons[name];
    return typeof value === "function" || (value && typeof value === "object");
  })
  .sort((a, b) => a.localeCompare(b));

const sizeOptions = [16, 20, 24, 32];
const positions = [
  { value: "NW", label: "North-West" },
  { value: "N", label: "North" },
  { value: "NE", label: "North-East" },
  { value: "W", label: "West" },
  null,
  { value: "E", label: "East" },
  { value: "SW", label: "South-West" },
  { value: "S", label: "South" },
  { value: "SE", label: "South-East" },
];

const positionVector = (pos, offset) => {
  const map = {
    N: [0, -offset],
    NE: [offset, -offset],
    E: [offset, 0],
    SE: [offset, offset],
    S: [0, offset],
    SW: [-offset, offset],
    W: [-offset, 0],
    NW: [-offset, -offset],
  };

  return map[pos] || [0, -offset];
};

const IconPicker = ({ label, value, onChange }) => {
  const [query, setQuery] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const matches = iconNames.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const limited = matches.slice(0, 60);

  const handleSelect = (name) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((prev) => Math.min(prev + 1, limited.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const choice = limited[highlight];
      if (choice) handleSelect(choice);
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return html`
    <label className="field picker">
      <span>${label}</span>
      <input
        value=${query}
        onInput=${(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus=${() => setOpen(true)}
        onBlur=${() => setTimeout(() => setOpen(false), 120)}
        onKeyDown=${handleKeyDown}
        placeholder="Start typing an icon name"
        aria-autocomplete="list"
        aria-expanded=${open}
      />
      ${open
        ? html`
            <div className="picker-list" role="listbox">
              ${limited.length === 0
                ? html`<div className="picker-empty">No matches</div>`
                : limited.map((name, index) => {
                    const Icon = CarbonIcons[name];
                    return html`
                      <button
                        key=${name}
                        type="button"
                        className=${`picker-item ${index === highlight ? "is-active" : ""}`}
                        role="option"
                        aria-selected=${value === name}
                        onMouseDown=${() => handleSelect(name)}
                      >
                        <span className="picker-icon">
                          ${Icon ? html`<${Icon} size=${18} />` : null}
                        </span>
                        <span>${name}</span>
                      </button>
                    `;
                  })}
            </div>
          `
        : null}
    </label>
  `;
};

const ColorInput = ({ label, value, onChange, disabled }) => html`
  <label className="field">
    <span>${label}</span>
    <input
      type="color"
      value=${value}
      onInput=${(event) => onChange(event.target.value)}
      disabled=${disabled}
    />
  </label>
`;

const PositionPad = ({ value, onChange }) => html`
  <div
    className="position-pad"
    role="radiogroup"
    aria-label="Secondary icon position"
  >
    ${positions.map((pos, index) =>
      pos
        ? html`
            <button
              key=${pos.value}
              type="button"
              className=${`pos-btn ${value === pos.value ? "is-active" : ""}`}
              aria-pressed=${value === pos.value}
              onClick=${() => onChange(pos.value)}
              title=${pos.label}
            >
              ${pos.label
                .split("-")
                .map((chunk) => chunk[0])
                .join("")}
            </button>
          `
        : html`<div
            key=${`spacer-${index}`}
            className="pos-spacer"
            aria-hidden="true"
          ></div>`,
    )}
  </div>
`;

const App = () => {
  const [mainIcon, setMainIcon] = React.useState("Add");
  const [secondaryIcon, setSecondaryIcon] = React.useState("Checkmark");
  const [mainSize, setMainSize] = React.useState(32);
  const [secondarySize, setSecondarySize] = React.useState(20);
  const [position, setPosition] = React.useState("NE");
  const [gap, setGap] = React.useState(0);
  const [mainColor, setMainColor] = React.useState("#0f62fe");
  const [secondaryColor, setSecondaryColor] = React.useState("#0f62fe");
  const [linkColors, setLinkColors] = React.useState(true);
  const [showSecondary, setShowSecondary] = React.useState(true);

  const MainIcon = CarbonIcons[mainIcon];
  const SecondaryIcon = CarbonIcons[secondaryIcon];

  const offset = mainSize / 2 + Number(gap);
  const [dx, dy] = positionVector(position, offset);

  const handleMainColor = (value) => {
    setMainColor(value);
    if (linkColors) {
      setSecondaryColor(value);
    }
  };

  const handleLinkColors = (next) => {
    setLinkColors(next);
    if (next) {
      setSecondaryColor(mainColor);
    }
  };

  const configPreview = {
    main: mainIcon,
    secondary: showSecondary ? secondaryIcon : null,
    sizes: { main: mainSize, secondary: secondarySize },
    colors: {
      main: mainColor,
      secondary: linkColors ? mainColor : secondaryColor,
    },
    position,
    gap,
  };

  return html`
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Carbon Complex Icon Builder</p>
          <h1>Combine two Carbon icons into a context-specific button icon.</h1>
          <p className="lede">
            Pick a main icon and a smaller secondary marker. Adjust size,
            placement, and color to test how combined glyphs read in compact UI
            surfaces.
          </p>
        </div>
        <div className="hero-card">
          <div className="hero-preview">
            <div
              className="icon-stack"
              style=${{
                "--main-size": `${mainSize}px`,
                "--secondary-size": `${secondarySize}px`,
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
              }}
            >
              <div className="icon main">
                ${MainIcon
                  ? html`<${MainIcon}
                      size=${mainSize}
                      className="icon-svg"
                      style=${{
                        fill: mainColor,
                      }}
                    />`
                  : html`<div className="icon-missing">?</div>`}
              </div>
              ${showSecondary && SecondaryIcon
                ? html`
                    <div className="icon secondary">
                      <${SecondaryIcon}
                        size=${secondarySize}
                        className="icon-svg"
                        style=${{
                          fill: linkColors ? mainColor : secondaryColor,
                        }}
                      />
                    </div>
                  `
                : null}
            </div>
          </div>
          <div className="hero-meta">
            <span>${iconNames.length} Carbon icons available</span>
            <span>Secondary offset: ${offset}px</span>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="panel controls">
          <h2>Configure icons</h2>
          ${IconPicker({
            label: "Main icon",
            value: mainIcon,
            onChange: setMainIcon,
          })}
          ${IconPicker({
            label: "Secondary icon",
            value: secondaryIcon,
            onChange: setSecondaryIcon,
          })}

          <div className="row">
            <label className="field">
              <span>Main size</span>
              <select
                value=${mainSize}
                onChange=${(event) => setMainSize(Number(event.target.value))}
              >
                ${sizeOptions.map(
                  (size) =>
                    html`<option key=${size} value=${size}>${size}px</option>`,
                )}
              </select>
            </label>
            <label className="field">
              <span>Secondary size</span>
              <select
                value=${secondarySize}
                onChange=${(event) =>
                  setSecondarySize(Number(event.target.value))}
              >
                ${sizeOptions.map(
                  (size) =>
                    html`<option key=${size} value=${size}>${size}px</option>`,
                )}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Offset from edge (${gap}px)</span>
            <input
              type="range"
              min="-6"
              max="12"
              step="1"
              value=${gap}
              onInput=${(event) => setGap(event.target.value)}
            />
          </label>

          <label className="field inline">
            <input
              type="checkbox"
              checked=${showSecondary}
              onChange=${(event) => setShowSecondary(event.target.checked)}
            />
            <span>Show secondary icon</span>
          </label>

          <div className="row">
            ${ColorInput({
              label: "Main color",
              value: mainColor,
              onChange: handleMainColor,
            })}
            ${ColorInput({
              label: "Secondary color",
              value: secondaryColor,
              onChange: setSecondaryColor,
              disabled: linkColors,
            })}
          </div>
          <label className="field inline">
            <input
              type="checkbox"
              checked=${linkColors}
              onChange=${(event) => handleLinkColors(event.target.checked)}
            />
            <span>Link colors</span>
          </label>

          <div className="field">
            <span>Secondary position</span>
            ${PositionPad({ value: position, onChange: setPosition })}
          </div>

          <div className="picker-count">${iconNames.length} icons indexed</div>
        </section>

        <section className="panel preview">
          <div className="preview-header">
            <h2>Preview</h2>
            <p>
              Use this to validate weight, offset, and readibility at a glance.
            </p>
          </div>
          <div className="preview-grid">
            <div
              className="icon-stack large"
              style=${{
                "--main-size": `${mainSize}px`,
                "--secondary-size": `${secondarySize}px`,
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
              }}
            >
              <div className="icon main">
                ${MainIcon
                  ? html`<${MainIcon}
                      size=${mainSize}
                      className="icon-svg"
                      style=${{
                        fill: mainColor,
                      }}
                    />`
                  : html`<div className="icon-missing">?</div>`}
              </div>
              ${showSecondary && SecondaryIcon
                ? html`
                    <div className="icon secondary">
                      <${SecondaryIcon}
                        size=${secondarySize}
                        className="icon-svg"
                        style=${{
                          fill: linkColors ? mainColor : secondaryColor,
                        }}
                      />
                    </div>
                  `
                : null}
            </div>
            <div className="preview-notes">
              <h3>Configuration</h3>
              <pre>${JSON.stringify(configPreview, null, 2)}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
};

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);
