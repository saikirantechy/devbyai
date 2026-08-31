// src/symbols.ts
import chalk from "chalk";
var isCI = process.env.CI === "true";
var noColor = process.env.NO_COLOR === "1" || process.env.FORCE_COLOR === "0";
var supportsUnicode = !isCI;
var useUnicode = supportsUnicode && !noColor;
var symbols = {
  success: useUnicode ? "\u2713" : "[OK]",
  error: useUnicode ? "\u2717" : "[ERR]",
  warning: useUnicode ? "\u26A0" : "[WARN]",
  running: useUnicode ? "\u25CF" : "[*]",
  waiting: useUnicode ? "\u25CB" : "[ ]",
  progress: useUnicode ? "\u25C9" : "[...]",
  bullet: useUnicode ? "\u25C6" : "*",
  arrow: useUnicode ? "\u25B8" : ">",
  line: useUnicode ? "\u2500" : "-",
  doubleLine: useUnicode ? "\u2550" : "=",
  corner: {
    topLeft: useUnicode ? "\u256D" : "+",
    topRight: useUnicode ? "\u256E" : "+",
    bottomLeft: useUnicode ? "\u2570" : "+",
    bottomRight: useUnicode ? "\u256F" : "+",
    vertical: useUnicode ? "\u2502" : "|",
    horizontal: useUnicode ? "\u2500" : "-"
  }
};
var status = {
  success: (text) => {
    const sym = chalk.green(symbols.success);
    return text ? `${sym} ${text}` : sym;
  },
  error: (text) => {
    const sym = chalk.red(symbols.error);
    return text ? `${sym} ${text}` : sym;
  },
  warning: (text) => {
    const sym = chalk.yellow(symbols.warning);
    return text ? `${sym} ${text}` : sym;
  },
  running: (text) => {
    const sym = chalk.cyan(symbols.running);
    return text ? `${sym} ${text}` : sym;
  },
  waiting: (text) => {
    const sym = chalk.gray(symbols.waiting);
    return text ? `${sym} ${text}` : sym;
  },
  info: (text) => {
    const sym = chalk.cyan(symbols.arrow);
    return text ? `${sym} ${text}` : sym;
  }
};

// src/spinner.ts
import ora from "ora";
var Spinner = class {
  spinner;
  enabled;
  constructor(options) {
    this.enabled = options.enabled !== false;
    this.spinner = ora({
      text: options.text,
      color: options.color || "cyan",
      stream: process.stderr,
      spinner: {
        frames: ["\u25D0", "\u25D3", "\u25D1", "\u25D2"],
        interval: 120
      }
    }).stop();
    if (!this.enabled) {
      this.spinner.stop();
    }
  }
  /** Start the spinner */
  start(text) {
    if (this.enabled) {
      if (text) this.spinner.text = text;
      this.spinner.start();
    }
    return this;
  }
  /** Update spinner text */
  update(text) {
    this.spinner.text = text;
    return this;
  }
  /** Stop with a success message */
  succeed(text) {
    if (this.enabled) {
      this.spinner.succeed(text);
    }
    return this;
  }
  /** Stop with an error message */
  fail(text) {
    if (this.enabled) {
      this.spinner.fail(text);
    }
    return this;
  }
  /** Stop with a warning message */
  warn(text) {
    if (this.enabled) {
      this.spinner.warn(text);
    }
    return this;
  }
  /** Stop the spinner */
  stop() {
    this.spinner.stop();
    return this;
  }
  /** Check if spinner is spinning */
  isSpinning() {
    return this.spinner.isSpinning;
  }
};
function createSpinner(options) {
  return new Spinner(options);
}

