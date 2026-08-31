/**
 * DEVBYAI Symbol Set
 *
 * Consistent symbols for the CLI with ASCII fallbacks.
 */

import chalk from "chalk";

// Detect terminal capabilities
const isCI = process.env.CI === "true";
const noColor = process.env.NO_COLOR === "1" || process.env.FORCE_COLOR === "0";
// Most modern terminals on Windows support Unicode (Windows Terminal, PowerShell, etc.)
// Only fall back to ASCII if explicitly in CI or NO_COLOR is set
const supportsUnicode = !isCI;

// Use Unicode symbols where supported, ASCII fallbacks otherwise
const useUnicode = supportsUnicode && !noColor;

export const symbols = {
  success: useUnicode ? "✓" : "[OK]",
  error: useUnicode ? "✗" : "[ERR]",
  warning: useUnicode ? "⚠" : "[WARN]",
  running: useUnicode ? "●" : "[*]",
  waiting: useUnicode ? "○" : "[ ]",
  progress: useUnicode ? "◉" : "[...]",
  bullet: useUnicode ? "◆" : "*",
  arrow: useUnicode ? "▸" : ">",
  line: useUnicode ? "─" : "-",
  doubleLine: useUnicode ? "═" : "=",
  corner: {
    topLeft: useUnicode ? "╭" : "+",
    topRight: useUnicode ? "╮" : "+",
    bottomLeft: useUnicode ? "╰" : "+",
    bottomRight: useUnicode ? "╯" : "+",
    vertical: useUnicode ? "│" : "|",
    horizontal: useUnicode ? "─" : "-",
  },
};

// Color-aware status symbols
export const status = {
  success: (text?: string) => {
    const sym = chalk.green(symbols.success);
    return text ? `${sym} ${text}` : sym;
  },
  error: (text?: string) => {
    const sym = chalk.red(symbols.error);
    return text ? `${sym} ${text}` : sym;
  },
  warning: (text?: string) => {
    const sym = chalk.yellow(symbols.warning);
    return text ? `${sym} ${text}` : sym;
  },
  running: (text?: string) => {
    const sym = chalk.cyan(symbols.running);
    return text ? `${sym} ${text}` : sym;
  },
  waiting: (text?: string) => {
    const sym = chalk.gray(symbols.waiting);
    return text ? `${sym} ${text}` : sym;
  },
  info: (text?: string) => {
    const sym = chalk.cyan(symbols.arrow);
    return text ? `${sym} ${text}` : sym;
  },
};
