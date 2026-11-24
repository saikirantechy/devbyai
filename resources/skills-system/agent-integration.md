# Agent Integration — Skills System

This section connects the skill system to your multi-provider AI coding platform.

Recommended approach: an **agent orchestrator with a skill discovery stage**.

The orchestrator should decide:

1. What is the user trying to accomplish?
2. Which skills are relevant?
3. Which model is appropriate?
4. What project context is needed?
5. Which tools are allowed?
6. Which actions require user approval?

---

## A. Agent Execution Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     User Task                               │
│              "Build a full-stack application with auth"     │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Task Classifier              Identify requirements, complexity│
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Skill Discovery              Frontend / Backend / Database   │
│                             / Security skills                │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Model Selection                Choose tool-capable model     │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Planning Agent                  Break task into steps        │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Tool Execution Loop            Read → Plan → Edit → Test     │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Final Result                   Code changes, tests, summary  │
└─────────────────────────────────────────────────────────────┘
```

---

## B. Skill Discovery

Initially, use metadata-based matching. Later, add semantic search and ranking.

Each skill should have:

- Name
- Description
- Category
- Supported frameworks
- Trigger keywords
- Compatibility
- Trust and moderation status

Example discovery logic:

```ts
interface SkillMatch {
  skillId: string;
  relevance: number;
  reason: string;
}

async function discoverSkills(
  task: string,
  registry: SkillRegistry
): Promise<SkillMatch[]> {
  const candidates = await registry.search(task);

  return candidates
    .filter((skill) => skill.validationStatus === "passed")
    .map((skill) => ({
      skillId: skill.id,
      relevance: calculateRelevance(task, skill),
      reason: "Matched task description and skill metadata",
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}
```

This is illustrative — the production registry needs to return a normalized search result with trust and compatibility metadata.

**Eventually combine:**

- Keyword search
- Full-text search
- Embedding similarity
- Framework detection
- User-selected skills
- Task classification

Let users **inspect and override** the agent's selections.

---

## C. Agent Context Composition

Build a context composer that combines different types of information:

```
Agent Context
│
├── System instructions
│
├── User task
│
├── Project context
│   ├── Framework
│   ├── File structure
│   └── Relevant source files
│
├── Selected skill instructions
│   ├── Frontend Builder
│   ├── Backend Builder
│   └── Database Architect
│
├── Available tool descriptions
│
└── Security and approval constraints
```

**Important:**

- Don't combine everything into a single giant prompt.
- Track the source of each context segment so you can audit what the agent received.
- Keep user task instructions and security policies separate from skill-provided instructions.
- A skill must **never** override system-level restrictions.

---

## D. Multi-Provider Model Compatibility

Because DevByAI will support multiple AI providers, the agent must work with models that have different capabilities.

Create a model capability profile:

```ts
interface AgentModelCapabilities {
  streaming: boolean;
  toolCalling: boolean;
  structuredOutput: boolean;
  maxContextTokens: number;
  codeGeneration: boolean;
  reliableMultiStepExecution: boolean;
}
```

Before starting an agent task:

1. Check model compatibility
2. Confirm tool-calling support
3. Estimate context requirements
4. Choose an eligible model
5. Tell the user if a requested model cannot perform the task

**Do not assume every free model supports tool calling or reliable multi-step agent workflows.**

---

## E. Tool Execution Loop

The model should request tool calls, but the backend should authorize and execute them:

```
Agent:
  I need to inspect src/auth/login.ts

Tool request:
  read_file("src/auth/login.ts")

Permission gateway:
  Is this user authorized?
  Is this path inside the project workspace?
  Is the file permitted to be read?

Tool executor:
  Read the file and return the result.

Agent:
  Analyze the result and prepare a change.

Approval gateway:
  Does this action require user approval?

Agent:
  Present the proposed diff.
```

### Critical Rule

**The model never decides its own permissions.** The server decides whether each tool call is permitted.