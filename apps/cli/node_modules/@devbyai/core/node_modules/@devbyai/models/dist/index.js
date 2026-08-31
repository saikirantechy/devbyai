// src/index.ts
var MockProvider = class {
  id = "mock";
  name = "Mock Provider";
  model = "mock-default";
  responseDelay = 100;
  async initialize(_config) {
  }
  async listModels() {
    return ["mock-default", "mock-fast", "mock-precise"];
  }
  getModel() {
    return this.model;
  }
  async generate(messages, options) {
    const model = options?.model || this.model;
    await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content || "";
    return {
      content: this.generateMockResponse(userContent),
      model,
      provider: this.id,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    };
  }
  async *stream(messages, options) {
    const response = await this.generate(messages, options);
    const words = response.content.split(" ");
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      yield { content: `${word} `, done: false };
    }
    yield { done: true };
  }
  generateMockResponse(input) {
    if (input.toLowerCase().includes("explore")) {
      return "[MOCK] Exploring the codebase... Found TypeScript project with 12 source files.";
    }
    if (input.toLowerCase().includes("plan")) {
      return "[MOCK] Plan: 1) Analyze requirements. 2) Identify files. 3) Implement changes. 4) Verify.";
    }
    if (input.toLowerCase().includes("build")) {
      return "[MOCK] Building... Implementation complete. 3 files modified.";
    }
    return "[MOCK] Received your request. In v0.2.0 this will connect to a real AI provider.";
  }
};
var ProviderRegistry = class {
  providers = /* @__PURE__ */ new Map();
  register(factory) {
    const provider = factory();
    this.providers.set(provider.id, factory);
  }
  create(id) {
    const factory = this.providers.get(id);
    return factory ? factory() : void 0;
  }
  listIds() {
    return Array.from(this.providers.keys());
  }
};
function createDefaultProviderRegistry() {
  const registry = new ProviderRegistry();
  registry.register(() => new MockProvider());
  return registry;
}
export {
  MockProvider,
  ProviderRegistry,
  createDefaultProviderRegistry
};