// src/pipeline.ts
import chalk2 from "chalk";
function renderStep(step, maxWidth) {
  const name = step.name.padEnd(maxWidth);
  let indicator;
  let detail = "";
  switch (step.status) {
    case "complete":
      indicator = chalk2.green(symbols.success);
      break;
    case "running":
      indicator = chalk2.cyan(symbols.running);
      break;
    case "waiting":
      indicator = chalk2.gray(symbols.waiting);
      break;
    case "error":
      indicator = chalk2.red(symbols.error);
      break;
  }
  if (step.detail) {
    detail = chalk2.gray(` ${symbols.line} ${step.detail}`);
  }
  return `    ${indicator} ${chalk2.white(name)}${detail}`;
}
function renderPipeline(steps) {
  const maxNameLength = Math.max(...steps.map((s) => s.name.length));
  return steps.map((step) => renderStep(step, maxNameLength)).join("\n");
}
var PipelineProgress = class {
  steps = /* @__PURE__ */ new Map();
  details = /* @__PURE__ */ new Map();
  constructor(phaseNames) {
    for (const name of phaseNames) {
      this.steps.set(name, "waiting");
    }
  }
  /** Mark a phase as running */
  start(name) {
    this.steps.set(name, "running");
  }
  /** Mark a phase as complete */
  complete(name, detail) {
    this.steps.set(name, "complete");
    if (detail) this.details.set(name, detail);
  }
  /** Mark a phase as error */
  error(name, detail) {
    this.steps.set(name, "error");
    if (detail) this.details.set(name, detail);
  }
  /** Get current status of a phase */
  getStatus(name) {
    return this.steps.get(name);
  }
  /** Check if all phases are complete */
  isComplete() {
    return Array.from(this.steps.values()).every((s) => s === "complete" || s === "error");
  }
  /** Render the pipeline as a string */
  render() {
    const steps = Array.from(this.steps.entries()).map(([name, status2]) => ({
      name,
      status: status2,
      detail: this.details.get(name)
    }));
    return renderPipeline(steps);
  }
  /** Print the pipeline to console */
  print() {
    console.log(this.render());
  }
};
function createPipeline(phaseNames) {
  return new PipelineProgress(phaseNames);
}

// src/logo.ts
import chalk3 from "chalk";
var LOGO_LARGE = [
  "\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557",
  "\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551",
  "\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D \u255A\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551",
  "\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D  \u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557  \u255A\u2588\u2588\u2554\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551",
  "\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u255A\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551",
  "\u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D  \u255A\u2550\u2550\u2550\u255D  \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D"
];
var LOGO_MEDIUM = [
  "\u2554\u2566\u2557\u2554\u2550\u2557\u2554\u2566\u2557\u2566\u2550\u2557\u2566\u2554\u2550\u2557  \u2566  \u2566\u2554\u2550\u2557\u2566  \u2566 \u2566\u2554\u2550\u2557",
  " \u2551\u2551\u2551\u2563  \u2551 \u2560\u2566\u255D\u2551\u2560\u2550\u2563  \u255A\u2557\u2554\u255D\u2551 \u2551\u2551 \u2551\u2551\u2551\u2551\u2560\u2550\u255D",
  "\u2550\u2569\u255D\u255A\u2550\u255D \u2569 \u2569\u255A\u2550\u2569\u2569 \u2569   \u255A\u255D \u255A\u2550\u255D\u2569\u2550\u255D\u255A\u2569\u255D\u2569  "
];
var LOGO_SMALL = "DEVBYAI";
function getTerminalWidth() {
  return process.stdout.columns || 80;
}
function selectLogoSize(preferred) {
  if (preferred !== "auto") return preferred;
  const width = getTerminalWidth();
  if (width >= 60) return "large";
  if (width >= 40) return "medium";
  return "small";
}
function renderLogo(size = "auto", color) {
  const selected = selectLogoSize(size);
  const colorFn = color === "white" ? chalk3.bold.white : chalk3.bold.cyan;
  let lines;
  switch (selected) {
    case "large":
      lines = LOGO_LARGE.map((line) => colorFn(line));
      break;
    case "medium":
      lines = LOGO_MEDIUM.map((line) => colorFn(line));
      break;
    case "small":
      return colorFn(LOGO_SMALL);
  }
  const width = getTerminalWidth();
  const logoWidth = lines[0]?.length || 0;
  const padding = Math.max(0, Math.floor((width - logoWidth) / 2));
  return lines.map((line) => " ".repeat(padding) + line).join("\n");
}
function renderTagline() {
  const width = getTerminalWidth();
  const tagline = "From Idea to Production.";
  const padding = Math.max(0, Math.floor((width - tagline.length) / 2));
  return " ".repeat(padding) + chalk3.gray(tagline);
}
function renderIdentity(size = "auto") {
  const lines = [];
  lines.push(renderLogo(size));
  lines.push("");
  lines.push(renderTagline());
  return lines.join("\n");
}

