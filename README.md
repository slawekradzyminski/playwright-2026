# 🧪 Test Automation in Practice 2026

A TypeScript-based Playwright suite for validating the current gateway-first application stack powered by awesome-localstack.

This setup was last verified on August 23, 2026 with Node.js 24 LTS and
Playwright 1.63.0.

## 📦 Project Overview

This repository contains automated API and UI tests for the local training environment used during the Playwright course. The tests target the public gateway URL exposed by awesome-localstack, not raw internal service ports.

## 🔧 Features

- **API Testing**: Validates authentication endpoints with various scenarios, including successful logins and error handling.
- **UI Testing**: Ensures the login interface behaves correctly, covering form validations, navigation, and accessibility.
- **TypeScript Support**: Utilizes TypeScript for type safety and better developer experience with dedicated types in `/types` folder.
- **Configurable Environment**: Tests can target either the shared training URL or a local awesome-localstack Docker setup.

## 🗂️ Project Structure

```
.
├── tests/
│   ├── api/
│   │   ├── login.api.spec.ts       # Login API tests
│   │   └── registration.api.spec.ts # Registration API tests
│   └── ui/
│       └── login.ui.spec.ts        # UI tests for the login page
├── http/
│   ├── auth-client.ts              # Login requests
│   └── users-client.ts             # Registration and test user cleanup
├── generators/
│   └── user-generator.ts           # Valid user data generated with Faker.js
├── types/
│   ├── auth.ts                     # Authentication types
│   └── user.ts                     # Registration payload type
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
ADMIN_PASSWORD=PASSWORD_YOU_SHOULD_CHANGE
```

For the shared AI Testers application (no Docker required):

```dotenv
# .env (AI Testers)
APP_BASE_URL=https://aitesters.byst.re
ADMIN_USERNAME=admin
ADMIN_PASSWORD=PASSWORD_YOU_SHOULD_CHANGE
```

Alternatively, copy the ready-to-use AI Testers template:

```bash
cp .env.example .env
```

`.env` is ignored by git (see `.gitignore`) and must never be committed. Only
`.env.example` is tracked, and it must contain placeholders or non-secret
shared training values, never real secrets. The tests fail fast with a clear
message when `ADMIN_USERNAME` or `ADMIN_PASSWORD` is missing.

The training password above is shared publicly, so it is not a secret. If you
ever put a real secret in `.env`, also remember that:

- secrets must not be pasted into `.env.example`, the README or test code;
- in CI, inject them from the CI secret store (e.g. GitHub Actions
  `secrets.*` mapped to environment variables) instead of creating a `.env` file;
- a secret that was committed once stays in git history, so rotate it
  rather than just deleting the file.

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
# or
npx playwright test tests/ui/login.ui.spec.ts
```

**Accessibility scans**

```bash
npm run test:a11y
```

The separate axe proof of concept scans the initial login and registration pages
and their validation states. Registration scans pass; login scans currently fail
on the known divider contrast defect. See [BUG-0016](bugs/ui/BUG-0016-login-sso-divider-contrast.md).
Automated scans catch only some accessibility problems; manual checks remain
necessary. `npm test` also includes this suite.

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

## 🧪 Test Details

### API Tests (`tests/api/login.api.spec.ts`)

These tests cover various scenarios for the `/api/v1/users/signin` endpoint, ordered by response code:

- **Successful Authentication (200)**: Valid credentials return tokens and user information for an administrator account without MFA.
- **Validation Errors (400)**: Empty credentials return errors for both fields.
- **Authentication Errors (422)**: Invalid credentials are rejected.
- **Authorization Errors (401)**: An invalid Bearer token is rejected even with valid credentials.

Requests live in `http/auth-client.ts`. Each test initializes the client in
`beforeEach` using Playwright's `request` context and configured `baseURL`.

### Registration API Tests (`tests/api/registration.api.spec.ts`)

Five scenarios cover registration followed by login, invalid email, duplicate
username, duplicate email and invalid Bearer token. `generateUser()` uses Faker.js
to create unique username/email pairs, a 16-character password and names meeting
the API's 4–255 character limit. Tests track successfully registered accounts and remove only those accounts in
`afterEach` using the configured administrator credentials. Tests that create no
account skip administrator login and cleanup requests.

### UI Tests (`tests/ui/login.ui.spec.ts`)

These tests validate the login page's functionality and user experience:

- **Successful Login**: Valid credentials redirect the user away from the login page
- **Form Validation**: Empty password and invalid credentials keep the user on the login page
- **Navigation**: Clicking on "Register" buttons or links navigates to the registration page
- **Input Validation**: Short username validation prevents form submission

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

## Project testing skills

The `api-testing` skill captures source-first exploration with curl, lean
Playwright automation, and root-cause bug reporting. Both copies live in this
repository: `.agents/skills/api-testing/` for Codex and
`.claude/skills/api-testing/` for Claude Code. `AGENTS.md` routes API work to the
skill; `CLAUDE.md` imports those shared project instructions.

Invoke it with `$api-testing` in Codex or `/api-testing` in Claude Code, or ask
for API testing naturally. The skill uses shared Agent Skills frontmatter and
loads detailed references only for the work being performed. It has no model
version dependency.

The `ui-testing` skill covers frontend source analysis, exploratory testing,
Playwright UI and accessibility automation, and reporting UI findings. Its
copies live in `.agents/skills/ui-testing/` and `.claude/skills/ui-testing/`.
Invoke it with `$ui-testing` in Codex or `/ui-testing` in Claude Code, or ask
for UI testing naturally. `AGENTS.md` routes relevant work to the skill.

Edit the relevant `.agents` copy, then run `npm run skills:sync` and
`npm run skills:check`. Sync copies source files without deleting extra files;
if a reference was removed, explicitly remove its obsolete Claude copy too.
The check fails on missing, extra, or different files.

The layout follows the official [Codex skill guidance](https://learn.chatgpt.com/docs/build-skills),
[Claude Code skill guidance](https://code.claude.com/docs/en/skills), and
[Anthropic authoring practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

## 📝 License

This project is licensed under the ISC License.

For more information on setting up and using the Dockerized environment, refer to the awesome-localstack repository.

### Registration UI coverage

`tests/ui/registration.ui.spec.ts` covers successful registration with HTTP cleanup,
required fields, invalid email, short username/password, duplicate username/email,
navigation and basic keyboard accessibility. Tests follow the login suite's
explicit Given–When–Then style. The separate registration axe scans cover the
initial page and validation state. Known defects remain in bug reports; their
regression tests belong with the fixes.
