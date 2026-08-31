/**
 * DEVBYAI Pipeline Phases
 *
 * Each phase represents a stage in the development workflow.
 */

export enum Phase {
  Explore = "explore",
  Plan = "plan",
  Build = "build",
  Review = "review",
  Research = "research",
  Test = "test",
  Deploy = "deploy",
  Ship = "ship",
}

export interface PhaseResult {
  phase: Phase;
  success: boolean;
  output: string;
  duration: number;
}

export interface PhaseHandler {
  phase: Phase;
  execute(context: PipelineContext): Promise<PhaseResult>;
}

export interface PipelineContext {
  /** The user's original request */
  request: string;
  /** Working directory */
  cwd: string;
  /** Accumulated results from previous phases */
  results: PhaseResult[];
  /** Whether to stop after the current phase */
  shouldStop: boolean;
}

export interface PipelineConfig {
  /** Phases to run, in order */
  phases: Phase[];
  /** Phases that require user approval before executing */
  requireApproval: Phase[];
}

/**
 * The default pipeline: EXPLORE → PLAN → BUILD → REVIEW → TEST → SHIP
 */
export const DEFAULT_PIPELINE: PipelineConfig = {
  phases: [Phase.Explore, Phase.Plan, Phase.Build, Phase.Review, Phase.Test, Phase.Ship],
  requireApproval: [Phase.Build],
};

/**
 * Run a pipeline of phases.
 */
export async function runPipeline(
  handlers: PhaseHandler[],
  context: PipelineContext,
  config: PipelineConfig,
): Promise<PhaseResult[]> {
  const results: PhaseResult[] = [];

  for (const phase of config.phases) {
    if (context.shouldStop) break;

    const handler = handlers.find((h) => h.phase === phase);
    if (!handler) continue;

    const start = Date.now();
    try {
      const result = await handler.execute({ ...context, results });
      results.push({ ...result, duration: Date.now() - start });
    } catch (err) {
      results.push({
        phase,
        success: false,
        output: `Error: ${err instanceof Error ? err.message : String(err)}`,
        duration: Date.now() - start,
      });
      // Stop pipeline on error
      context.shouldStop = true;
    }
  }

  return results;
}
