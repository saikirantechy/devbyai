/**
 * @devbyai/ui
 *
 * Design system and visual components for DEVBYAI CLI.
 */

// Symbols and status indicators
export { symbols, status } from "./symbols.js";

// Spinners
export { Spinner, createSpinner } from "./spinner.js";
export type { SpinnerOptions } from "./spinner.js";

// Pipeline visualization
export { renderPipeline, PipelineProgress, createPipeline } from "./pipeline.js";
export type { PhaseStatus, PipelineStep } from "./pipeline.js";

// Logo
export { renderLogo, renderTagline, renderIdentity } from "./logo.js";
export type { LogoSize } from "./logo.js";

// Banner
export { renderBanner, printBanner, renderStatusLine } from "./banner.js";
export type { BannerOptions } from "./banner.js";

// Welcome screen
export { renderWelcome, printWelcome, renderSessionHeader } from "./welcome.js";
export type { WelcomeOptions } from "./welcome.js";

// Section and layout
export { sectionHeader, divider, doubleDivider, bullet, keyValue, blank } from "./section.js";

// Workspace display
export { detectWorkspace, renderWorkspace, printWorkspace } from "./workspace.js";
export type { WorkspaceInfo, WorkspaceFeature } from "./workspace.js";
