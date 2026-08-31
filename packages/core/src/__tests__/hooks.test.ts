/**
 * Hook System Tests
 *
 * Tests for the HookRegistry, hook execution, and lifecycle events.
 */

import { describe, expect, it, vi } from "vitest";
import { HookRegistry } from "../hooks.js";
import type { Hook, HookEvent } from "../hooks.js";

function createHook(id: string, event: HookEvent, priority = 0): Hook {
  return {
    id,
    event,
    priority,
    handler: vi.fn(),
  };
}

describe("HookRegistry", () => {
  it("should register hooks", () => {
    const registry = new HookRegistry();
    const hook = createHook("test-1", "task:start");

    registry.register(hook);

    expect(registry.list().length).toBe(1);
  });

  it("should remove hooks", () => {
    const registry = new HookRegistry();
    const hook = createHook("test-1", "task:start");

    registry.register(hook);
    expect(registry.list().length).toBe(1);

    const removed = registry.remove("test-1");
    expect(removed).toBe(true);
    expect(registry.list().length).toBe(0);
  });

  it("should return false when removing non-existent hook", () => {
    const registry = new HookRegistry();
    const removed = registry.remove("non-existent");
    expect(removed).toBe(false);
  });

  it("should sort hooks by priority", () => {
    const registry = new HookRegistry();

    registry.register(createHook("high", "task:start", 100));
    registry.register(createHook("low", "task:start", 0));
    registry.register(createHook("medium", "task:start", 50));

    const hooks = registry.list();
    expect(hooks[0].id).toBe("low");
    expect(hooks[1].id).toBe("medium");
    expect(hooks[2].id).toBe("high");
  });

  it("should execute hooks for matching events", async () => {
    const registry = new HookRegistry();
    const hook = createHook("test-1", "task:start");

    registry.register(hook);
    await registry.execute("task:start", { taskId: "123" });

    expect(hook.handler).toHaveBeenCalledTimes(1);
    expect(hook.handler).toHaveBeenCalledWith(
      expect.objectContaining({ event: "task:start", taskId: "123" }),
    );
  });

  it("should not execute hooks for non-matching events", async () => {
    const registry = new HookRegistry();
    const hook = createHook("test-1", "task:start");

    registry.register(hook);
    await registry.execute("task:complete", {});

    expect(hook.handler).not.toHaveBeenCalled();
  });

  it("should list hooks for a specific event", () => {
    const registry = new HookRegistry();

    registry.register(createHook("start-1", "task:start", 0));
    registry.register(createHook("complete-1", "task:complete", 0));
    registry.register(createHook("start-2", "task:start", 1));

    const startHooks = registry.listForEvent("task:start");
    expect(startHooks.length).toBe(2);

    const completeHooks = registry.listForEvent("task:complete");
    expect(completeHooks.length).toBe(1);
  });

  it("should handle hook errors gracefully", async () => {
    const registry = new HookRegistry();
    const errorHook: Hook = {
      id: "error-hook",
      event: "task:start",
      priority: 0,
      handler: () => {
        throw new Error("Hook failed");
      },
    };

    registry.register(errorHook);

    // Should not throw
    await expect(registry.execute("task:start", {})).resolves.toBeUndefined();
  });

  it("should clear all hooks", () => {
    const registry = new HookRegistry();

    registry.register(createHook("test-1", "task:start"));
    registry.register(createHook("test-2", "task:complete"));
    expect(registry.list().length).toBe(2);

    registry.clear();
    expect(registry.list().length).toBe(0);
  });

  it("should execute hooks in priority order", async () => {
    const registry = new HookRegistry();
    const order: string[] = [];

    const hook1: Hook = {
      id: "first",
      event: "task:start",
      priority: 10,
      handler: () => {
        order.push("first");
      },
    };

    const hook2: Hook = {
      id: "second",
      event: "task:start",
      priority: 1,
      handler: () => {
        order.push("second");
      },
    };

    const hook3: Hook = {
      id: "third",
      event: "task:start",
      priority: 5,
      handler: () => {
        order.push("third");
      },
    };

    registry.register(hook1);
    registry.register(hook2);
    registry.register(hook3);

    await registry.execute("task:start", {});

    expect(order).toEqual(["second", "third", "first"]);
  });
});
