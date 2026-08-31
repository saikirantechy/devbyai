/**
 * DEVBYAI Symbol Set
 *
 * Consistent symbols for the CLI with ASCII fallbacks.
 */
declare const symbols: {
    success: string;
    error: string;
    warning: string;
    running: string;
    waiting: string;
    progress: string;
    bullet: string;
    arrow: string;
    line: string;
    doubleLine: string;
    corner: {
        topLeft: string;
        topRight: string;
        bottomLeft: string;
        bottomRight: string;
        vertical: string;
        horizontal: string;
    };
};
declare const status: {
    success: (text?: string) => string;
    error: (text?: string) => string;
    warning: (text?: string) => string;
    running: (text?: string) => string;
    waiting: (text?: string) => string;
    info: (text?: string) => string;
};

/**
 * DEVBYAI Spinner
 *
 * Lightweight spinner for loading states.
 * Uses ora under the hood but provides a consistent DEVBYAI API.
 */
interface SpinnerOptions {
    /** Text to display alongside the spinner */
    text: string;
    /** Spinner color */
    color?: "cyan" | "green" | "yellow" | "red" | "gray" | "white";
    /** Whether to enable the spinner (false = static text) */
    enabled?: boolean;
}
declare class Spinner {
    private spinner;
    private enabled;
    constructor(options: SpinnerOptions);
    /** Start the spinner */
    start(text?: string): this;
    /** Update spinner text */
    update(text: string): this;
    /** Stop with a success message */
    succeed(text?: string): this;
    /** Stop with an error message */
    fail(text?: string): this;
    /** Stop with a warning message */
    warn(text?: string): this;
    /** Stop the spinner */
    stop(): this;
    /** Check if spinner is spinning */
    isSpinning(): boolean;
}
/**
 * Create a spinner instance.
 */
declare function createSpinner(options: SpinnerOptions): Spinner;

/**
 * DEVBYAI Pipeline Renderer
 *
 * Visual pipeline progress display for development phases.
 */
type PhaseStatus = "complete" | "running" | "waiting" | "error";
interface PipelineStep {
    /** Phase name */
    name: string;
    /** Current status */
    status: PhaseStatus;
    /** Optional detail message */
    detail?: string;
}
/**
 * Render the full pipeline visualization.
 */
declare function renderPipeline(steps: PipelineStep[]): string;
/**
 * Create a pipeline progress tracker.
 *
 * Usage:
 * ```ts
 * const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD"]);
 * pipeline.start("EXPLORE");
 * // ... do work ...
 * pipeline.complete("EXPLORE");
 * pipeline.start("PLAN");
 * // ... do work ...
 * pipeline.complete("PLAN");
 * console.log(pipeline.render());
 * ```
 */
declare class PipelineProgress {
    private steps;
    private details;
    constructor(phaseNames: string[]);
    /** Mark a phase as running */
    start(name: string): void;
    /** Mark a phase as complete */
    complete(name: string, detail?: string): void;
    /** Mark a phase as error */
    error(name: string, detail?: string): void;
    /** Get current status of a phase */
    getStatus(name: string): PhaseStatus | undefined;
    /** Check if all phases are complete */
    isComplete(): boolean;
    /** Render the pipeline as a string */
    render(): string;
    /** Print the pipeline to console */
    print(): void;
}
/**
 * Create a new pipeline progress tracker.
 */
declare function createPipeline(phaseNames: string[]): PipelineProgress;

/**
 * DEVBYAI Logo
 *
 * Unique ASCII identity for the DEVBYAI terminal experience.
 * Responsive: adapts to terminal width.
 */
type LogoSize = "large" | "medium" | "small" | "auto";
/**
 * Render the DEVBYAI logo.
 */
declare function renderLogo(size?: LogoSize, color?: "cyan" | "white"): string;
/**
 * Render the DEVBYAI tagline.
 */
declare function renderTagline(): string;
/**
 * Render the full DEVBYAI identity block (logo + tagline).
 */
declare function renderIdentity(size?: LogoSize): string;

/**
 * DEVBYAI Banner
 *
 * Enhanced banner with workspace information and brand identity.
 */
interface BannerOptions {
    /** Show workspace info below banner */
    workspace?: string;
    /** Show version */
    version?: string;
    /** Show current model */
    model?: string;
    /** Compact mode (no extra info) */
    compact?: boolean;
}
/**
 * Render the DEVBYAI banner.
 */
declare function renderBanner(options?: BannerOptions): string;
/**
 * Print the DEVBYAI banner to console.
 */
declare function printBanner(options?: BannerOptions): void;
/**
 * Render a compact status banner for inline use.
 */
declare function renderStatusLine(options: {
    version?: string;
    model?: string;
    workspace?: string;
}): string;

/**
 * DEVBYAI Welcome Screen
 *
 * Premium first-launch experience for the DEVBYAI interactive terminal.
 */
interface WelcomeOptions {
    version: string;
    provider: string;
    model: string;
    compact?: boolean;
}
/**
 * Render the DEVBYAI welcome screen.
 */
declare function renderWelcome(options: WelcomeOptions): string;
/**
 * Print the welcome screen.
 */
declare function printWelcome(options: WelcomeOptions): void;
/**
 * Render a compact session header.
 */
declare function renderSessionHeader(options: {
    workspace: string;
    provider: string;
    version: string;
}): string;

/**
 * DEVBYAI Section Components
 *
 * Section headers, dividers, and layout helpers.
 */
/**
 * Render a section header with decorative line.
 *
 * Example: "  ── WORKSPACE ──────────────────────────"
 */
declare function sectionHeader(title: string, width?: number): string;
/**
 * Render a divider line.
 */
declare function divider(width?: number): string;
/**
 * Render a double divider (for major sections).
 */
declare function doubleDivider(width?: number): string;
/**
 * Render an indented item with a bullet.
 */
declare function bullet(text: string, indent?: number): string;
/**
 * Render a key-value pair.
 */
declare function keyValue(key: string, value: string, indent?: number): string;
/**
 * Render a blank line.
 */
declare function blank(): string;

/**
 * DEVBYAI Workspace Display
 *
 * Displays workspace information in a structured format.
 */
interface WorkspaceInfo {
    /** Directory name */
    name: string;
    /** Full path */
    path: string;
    /** Detected features */
    features: WorkspaceFeature[];
}
interface WorkspaceFeature {
    /** Feature name */
    name: string;
    /** Whether detected */
    detected: boolean;
    /** Optional detail */
    detail?: string;
}
/**
 * Detect workspace information.
 */
declare function detectWorkspace(cwd: string): WorkspaceInfo;
/**
 * Render workspace information.
 */
declare function renderWorkspace(info: WorkspaceInfo): string;
/**
 * Print workspace info to console.
 */
declare function printWorkspace(info: WorkspaceInfo): void;

export { type BannerOptions, type LogoSize, type PhaseStatus, PipelineProgress, type PipelineStep, Spinner, type SpinnerOptions, type WelcomeOptions, type WorkspaceFeature, type WorkspaceInfo, blank, bullet, createPipeline, createSpinner, detectWorkspace, divider, doubleDivider, keyValue, printBanner, printWelcome, printWorkspace, renderBanner, renderIdentity, renderLogo, renderPipeline, renderSessionHeader, renderStatusLine, renderTagline, renderWelcome, renderWorkspace, sectionHeader, status, symbols };
