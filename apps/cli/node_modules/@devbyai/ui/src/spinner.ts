/**
 * DEVBYAI Spinner
 *
 * Lightweight spinner for loading states.
 * Uses ora under the hood but provides a consistent DEVBYAI API.
 */

import ora from "ora";

export interface SpinnerOptions {
  /** Text to display alongside the spinner */
  text: string;
  /** Spinner color */
  color?: "cyan" | "green" | "yellow" | "red" | "gray" | "white";
  /** Whether to enable the spinner (false = static text) */
  enabled?: boolean;
}

export class Spinner {
  private spinner: ReturnType<typeof ora>;
  private enabled: boolean;

  constructor(options: SpinnerOptions) {
    this.enabled = options.enabled !== false;
    this.spinner = ora({
      text: options.text,
      color: options.color || "cyan",
      stream: process.stderr,
      spinner: {
        frames: ["◐", "◓", "◑", "◒"],
        interval: 120,
      },
    }).stop();

    if (!this.enabled) {
      this.spinner.stop();
    }
  }

  /** Start the spinner */
  start(text?: string): this {
    if (this.enabled) {
      if (text) this.spinner.text = text;
      this.spinner.start();
    }
    return this;
  }

  /** Update spinner text */
  update(text: string): this {
    this.spinner.text = text;
    return this;
  }

  /** Stop with a success message */
  succeed(text?: string): this {
    if (this.enabled) {
      this.spinner.succeed(text);
    }
    return this;
  }

  /** Stop with an error message */
  fail(text?: string): this {
    if (this.enabled) {
      this.spinner.fail(text);
    }
    return this;
  }

  /** Stop with a warning message */
  warn(text?: string): this {
    if (this.enabled) {
      this.spinner.warn(text);
    }
    return this;
  }

  /** Stop the spinner */
  stop(): this {
    this.spinner.stop();
    return this;
  }

  /** Check if spinner is spinning */
  isSpinning(): boolean {
    return this.spinner.isSpinning;
  }
}

/**
 * Create a spinner instance.
 */
export function createSpinner(options: SpinnerOptions): Spinner {
  return new Spinner(options);
}
