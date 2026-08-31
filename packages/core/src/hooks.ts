/**
 * DEVBYAI Hook System
 *
 * Lifecycle hooks for customizing DEVBYAI behavior.
 */

export type HookEvent =
  | "task:start"
  | "task:complete"
  | "task:error"
  | "phase:start"
  | "phase:complete"
  | "tool:before"
  | "tool:after";

export interface HookContext {
  /** Event that triggered the hook */
  event: HookEvent;
  /** Task identifier */
  taskId?: string;
  /** Phase name (for phase events) */
  phase?: string;
  /** Tool name (for tool events) */
  tool?: string;
  /** Additional data */
  data?: Record<string, unknown>;
}

export interface Hook {
  /** Unique hook identifier */
  id: string;
  /** Event to listen for */
  event: HookEvent;
  /** Handler function */
  handler: (context: HookContext) => Promise<void> | void;
  /** Priority (lower = runs first) */
  priority: number;
}

export class HookRegistry {
  private hooks: Hook[] = [];

  /**
   * Register a hook.
   */
  register(hook: Hook): void {
    this.hooks.push(hook);
    // Sort by priority
    this.hooks.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a hook by ID.
   */
  remove(id: string): boolean {
    const index = this.hooks.findIndex((h) => h.id === id);
    if (index !== -1) {
      this.hooks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Execute all hooks for a given event.
   * Hooks that throw errors are logged but do not stop execution.
   */
  async execute(event: HookEvent, context: Omit<HookContext, "event">): Promise<void> {
    const matchingHooks = this.hooks.filter((h) => h.event === event);

    for (const hook of matchingHooks) {
      try {
        await hook.handler({ ...context, event });
      } catch (err) {
        // Hooks must not crash DEVBYAI
        console.error(`Hook warning: ${hook.id} failed during ${event}: ${err}`);
      }
    }
  }

  /**
   * List all registered hooks.
   */
  list(): Hook[] {
    return [...this.hooks];
  }

  /**
   * List hooks for a specific event.
   */
  listForEvent(event: HookEvent): Hook[] {
    return this.hooks.filter((h) => h.event === event);
  }

  /**
   * Clear all hooks.
   */
  clear(): void {
    this.hooks = [];
  }
}
