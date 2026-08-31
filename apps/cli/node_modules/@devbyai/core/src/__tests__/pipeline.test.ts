import { describe, expect, it } from "vitest";
import { DEFAULT_PIPELINE, Phase, runPipeline } from "../pipeline.js";
import type { PhaseHandler, PipelineContext } from "../pipeline.js";

function createMockHandler(phase: Phase, output = "ok"): PhaseHandler {
  return {
    phase,
    async execute() {
      return { phase, success: true, output, duration: 0 };
    },
  };
}

function createContext(request = "test task"): PipelineContext {
  return {
    request,
    cwd: "/tmp/test",
    results: [],
    shouldStop: false,
  };
}

describe("Phase enum", () => {
  it("has all expected phases", () => {
    expect(Phase.Explore).toBe("explore");
    expect(Phase.Plan).toBe("plan");
    expect(Phase.Build).toBe("build");
    expect(Phase.Review).toBe("review");
    expect(Phase.Research).toBe("research");
    expect(Phase.Test).toBe("test");
    expect(Phase.Deploy).toBe("deploy");
    expect(Phase.Ship).toBe("ship");
  });
});

describe("DEFAULT_PIPELINE", () => {
  it("has phases in correct order", () => {
    expect(DEFAULT_PIPELINE.phases).toEqual([
      Phase.Explore,
      Phase.Plan,
      Phase.Build,
      Phase.Review,
      Phase.Test,
      Phase.Ship,
    ]);
  });

  it("requires approval for build phase", () => {
    expect(DEFAULT_PIPELINE.requireApproval).toContain(Phase.Build);
  });
});

describe("runPipeline", () => {
  it("executes phases in order", async () => {
    const handlers = [
      createMockHandler(Phase.Explore, "explored"),
      createMockHandler(Phase.Plan, "planned"),
      createMockHandler(Phase.Build, "built"),
    ];
    const config = {
      phases: [Phase.Explore, Phase.Plan, Phase.Build],
      requireApproval: [],
    };

    const results = await runPipeline(handlers, createContext(), config);

    expect(results).toHaveLength(3);
    expect(results[0].phase).toBe(Phase.Explore);
    expect(results[0].output).toBe("explored");
    expect(results[1].phase).toBe(Phase.Plan);
    expect(results[2].phase).toBe(Phase.Build);
  });

  it("stops on error", async () => {
    const handlers: PhaseHandler[] = [
      createMockHandler(Phase.Explore),
      {
        phase: Phase.Plan,
        async execute() {
          throw new Error("planning failed");
        },
      },
      createMockHandler(Phase.Build),
    ];
    const config = {
      phases: [Phase.Explore, Phase.Plan, Phase.Build],
      requireApproval: [],
    };

    const results = await runPipeline(handlers, createContext(), config);

    expect(results).toHaveLength(2);
    expect(results[1].success).toBe(false);
    expect(results[1].output).toContain("planning failed");
  });

  it("respects shouldStop flag", async () => {
    const context = createContext();
    context.shouldStop = true;

    const handlers = [createMockHandler(Phase.Explore)];
    const config = {
      phases: [Phase.Explore],
      requireApproval: [],
    };

    const results = await runPipeline(handlers, context, config);

    expect(results).toHaveLength(0);
  });

  it("skips missing handlers gracefully", async () => {
    const handlers = [createMockHandler(Phase.Explore)];
    const config = {
      phases: [Phase.Explore, Phase.Plan],
      requireApproval: [],
    };

    const results = await runPipeline(handlers, createContext(), config);

    expect(results).toHaveLength(1);
    expect(results[0].phase).toBe(Phase.Explore);
  });
});
