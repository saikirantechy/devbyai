/**
 * DEVBYAI Orchestrator
 *
 * The heart of DEVBYAI. Manages user requests, pipeline execution,
 * and coordinates between models, tools, and phases.
 */

import type { DevByAIConfig } from "@devbyai/config";
import type { ModelMessage, ModelProvider } from "@devbyai/models";
import type { ToolRegistry } from "@devbyai/tools";
import {
  DEFAULT_PIPELINE,
  Phase,
  type PhaseHandler,
  type PhaseResult,
  type PipelineConfig,
  type PipelineContext,
  runPipeline,
} from "./pipeline.js";

export interface OrchestratorOptions {
  config: DevByAIConfig;
  provider: ModelProvider;
  tools: ToolRegistry;
  cwd: string;
}

export interface OrchestratorResult {
  success: boolean;
  phases: PhaseResult[];
  totalDuration: number;
}

export class Orchestrator {
  private config: DevByAIConfig;
  private provider: ModelProvider;
  private tools: ToolRegistry;
  private cwd: string;

  constructor(options: OrchestratorOptions) {
    this.config = options.config;
    this.provider = options.provider;
    this.tools = options.tools;
    this.cwd = options.cwd;
  }

  /**
   * Execute a user request through the pipeline.
   */
  async execute(request: string): Promise<OrchestratorResult> {
    const start = Date.now();

    const context: PipelineContext = {
      request,
      cwd: this.cwd,
      results: [],
      shouldStop: false,
    };

    const pipelineConfig = this.buildPipelineConfig();
    const handlers = this.buildPhaseHandlers();
    const results = await runPipeline(handlers, context, pipelineConfig);

    return {
      success: results.every((r) => r.success),
      phases: results,
      totalDuration: Date.now() - start,
    };
  }

  /**
   * Process a single message with the AI model (for interactive mode).
   */
  async chat(messages: ModelMessage[]): Promise<string> {
    const response = await this.provider.generate(messages);
    return response.content;
  }

  private buildPipelineConfig(): PipelineConfig {
    return {
      phases: [...DEFAULT_PIPELINE.phases],
      requireApproval: [...DEFAULT_PIPELINE.requireApproval],
    };
  }

  private buildPhaseHandlers(): PhaseHandler[] {
    return [
      this.createExploreHandler(),
      this.createPlanHandler(),
      this.createBuildHandler(),
      this.createReviewHandler(),
      this.createTestHandler(),
      this.createShipHandler(),
    ];
  }

  private createExploreHandler(): PhaseHandler {
    return {
      phase: Phase.Explore,
      async execute(context): Promise<PhaseResult> {
        return {
          phase: Phase.Explore,
          success: true,
          output: `[EXPLORE] Analyzing workspace at ${context.cwd}... Ready.`,
          duration: 0,
        };
      },
    };
  }

  private createPlanHandler(): PhaseHandler {
    return {
      phase: Phase.Plan,
      async execute(context): Promise<PhaseResult> {
        return {
          phase: Phase.Plan,
          success: true,
          output: `[PLAN] Planning implementation for: "${context.request}"`,
          duration: 0,
        };
      },
    };
  }

  private createBuildHandler(): PhaseHandler {
    return {
      phase: Phase.Build,
      async execute(_context): Promise<PhaseResult> {
        return {
          phase: Phase.Build,
          success: true,
          output: "[BUILD] Implementation phase ready. (v0.1.0: mock mode)",
          duration: 0,
        };
      },
    };
  }

  private createReviewHandler(): PhaseHandler {
    return {
      phase: Phase.Review,
      async execute(_context): Promise<PhaseResult> {
        return {
          phase: Phase.Review,
          success: true,
          output: "[REVIEW] No issues detected. (v0.1.0: mock mode)",
          duration: 0,
        };
      },
    };
  }

  private createTestHandler(): PhaseHandler {
    return {
      phase: Phase.Test,
      async execute(_context): Promise<PhaseResult> {
        return {
          phase: Phase.Test,
          success: true,
          output: "[TEST] Tests passed. (v0.1.0: mock mode)",
          duration: 0,
        };
      },
    };
  }

  private createShipHandler(): PhaseHandler {
    return {
      phase: Phase.Ship,
      async execute(context): Promise<PhaseResult> {
        const summary = context.results
          .map((r) => `  ${r.success ? "✓" : "✗"} ${r.phase}: ${r.output.split("\n")[0]}`)
          .join("\n");
        return {
          phase: Phase.Ship,
          success: true,
          output: `[SHIP] Task complete.\n${summary}`,
          duration: 0,
        };
      },
    };
  }
}