// src/banner.ts
import chalk4 from "chalk";
function renderBanner(options = {}) {
  const lines = [];
  lines.push("");
  lines.push(
    chalk4.bold.cyan(
      `${symbols.corner.topLeft}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${symbols.corner.topRight}`
    )
  );
  lines.push(
    `${chalk4.bold.cyan(symbols.corner.vertical)}              ${chalk4.bold.white("DEVBYAI")}                       ${chalk4.bold.cyan(symbols.corner.vertical)}`
  );
  lines.push(
    `${chalk4.bold.cyan(symbols.corner.vertical)}              ${chalk4.gray("Dev By AI")}                     ${chalk4.bold.cyan(symbols.corner.vertical)}`
  );
  lines.push(
    `${chalk4.bold.cyan(symbols.corner.vertical)}                                          ${chalk4.bold.cyan(symbols.corner.vertical)}`
  );
  lines.push(
    `${chalk4.bold.cyan(symbols.corner.vertical)}    ${chalk4.gray("The Open Development Agent")}            ${chalk4.bold.cyan(symbols.corner.vertical)}`
  );
  lines.push(
    chalk4.bold.cyan(
      `${symbols.corner.bottomLeft}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${symbols.corner.bottomRight}`
    )
  );
  if (!options.compact) {
    if (options.version) {
      lines.push(`  ${chalk4.gray("Version:")} ${chalk4.cyan(options.version)}`);
    }
    if (options.model) {
      lines.push(`  ${chalk4.gray("Model:")} ${chalk4.white(options.model)}`);
    }
    if (options.workspace) {
      lines.push(
        `  ${chalk4.gray("Workspace:")} ${chalk4.green(symbols.success)} ${chalk4.white(options.workspace)}`
      );
    }
  }
  return lines.join("\n");
}
function printBanner(options = {}) {
  console.log(renderBanner(options));
}
function renderStatusLine(options) {
  const parts = [];
  if (options.version) parts.push(chalk4.cyan(`v${options.version}`));
  if (options.model) parts.push(chalk4.white(options.model));
  if (options.workspace) parts.push(chalk4.gray(options.workspace));
  return parts.join(`  ${chalk4.gray("\u2022")} `);
}

// src/welcome.ts
import chalk7 from "chalk";

// src/section.ts
import chalk5 from "chalk";
function sectionHeader(title, width = 50) {
  const prefix = "  ";
  const header = `\u2500\u2500 ${title.toUpperCase()} `;
  const remaining = Math.max(0, width - header.length - prefix.length);
  const line = symbols.line.repeat(remaining);
  return `${prefix}${chalk5.bold.white(header)}${chalk5.gray(line)}`;
}
function divider(width = 50) {
  return `  ${chalk5.gray(symbols.line.repeat(width))}`;
}
function doubleDivider(width = 50) {
  return `  ${chalk5.gray(symbols.doubleLine.repeat(width))}`;
}
function bullet(text, indent = 4) {
  const spaces = " ".repeat(indent);
  return `${spaces}${chalk5.gray(symbols.bullet)} ${text}`;
}
function keyValue(key, value, indent = 2) {
  const spaces = " ".repeat(indent);
  return `${spaces}${chalk5.gray(`${key}:`)} ${chalk5.white(value)}`;
}
function blank() {
  return "";
}

// src/workspace.ts
import { existsSync } from "fs";
import { resolve } from "path";
import chalk6 from "chalk";
function detectWorkspace(cwd) {
  const parts = cwd.replace(/\\/g, "/").split("/");
  const name = parts[parts.length - 1] || cwd;
  const features = [
    {
      name: "TypeScript",
      detected: existsSync(resolve(cwd, "tsconfig.json"))
    },
    {
      name: "pnpm",
      detected: existsSync(resolve(cwd, "pnpm-workspace.yaml")) || existsSync(resolve(cwd, "pnpm-lock.yaml"))
    },
    {
      name: "Git",
      detected: existsSync(resolve(cwd, ".git"))
    },
    {
      name: "Node.js",
      detected: existsSync(resolve(cwd, "package.json"))
    },
    {
      name: "Biome",
      detected: existsSync(resolve(cwd, "biome.json"))
    }
  ];
  return { name, path: cwd, features };
}
function renderWorkspace(info) {
  const lines = [];
  lines.push(sectionHeader("WORKSPACE"));
  lines.push("");
  lines.push(`    ${chalk6.white(info.name)} ${chalk6.gray(info.path)}`);
  lines.push("");
  for (const feature of info.features) {
    if (feature.detected) {
      const detail = feature.detail ? chalk6.gray(` ${symbols.line} ${feature.detail}`) : "";
      lines.push(`    ${chalk6.green(symbols.success)} ${chalk6.white(feature.name)}${detail}`);
    }
  }
  return lines.join("\n");
}
function printWorkspace(info) {
  console.log(renderWorkspace(info));
}

