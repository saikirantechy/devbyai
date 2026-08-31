// src/pipeline.ts
var Phase = /* @__PURE__ */ ((Phase2) => {
  Phase2["Explore"] = "explore";
  Phase2["Plan"] = "plan";
  Phase2["Build"] = "build";
  Phase2["Review"] = "review";
  Phase2["Research"] = "research";
  Phase2["Test"] = "test";
  Phase2["Deploy"] = "deploy";
  Phase2["Ship"] = "ship";
  return Phase2;
})(Phase || {});
var DEFAULT_PIPELINE = {
  phases: ["explore" /* Explore */, "plan" /* Plan */, "build" /* Build */, "review" /* Review */, "test" /* Test */, "ship" /* Ship */],
  requireApproval: ["build" /* Build */]
};
async function runPipeline(handlers, context, config) {
  const results = [];
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
        duration: Date.now() - start
      });
      context.shouldStop = true;
    }
  }
  return results;
}

// src/orchestrator.ts
var Orchestrator = class {
  config;
  provider;
  tools;
  cwd;
  constructor(options) {
    this.config = options.config;
    this.provider = options.provider;
    this.tools = options.tools;
    this.cwd = options.cwd;
  }
  /**
   * Execute a user request through the pipeline.
   */
  async execute(request) {
    const start = Date.now();
    const context = {
      request,
      cwd: this.cwd,
      results: [],
      shouldStop: false
    };
    const pipelineConfig = this.buildPipelineConfig();
    const handlers = this.buildPhaseHandlers();
    const results = await runPipeline(handlers, context, pipelineConfig);
    return {
      success: results.every((r) => r.success),
      phases: results,
      totalDuration: Date.now() - start
    };
  }
  /**
   * Process a single message with the AI model (for interactive mode).
   */
  async chat(messages) {
    const response = await this.provider.generate(messages);
    return response.content;
  }
  buildPipelineConfig() {
    return {
      phases: [...DEFAULT_PIPELINE.phases],
      requireApproval: [...DEFAULT_PIPELINE.requireApproval]
    };
  }
  buildPhaseHandlers() {
    return [
      this.createExploreHandler(),
      this.createPlanHandler(),
      this.createBuildHandler(),
      this.createReviewHandler(),
      this.createTestHandler(),
      this.createShipHandler()
    ];
  }
  createExploreHandler() {
    return {
      phase: "explore" /* Explore */,
      async execute(context) {
        return {
          phase: "explore" /* Explore */,
          success: true,
          output: `[EXPLORE] Analyzing workspace at ${context.cwd}... Ready.`,
          duration: 0
        };
      }
    };
  }
  createPlanHandler() {
    return {
      phase: "plan" /* Plan */,
      async execute(context) {
        return {
          phase: "plan" /* Plan */,
          success: true,
          output: `[PLAN] Planning implementation for: "${context.request}"`,
          duration: 0
        };
      }
    };
  }
  createBuildHandler() {
    return {
      phase: "build" /* Build */,
      async execute(_context) {
        return {
          phase: "build" /* Build */,
          success: true,
          output: "[BUILD] Implementation phase ready. (v0.1.0: mock mode)",
          duration: 0
        };
      }
    };
  }
  createReviewHandler() {
    return {
      phase: "review" /* Review */,
      async execute(_context) {
        return {
          phase: "review" /* Review */,
          success: true,
          output: "[REVIEW] No issues detected. (v0.1.0: mock mode)",
          duration: 0
        };
      }
    };
  }
  createTestHandler() {
    return {
      phase: "test" /* Test */,
      async execute(_context) {
        return {
          phase: "test" /* Test */,
          success: true,
          output: "[TEST] Tests passed. (v0.1.0: mock mode)",
          duration: 0
        };
      }
    };
  }
  createShipHandler() {
    return {
      phase: "ship" /* Ship */,
      async execute(context) {
        const summary = context.results.map((r) => `  ${r.success ? "\u2713" : "\u2717"} ${r.phase}: ${r.output.split("\n")[0]}`).join("\n");
        return {
          phase: "ship" /* Ship */,
          success: true,
          output: `[SHIP] Task complete.
${summary}`,
          duration: 0
        };
      }
    };
  }
};
export {
  DEFAULT_PIPELINE,
  Orchestrator,
  Phase,
  runPipeline
};
