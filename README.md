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
│   │   ├── users/        # Authentication, user profiles and system prompts
│   │   ├── products/     # Product reads, creation, updates and deletion
│   │   └── test-data/    # Cases shared across API domains
│   └── ui/
│       └── login.ui.spec.ts
├── clients/
│   ├── users/            # One HTTP client per user endpoint
│   └── products/         # One HTTP client per product endpoint
├── fixtures/             # Reusable authentication, setup and cleanup
├── generators/           # User and product data generators
├── validators/           # Reusable response assertions
├── types/                # Request and response interfaces
├── playwright.config.ts
├── test-config.ts
└── package.json
```

## Exploratory API testing

**Planning:** see the [short API test plan](docs/api-test-plan.md) for endpoint coverage, remaining work and parallel-work dependencies.

**Found bugs:** see the [API bug register](docs/bugs/README.md) for individual reports and current status.

See [Exploratory testing documentation](docs/exploratory-testing/README.md) for the curl workflow, functional and Swagger checks, severity labels, and a reusable bug-report template. Findings are tracked in the bug register; the [OpenAPI snapshot](docs/exploratory-testing/openapi-2026-09-10.json) preserves the contract observed on September 10, 2026.

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
npx playwright test tests/api/users/login.api.spec.ts
# Run one domain
npx playwright test tests/api/products/
npx playwright test tests/api/users/
```

**UI Tests**

```bash
npm run test:ui
# or
npx playwright test tests/ui/login.ui.spec.ts
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

## 🧪 Test Details

### API Tests (`tests/api/users/login.api.spec.ts`)

These tests cover various scenarios for the `/api/v1/users/signin` endpoint, ordered by response code:

- **Successful Authentication (200)**: Valid credentials return a 200 status with a JWT token and complete user information
- **Validation Errors (400)**: A parameterized table covers empty username, short username, and short password, checking the exact error map.
- **Authentication Errors (422)**: Invalid credentials result in 422 status codes with error messages

The success validator checks all ten response fields, including refresh tokens and the non-MFA state, and rejects unexpected keys. It accepts unknown JSON so TypeScript interfaces cannot substitute for runtime validation.

Coverage review: the local `test-secure-backend` has service unit tests for successful sign-in and MFA challenges (`UserServiceTest`), plus integration coverage for short credentials and incorrect passwords/usernames (`SignInControllerTest`). No dedicated login DTO validation unit tests were found. The three existing 400 scenarios are therefore retained as separate parameterized cases; this preserves independent field validation through the gateway without repeating HTTP and assertion code.

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

## 📝 License

This project is licensed under the ISC License.

For more information on setting up and using the Dockerized environment, refer to the awesome-localstack repository.

### Sign-up API tests

`tests/api/users/signup.api.spec.ts` covers registration success, representative validation errors, and duplicate username/email rejection. Cases use given/when/then sections, are ordered by expected status (201, then 400), and keep parameter data immediately above each group. Sign-up tests do not log in newly registered users.

Generate valid disposable data with `UserGenerator.generate()` from `generators/user-generator.ts`, using partial overrides for specific scenarios. Cleanup lives in `fixtures/signup-fixture.ts`: it authenticates an administrator and deletes only accounts created by the current test, even when an assertion fails. Configure `ADMIN_USERNAME` and `ADMIN_PASSWORD` through the existing configuration and use a disposable local environment.

Run `npm run test:api`. Known-defect regressions are proposed in the [bug reports](docs/bugs/README.md), not executed as expected failures. Detailed length and Unicode boundary matrices are candidates for backend validation/service tests; those tests have not been added in this repository. Role-assignment checks remain exploratory evidence rather than a registration-only API assertion.


### Authenticated API user fixture

Import `test` from `fixtures/authenticated-user-fixture` and request `authenticatedUser`:

```ts
import { expect } from '@playwright/test';
import { test } from './fixtures/authenticated-user-fixture';
import { CurrentUserClient } from './clients/current-user-client';

test('current user - 200', async ({ request, authenticatedUser }) => {
  // given
  const { token, user } = authenticatedUser;
  const client = new CurrentUserClient(request);

  // when
  const response = await client.getMe(token);

  // then
  expect(response.status()).toBe(200);
  expect((await response.json()).username).toBe(user.username);
});
```

The example paths are relative to the repository root; specs under `tests/api` use `../../`.
The fixture returns `{ token, refreshToken, user }`, where `user` contains the generated registration data, including credentials. Each requesting test gets a unique account. Tests that do not request it create no account. Setup performs one registration and one user login; it makes no user-info request. The existing `signup` fixture owns administrator authentication and deletion, including when user login or test assertions fail. Cleanup requires the configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`; unsuccessful deletion fails the test. Accounts are isolated per test, so the fixture supports parallel execution and retries without sharing mutable user data.