// src/welcome.ts
function getLogoSize() {
  const width = process.stdout.columns || 80;
  if (width >= 60) return "large";
  if (width >= 40) return "medium";
  return "small";
}
function renderWelcome(options) {
  const lines = [];
  const compact = options.compact || (process.stdout.columns || 80) < 50;
  lines.push(renderIdentity(getLogoSize()));
  lines.push("");
  lines.push(divider());
  lines.push("");
  if (compact) {
    lines.push(`  ${chalk7.white.bold("DEVBYAI")} ${chalk7.gray(`v${options.version}`)}`);
    lines.push(`  ${chalk7.gray("Ready.")}`);
  } else {
    lines.push(`  ${chalk7.white.bold("Welcome to DEVBYAI.")}`);
    lines.push(`  ${chalk7.gray("The open AI development environment for your terminal.")}`);
    lines.push("");
    lines.push(divider());
    lines.push("");
    const cwd = process.cwd();
    const workspace = detectWorkspace(cwd);
    lines.push(renderWelcomeWorkspace(workspace));
    lines.push("");
    lines.push(`  ${chalk7.bold.white("AI")}`);
    lines.push(`    ${chalk7.gray("Provider:")} ${chalk7.white(options.provider)}`);
    lines.push(`    ${chalk7.gray("Model:")}    ${chalk7.white(options.model)}`);
    lines.push(`    ${chalk7.gray("Status:")}   ${chalk7.green(`${symbols.running} Ready`)}`);
    lines.push("");
    lines.push(divider());
    lines.push("");
    lines.push(`  ${chalk7.bold.white("GET STARTED")}`);
    lines.push(`  ${chalk7.gray("Ask DEVBYAI anything about your project.")}`);
    lines.push("");
    lines.push(`    ${chalk7.cyan(symbols.bullet)} Explore your codebase`);
    lines.push(`    ${chalk7.cyan(symbols.bullet)} Plan a feature`);
    lines.push(`    ${chalk7.cyan(symbols.bullet)} Build something`);
    lines.push(`    ${chalk7.cyan(symbols.bullet)} Review code`);
    lines.push(`    ${chalk7.cyan(symbols.bullet)} Research solutions`);
    lines.push("");
    lines.push(divider());
  }
  return lines.join("\n");
}
function renderWelcomeWorkspace(info) {
  const lines = [];
  lines.push(`  ${chalk7.bold.white("Workspace")}`);
  lines.push(`    ${chalk7.green(symbols.success)} ${chalk7.white(info.name)}`);
  const detected = info.features.filter((f) => f.detected);
  if (detected.length > 0) {
    lines.push(`    ${chalk7.gray(detected.map((f) => f.name).join(" \u2022 "))}`);
  }
  return lines.join("\n");
}
function printWelcome(options) {
  console.log(renderWelcome(options));
}
function renderSessionHeader(options) {
  const lines = [];
  lines.push(
    `  ${chalk7.bold.white("DEVBYAI")} ${chalk7.gray("\u2022")} ${chalk7.gray("DEVELOPMENT SESSION")}`
  );
  lines.push(
    `  ${chalk7.gray("Workspace:")} ${chalk7.white(options.workspace)}  ${chalk7.gray("\u2022")}  ${chalk7.gray("Provider:")} ${chalk7.white(options.provider)}`
  );
  lines.push(divider());
  return lines.join("\n");
}
export {
  PipelineProgress,
  Spinner,
  blank,
  bullet,
  createPipeline,
  createSpinner,
  detectWorkspace,
  divider,
  doubleDivider,
  keyValue,
  printBanner,
  printWelcome,
  printWorkspace,
  renderBanner,
  renderIdentity,
  renderLogo,
  renderPipeline,
  renderSessionHeader,
  renderStatusLine,
  renderTagline,
  renderWelcome,
  renderWorkspace,
  sectionHeader,
  status,
  symbols
};
