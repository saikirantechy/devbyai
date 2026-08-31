import { DevByAIConfig } from '@devbyai/config';
import { ModelProvider, ModelMessage } from '@devbyai/models';
import { ToolRegistry } from '@devbyai/tools';

/**
 * DEVBYAI Pipeline Phases
 *
 * Each phase represents a stage in the development workflow.
 */
declare enum Phase {
    Explore = "explore",
    Plan = "plan",
    Build = "build",
    Review = "review",
    Research = "research",
    Test = "test",
    Deploy = "deploy",
    Ship = "ship"
}
interface PhaseResult {
    phase: Phase;
    success: boolean;
    output: string;
    duration: number;
}
interface PhaseHandler {
    phase: Phase;
    execute(context: PipelineContext): Promise<PhaseResult>;
}
interface PipelineContext {
    /** The user's original request */
    request: string;
    /** Working directory */
    cwd: string;
    /** Accumulated results from previous phases */
    results: PhaseResult[];
    /** Whether to stop after the current phase */
    shouldStop: boolean;
}
interface PipelineConfig {
    /** Phases to run, in order */
    phases: Phase[];
    /** Phases that require user approval before executing */
    requireApproval: Phase[];
}
/**
 * The default pipeline: EXPLORE → PLAN → BUILD → REVIEW → TEST → SHIP
 */
declare const DEFAULT_PIPELINE: PipelineConfig;
/**
 * Run a pipeline of phases.
 */
declare function runPipeline(handlers: PhaseHandler[], context: PipelineContext, config: PipelineConfig): Promise<PhaseResult[]>;

/**
 * DEVBYAI Orchestrator
 *
 * The heart of DEVBYAI. Manages user requests, pipeline execution,
 * and coordinates between models, tools, and phases.
 */

interface OrchestratorOptions {
    config: DevByAIConfig;
    provider: ModelProvider;
    tools: ToolRegistry;
    cwd: string;
}
interface OrchestratorResult {
    success: boolean;
    phases: PhaseResult[];
    totalDuration: number;
}
declare class Orchestrator {
    private config;
    private provider;
    private tools;
    private cwd;
    constructor(options: OrchestratorOptions);
    /**
     * Execute a user request through the pipeline.
     */
    execute(request: string): Promise<OrchestratorResult>;
    /**
     * Process a single message with the AI model (for interactive mode).
     */
    chat(messages: ModelMessage[]): Promise<string>;
    private buildPipelineConfig;
    private buildPhaseHandlers;
    private createExploreHandler;
    private createPlanHandler;
    private createBuildHandler;
    private createReviewHandler;
    private createTestHandler;
    private createShipHandler;
}

export { DEFAULT_PIPELINE, Orchestrator, type OrchestratorOptions, type OrchestratorResult, Phase, type PhaseHandler, type PhaseResult, type PipelineConfig, type PipelineContext, runPipeline };
