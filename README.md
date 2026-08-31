<div align="center">

<img src="assets/logo.svg" alt="DEVBYAI Logo" width="600">

<br />

A free and open-source AI-powered development agent built for your terminal.

**Explore • Plan • Build • Review • Research • Test • Ship**

<br />

[Getting Started](#-getting-started) • [Features](#-features) • [Architecture](#-architecture) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

</div>

---

## ⚡ The Open Development Agent

DEVBYAI is a next-generation, terminal-first AI development environment designed to help developers move from an idea to production.

It is more than a chatbot in your terminal.

DEVBYAI is being built as an intelligent development system capable of helping you:

```text
EXPLORE → PLAN → BUILD → REVIEW → TEST → SHIP
```

With support for your preferred AI models and a future ecosystem of agents, tools, skills, extensions, browser automation, and developer workflows.

> **Build with AI. Stay in control.**

---

# ✨ DEVBYAI Experience

When you launch DEVBYAI:

```bash
devbyai
```

The experience is designed to feel like entering your AI-powered development workspace.

```text
        ██████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗ █████╗ ██╗
        ██╔══██╗██╔════╝██║   ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║
        ██║  ██║█████╗  ██║   ██║██████╔╝ ╚████╔╝ ███████║██║
        ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██╗  ╚██╔╝  ██╔══██║██║
        ██████╔╝███████╗ ╚████╔╝ ██████╔╝   ██║   ██║  ██║██║

                             DEV BY AI

                        From Idea to Production.

────────────────────────────────────────────────────────────

  Workspace     DEVBYAI
  Provider      MockProvider
  Status        ● Ready

────────────────────────────────────────────────────────────

  What do you want to build?

  › Build a new feature...

────────────────────────────────────────────────────────────

  /help for commands • Ctrl+C to exit
```

> The interface is evolving as DEVBYAI grows. The goal is a premium, smooth, and interactive terminal experience without unnecessary complexity.

---

# 🚀 Why DEVBYAI?

AI development is rapidly changing.

Developers today use different tools for:

* 💻 Writing code
* 🤖 AI assistance
* 🔍 Exploring repositories
* 📋 Planning features
* 🧪 Testing
* 🔎 Reviewing code
* 🌐 Research
* 🚀 Deployment

DEVBYAI aims to bring these workflows together into a single, intelligent development environment.

```text
                         YOUR IDEA
                            │
                            ▼
                       ┌───────────┐
                       │  DEVBYAI  │
                       └─────┬─────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
     EXPLORE                PLAN                 BUILD
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                          REVIEW
                             │
                             ▼
                           TEST
                             │
                             ▼
                            SHIP
```

---

# 🌟 Features

## 🧠 Intelligent Development Pipeline

DEVBYAI is built around development phases.

| Phase           | Purpose                                          |
| --------------- | ------------------------------------------------ |
| 🔍 **Explore**  | Understand projects and navigate codebases       |
| 📋 **Plan**     | Design solutions and break down tasks            |
| 🛠️ **Build**   | Write, modify, and refactor code                 |
| 🔎 **Review**   | Analyze changes and verify correctness           |
| 🌐 **Research** | Investigate documentation and technical problems |
| 🧪 **Test**     | Validate implementation and detect issues        |
| 🚀 **Ship**     | Prepare software for production workflows        |

---

## 💻 Terminal First

DEVBYAI lives where developers already work.

```bash
devbyai
```

Ask naturally:

```text
Build authentication for this application
```

```text
Explain this project
```

```text
Find security issues in this repository
```

```text
Create a plan for migrating this application
```

---

## 🤖 Model Independent

DEVBYAI is designed to be provider independent.

The long-term vision includes support for:

```text
Cloud AI Providers
        │
        ├── OpenAI
        ├── Anthropic
        ├── Google
        ├── OpenRouter
        │
        ▼
      DEVBYAI
        │
        ▼
Local AI Models
        │
        ├── Ollama
        └── Other Local Providers
```

You should have control over the models you use.

---

## 🧩 Extensible Architecture

DEVBYAI is designed to grow.

```text
DEVBYAI
│
├── CLI
├── Core
├── Models
├── Tools
├── Agents
├── Skills
├── SDK
├── Extensions
└── Future Ecosystem
```

---

# 🖥️ Installation

## Requirements

Before installing DEVBYAI, make sure you have:

* Node.js
* pnpm
* Git

Check your installation:

```bash
node --version
pnpm --version
git --version
```

---

## 📦 Install from Source

Clone the repository:

```bash
git clone https://github.com/saikirantechy/devbyai.git
```

Enter the project:

```bash
cd devbyai
```

Install dependencies:

```bash
pnpm install
```

Build the project:

```bash
pnpm build
```

Run DEVBYAI:

```bash
pnpm dev
```

> Installation and global package distribution are still evolving.

---

# 🪟 Windows

DEVBYAI is designed to work on Windows.

Recommended terminal:

```text
Windows Terminal
```

Recommended shell:

```text
PowerShell
```

Example:

```powershell
git clone https://github.com/saikirantechy/devbyai.git

cd devbyai

pnpm install

pnpm build

pnpm dev
```

---

# 🍎 macOS

Example setup:

```bash
git clone https://github.com/saikirantechy/devbyai.git

cd devbyai

pnpm install

pnpm build

pnpm dev
```

DEVBYAI is designed to support:

```text
Terminal
iTerm
Other modern terminal environments
```

---

# 🐧 Linux

Clone and run:

```bash
git clone https://github.com/saikirantechy/devbyai.git

cd devbyai

pnpm install

pnpm build

pnpm dev
```

DEVBYAI is designed for modern Linux terminal environments and SSH workflows.

---

# 🎮 Quick Start

Launch DEVBYAI:

```bash
devbyai
```

Or during local development:

```bash
pnpm dev
```

You can then begin interacting with DEVBYAI.

Example:

```text
› Explore this project
```

```text
› Explain the architecture
```

```text
› Create a plan for adding authentication
```

```text
› Review this codebase
```

---

# ⌨️ Commands

DEVBYAI supports both command-based and interactive workflows.

## General

```bash
devbyai
```

Launch the DEVBYAI interactive environment.

---

## Version

```bash
devbyai version
```

Display the current DEVBYAI version.

---

## Models

```bash
devbyai models
```

View available and configured AI models.

---

## Doctor

```bash
devbyai doctor
```

Check your DEVBYAI development environment.

---

## Initialization

```bash
devbyai init
```

Initialize DEVBYAI configuration.

---

# 💬 Interactive Commands

Inside the DEVBYAI interactive environment, slash commands provide quick access to supported capabilities.

Examples:

```text
/help
```

```text
/models
```

```text
/status
```

```text
/clear
```

```text
/exit
```

> Only commands with real implementations are considered available.

---

# 🧭 Development Pipeline

DEVBYAI follows a structured development workflow.

```text
┌──────────────────────────────────────────────────┐
│                                                  │
│                    DEVBYAI                       │
│                                                  │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
                  🔍 EXPLORE
                        │
                        ▼
                   📋 PLAN
                        │
                        ▼
                  🛠️ BUILD
                        │
                        ▼
                  🔎 REVIEW
                        │
                        ▼
                   🧪 TEST
                        │
                        ▼
                   🚀 SHIP
```

Not every task requires every phase.

DEVBYAI should eventually intelligently determine which phases are relevant while keeping the user in control.

---

# 🏗️ Architecture

DEVBYAI is structured as a modular monorepo.

```text
devbyai/
│
├── apps/
│   │
│   └── cli/
│       └── DEVBYAI Terminal Experience
│
├── packages/
│   │
│   ├── core/
│   │   └── Orchestration & Pipeline
│   │
│   ├── config/
│   │   └── Configuration Management
│   │
│   ├── models/
│   │   └── AI Provider Abstractions
│   │
│   ├── tools/
│   │   └── Agent Tool System
│   │
│   ├── ui/
│   │   └── Design System & Visual Components
│   │
│   ├── agents/
│   │   └── Future Agent Architecture
│   │
│   ├── skills/
│   │   └── Future Skills System
│   │
│   └── sdk/
│       └── Future Developer SDK
│
├── docs/
│
└── .github/
```

---

# 🧠 Core Philosophy

DEVBYAI follows a few important principles.

## 🆓 Free and Open Source

DEVBYAI is being built as an open project.

The goal is to make powerful AI development tools more accessible.

---

## 🤖 Model Freedom

Users should not be unnecessarily locked into a single AI provider.

DEVBYAI aims to support flexibility and provider independence.

---

## 👤 User Control

AI should assist developers.

It should not silently take control.

DEVBYAI's long-term philosophy:

```text
AI POWER
+
USER CONTROL
=
BETTER DEVELOPMENT
```

---

## ⚡ Terminal First

The terminal remains one of the most powerful environments for developers.

DEVBYAI brings modern AI workflows directly into that environment.

---

## 🧩 Built to Expand

The first version is intentionally focused.

The long-term ecosystem can grow into:

```text
CLI
│
├── Development Agents
├── Browser Agents
├── Automation Agents
├── Skills
├── Tools
├── Extensions
├── SDK
├── IDE Integrations
└── Developer Ecosystem
```

But development happens step by step.

---

# 🛣️ Roadmap

## ✅ v0.1 — Foundation

* [x] TypeScript monorepo
* [x] CLI foundation
* [x] Core pipeline architecture
* [x] Configuration system
* [x] Model provider abstraction
* [x] Tool abstraction
* [x] Development documentation
* [x] Initial commands

---

## ✅ v0.1.x — Premium CLI Experience

* [x] Interactive terminal experience
* [x] DEVBYAI visual identity
* [x] Premium loading states
* [x] Pipeline visualization
* [x] Workspace status
* [x] Responsive terminal layouts
* [x] No-color mode
* [x] Improved onboarding

---

## ✅ v0.2 — AI Provider & Model System

* [x] OpenAI provider integration
* [x] API key management
* [x] Provider registry
* [x] Model listing
* [x] Streaming responses
* [x] Provider status display

---

## ✅ v0.3 — Agents, Skills, Hooks & Workflows

* [x] Agent system (Explorer, Planner, Builder, Reviewer)
* [x] Skill system (TypeScript, Testing, Code Review, Documentation)
* [x] Hook system with lifecycle events
* [x] Workflow system with pattern matching
* [x] Interactive commands (/agents, /skills, /workflows)

---

## ✅ v0.4 — Project Intelligence

* [x] Project Profile detection
* [x] File Index with exclusions
* [x] Context Engine with smart file selection
* [x] Task Memory with local persistence
* [x] Session Context management
* [x] Interactive commands (/project, /map, /context, /history)

---

## 🔜 v0.5 — Debugging & Validation Intelligence

* [ ] Smart error analysis
* [ ] Test discovery
* [ ] Build failure context
* [ ] Debug workflows
* [ ] Validation engine
* [ ] Fix suggestions

---

## 🔮 Future

* [ ] Provider & Model Intelligence
* [ ] Plugin & Extension SDK
* [ ] Developer Automation
* [ ] Browser Agent
* [ ] Browser Extension
* [ ] VS Code integration
* [ ] Deployment workflows
* [ ] Team collaboration

---

# 🧪 Development

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Run type checking:

```bash
pnpm typecheck
```

Run linting:

```bash
pnpm lint
```

Run tests:

```bash
pnpm test
```

Run DEVBYAI locally:

```bash
pnpm dev
```

---

# 📦 Project Structure

```text
DEVBYAI
│
├── apps
│   └── cli
│
├── packages
│   ├── core
│   ├── config
│   ├── models
│   ├── tools
│   ├── ui
│   ├── agents
│   ├── skills
│   └── sdk
│
├── docs
│   ├── architecture.md
│   ├── cli.md
│   ├── getting-started.md
│   └── vision.md
│
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── ROADMAP.md
│
├── biome.json
├── tsconfig.json
└── pnpm-workspace.yaml
```

---

# 🔌 Future Agent Ecosystem

DEVBYAI is being designed to support specialized agents.

```text
                    DEVBYAI
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       EXPLORE       PLAN         BUILD
       AGENT         AGENT        AGENT
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                    REVIEW
                    AGENT
                       │
                       ▼
                     TEST
                    AGENT
                       │
                       ▼
                    DEPLOY
                    AGENT
```

This is part of the future architecture.

DEVBYAI will not introduce unnecessary multi-agent complexity until the foundation is ready.

---

# 🌐 Future Browser Intelligence

DEVBYAI may eventually support browser-powered development workflows.

Potential capabilities:

```text
🌐 Open Applications

🔍 Inspect Web Pages

🧪 Test User Flows

🐛 Debug Frontend Issues

📸 Capture Screenshots

📊 Analyze Browser Errors

🤖 Automate Web Workflows
```

This will be developed as a dedicated capability rather than mixing browser automation directly into the core CLI.

---

# 🧩 Skills

Future DEVBYAI Skills may provide specialized development knowledge.

Examples:

```text
⚛️ React

▲ Next.js

🟢 Node.js

🐍 Python

📱 Flutter

🐳 Docker

☸️ Kubernetes

🔐 Security

☁️ DevOps

🗄️ Databases
```

Skills may eventually provide:

```text
Instructions

Best Practices

Tools

Documentation Context

Development Patterns
```

---

# 🔧 Extensions

DEVBYAI is being designed with extensibility in mind.

Future extensions may provide:

```text
AI Providers

Tools

Agents

Skills

Commands

Integrations

Deployment Platforms

Browser Capabilities
```

The extension ecosystem will only be implemented after the core architecture is stable.

---

# 🤝 Contributing

DEVBYAI is open to contributors.

Whether you are interested in:

```text
TypeScript

CLI Development

AI Agents

Developer Tools

AI Providers

Testing

Documentation

Developer Experience

Terminal UI

Architecture
```

Your contributions are welcome.

Please read:

```text
CONTRIBUTING.md
```

before contributing.

---

# 🛡️ Security

Security is important.

Please do not publicly disclose security vulnerabilities.

Read:

```text
SECURITY.md
```

for security reporting information.

---

# 💡 Vision

DEVBYAI is not trying to become another AI chat window.

The vision is bigger.

```text
TODAY

AI helps developers write code.

        │
        ▼

TOMORROW

AI understands projects.

        │
        ▼

THE FUTURE

AI works alongside developers throughout
the complete software development lifecycle.
```

DEVBYAI is being built for that future.

---

# 🎯 Our Goal

Build something that feels:

```text
POWERFUL
    without being confusing

ADVANCED
    without being complicated

PREMIUM
    without being heavy

AUTOMATED
    without removing user control

OPEN
    without unnecessary restrictions
```

---

# 🧠 Built Step by Step

DEVBYAI is ambitious.

But ambition does not mean implementing everything immediately.

Our development philosophy:

```text
BUILD SMALL.

DESIGN BIG.

TEST EVERYTHING.

IMPROVE CONTINUOUSLY.
```

---

# 📊 Project Status

```text
DEVBYAI DEVELOPMENT STATUS
────────────────────────────────────

Foundation              ██████████  100%

CLI Architecture        ██████████  100%

Terminal Experience     ██████████  100%

AI Providers            ██████████  100%

Agents & Skills         ██████████  100%

Project Intelligence    ██████████  100%

Debugging & Validation  ████░░░░░░  In Progress

Extensions              █░░░░░░░░░  Future

Browser Intelligence    █░░░░░░░░░  Future
```

DEVBYAI is actively evolving.

---

# ❤️ Built for Developers

DEVBYAI is being built for developers who want:

* More control over AI
* Better terminal workflows
* Model flexibility
* Open-source tools
* Intelligent development automation
* A powerful but understandable AI development environment

---

<div align="center">

# DEVBYAI

### DEV BY AI

**From Idea to Production.**

<br />

```text
EXPLORE • PLAN • BUILD • REVIEW • TEST • SHIP
```

<br />

⭐ Star the project if you believe in the future of open AI-powered development.

<br />

**Build with AI. Stay in control.**

</div>
