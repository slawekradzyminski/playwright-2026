# 🧪 Test Automation in Practice 2026

A TypeScript-based Playwright suite for validating the current gateway-first application stack powered by awesome-localstack.

This setup was last verified on August 23, 2026 with Node.js 24 LTS and
Playwright 1.63.0.

## 📦 Project Overview

This repository contains automated API and UI tests for the local training environment used during the Playwright course. The tests target the public gateway URL exposed by awesome-localstack, not raw internal service ports.

## 🔧 Features

- **API Testing**: Validates authentication endpoints with various scenarios, including successful logins and error handling.
- **UI Testing**: Validates user-facing behavior through focused browser scenarios with API-based setup and cleanup.
- **TypeScript Support**: Utilizes TypeScript for type safety and better developer experience with dedicated types in `/types` folder.
- **Configurable Environment**: Tests can target either the shared training URL or a local awesome-localstack Docker setup.

## 🗂️ Project Structure

```
.
├── tests/
│   ├── api/
│   │   └── login.api.spec.ts       # All signin endpoint API tests
│   └── ui/                        # UI test scenarios
├── pages/                         # Page objects and shared BasePage
│   └── components/               # Reusable UI components
├── fixtures/
│   └── ui/                       # UI fixtures with API setup and cleanup
├── http/
│   ├── apiClient.ts                 # Shared JSON HTTP client abstraction
│   └── loginClient.ts               # Client for the signin endpoint
├── validators/
│   ├── authResponse.ts              # Login response and refresh-token validation
│   └── jwt.ts                       # JWT structure validation
├── types/
│   └── auth.ts                     # TypeScript interfaces for authentication
├── reports/bugs/
│   └── README.md                       # Bug index, classification, and template
├── .nvmrc                          # Course Node.js major version
├── playwright.config.ts            # Playwright configuration
├── test-config.ts                  # .env-backed test configuration
├── .env.example                    # Safe configuration template
├── package.json                    # Project metadata and dependencies
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js LTS only, recommended `v24.x.x`
- Docker (only when using the local application stack)

If you use nvm, select the repository's declared Node.js version with `nvm use`.

### Setup

1. **Clone the Repository**

```bash
git clone https://github.com/slawekradzyminski/playwright-2026
cd playwright-2026
```

2. **Install Dependencies**

```bash
npm ci
npx playwright install chromium
```

3. **Configure the application URL and credentials**

Create a `.env` file using one of the following templates. The variable names
are the same in both cases; only the target URL changes.

For local Docker execution:

```dotenv
# .env (local)
APP_BASE_URL=http://localhost:8081
ADMIN_USERNAME=admin
ADMIN_PASSWORD=LocalDemoAdmin123!
```

For the shared AI Testers application (no Docker required):

```dotenv
# .env (AI Testers)
APP_BASE_URL=https://aitesters.byst.re
ADMIN_USERNAME=admin
ADMIN_PASSWORD=LocalDemoAdmin123!
```

Alternatively, copy the ready-to-use AI Testers template:

```bash
cp .env.example .env
```

`.env` is ignored by git. Each participant can therefore keep their own URL
and project credentials locally.

If you use the local application, start the Dockerized environment:

Follow the instructions in the awesome-localstack repository and start the lightweight profile:

```bash
git clone https://github.com/slawekradzyminski/awesome-localstack
cd awesome-localstack
docker compose -f lightweight-docker-compose.yml up -d
```

The local stack exposes the following gateway routes:

- **App Gateway**: `http://localhost:8081`
- **Login Page**: `http://localhost:8081/login`
- **Auth API**: `http://localhost:8081/api/v1/users/signin`

4. **Run Tests**

**API Tests**

```bash
npm run test:api
# or
npx playwright test tests/api/login.api.spec.ts
```

**UI Tests**

```bash
npm run test:ui
```

**All Tests**

```bash
npm test
# or
npx playwright test
```

## ⚙️ Configuration

The `playwright.config.ts` file is configured to:

- Run tests in parallel for faster execution
- Use Chromium browser for UI tests
- Collect trace information on the first retry of a failed test
- Use list reporter for test output
- Retry failed tests on CI (up to 2 retries)
- Use single worker on CI, parallel workers locally

## API testing workflow

Before adding or changing API tests, follow the [API testing skill](.agents/skills/api-testing/SKILL.md): assess backend code and lower-level test coverage, design exploration, execute terminal HTTP checks, report defects immediately, and then automate verified behaviors with the appropriate role fixtures. The skill contains the workflow and supporting references; an identical copy is available for [Claude Code](.claude/skills/api-testing/SKILL.md). Use the [bug reporting guide](reports/bugs/README.md) for all findings.

Documentation-only bugs do not block tests of verified, intended API behavior. Keep representative 400/401 coverage for every endpoint in scope that returns those responses, and link the documentation bug in a comment above affected tests. Functional defects remain tracked separately.

## 🧪 Test Details

### API Tests (`tests/api/login.api.spec.ts`)

These tests cover various scenarios for the `/api/v1/users/signin` endpoint, ordered by response code:

- **Successful Authentication (200)**: Valid credentials return a 200 status with a JWT token and complete user information
- **Validation Errors (400)**: A parameterized test covers empty username, short username, and short password scenarios with appropriate error messages
- **Token validation**: The response validator checks the JSON contract, JWT compact serialization/header structure, and the opaque `refreshToken` format

Authentication failures (422) remain in the same signin API suite as the 200 and 400 cases.

### UI Tests

Browser tests live in [`tests/ui`](tests/ui). Run them with `npm run test:ui`.

- [`product/`](tests/ui/product): product cards, details, browsing and page states, matching the API `product/` folder.
- [`navigation/`](tests/ui/navigation): logged-in and logged-out headers and admin navigation.
- Standalone page specs remain at the root, as in the API suite.

Run a feature folder with `npm run test:ui -- tests/ui/product/`.
See [`AGENTS.md`](AGENTS.md) for contribution and testing conventions.

### Application source references

- [Backend repository](https://github.com/slawekradzyminski/test-secure-backend): API implementation and account lifecycle.
- [Frontend repository](https://github.com/slawekradzyminski/vite-react-frontend): UI behavior and `data-testid` selectors.
- [Playwright Page Object Models](https://playwright.dev/docs/pom): page object design reference.

## 🧰 Technologies Used

- **Playwright**: End-to-end testing framework for web applications
- **TypeScript**: Typed superset of JavaScript
- **Docker**: Containerization platform
- **awesome-localstack**: Containerized local application environment for development and testing

## Current Target Architecture

The tests use the gateway URL from `APP_BASE_URL`:

- browser traffic goes to the configured `APP_BASE_URL`
- frontend routes are served by the gateway
- backend API is exposed behind the same origin under `/api/v1/...`
- no test should depend on raw backend port `4001`

## AI-assisted browser testing

The agent must run on the same computer as the application, or be able to execute
commands in its local terminal. A remote-only agent usually cannot reach your
`http://localhost:8081` without additional networking or tunneling.

For coding agents, Playwright now provides two official integration paths:

- **Playwright CLI + skills** for compact, command-based agent workflows
- **Playwright MCP** for persistent browser sessions and structured accessibility snapshots

The CLI option can be installed globally and then exposed to a compatible agent:

```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills
```

Read more in the official
[Playwright coding-agent guide](https://playwright.dev/docs/getting-started-cli).

### Playwright MCP

The Playwright MCP (Model Context Protocol) server enables browser automation capabilities, allowing AI coding assistants to interact with web pages through structured accessibility snapshots.

Read more in the official [Playwright MCP documentation](https://playwright.dev/docs/getting-started-mcp).

#### Prerequisites

- Node.js 24 LTS for this course
- Playwright installed

#### Cursor

1. Navigate to `Cursor Settings` → `MCP` → `Add new MCP Server`
2. Name it "playwright" and set the command to `npx @playwright/mcp@latest`
3. Save the configuration

#### VS Code (GitHub Copilot)

**Option 1: Using CLI**

```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

**Option 2: Manual Configuration**

Open your MCP configuration file:
- macOS: `~/Library/Application Support/Code/User/mcp.json`
- Windows: `%APPDATA%\Code\User\mcp.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Restart VS Code or reload the window.

#### Codex

**Option 1: Using CLI**

```bash
codex mcp add playwright npx "@playwright/mcp@latest"
```

**Option 2: Manual Configuration**

Edit the configuration file `~/.codex/config.toml` and add:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

#### Claude Code

Use the Claude Code CLI to add the Playwright MCP server:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

#### Claude Desktop

Open the configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Restart Claude Desktop.

## 📝 License

This project is licensed under the ISC License.

For more information on setting up and using the Dockerized environment, refer to the awesome-localstack repository.

## API test plan and coverage

The maintained [API test plan and status](reports/api/test-plan.md) starts with a progress
summary for GitLab readers: implemented work, recorded execution results, remaining scope,
risks and next actions. It also contains package priorities, dependencies, known gaps and
update instructions. The generated
[endpoint inventory](reports/api/coverage.md) tracks every OpenAPI method/path and documented
response status against reviewed dedicated tests. These percentages measure implemented
breadth, not passing tests or complete behavior coverage.

After changing API specs or the contract, review [the mapping](reports/api/coverage-map.json)
and follow the plan's maintenance checklist, then run:

```bash
npm run coverage:api
npm run coverage:api:check
```

## UI testing workflow

Follow the [UI testing skill](.agents/skills/ui-testing/SKILL.md) for exploration before automation, page objects, API fixtures and UI suite verification. Its references cover responsive and visual review, accessibility, UX, performance, and evidence/bug reporting. The skill is mirrored under `.claude/skills/ui-testing`.

## UI test plan and screen coverage

The [UI test plan and status](reports/ui/test-plan.md) is the single report for screen coverage, verified results, gaps and next actions, including admin screens. The agent-facing [JSON inventory](reports/ui/coverage-map.json) holds per-screen source references, browser observations, coverage and gaps. Update affected entries after meaningful changes; detailed scenarios are prepared when starting the work.
