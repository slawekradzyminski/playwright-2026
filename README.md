# 🧪 Test Automation in Practice 2025

A TypeScript-based Playwright suite for validating the current gateway-first application stack powered by awesome-localstack.

## 📦 Project Overview

This repository contains automated API and UI tests for the local training environment used during the Playwright course. The tests target the public gateway URL exposed by awesome-localstack, not raw internal service ports.

## 🔧 Features

- **API Testing**: Validates authentication endpoints with various scenarios, including successful logins and error handling.
- **UI Testing**: Ensures the login interface behaves correctly, covering form validations, navigation, and accessibility.
- **TypeScript Support**: Utilizes TypeScript for type safety and better developer experience with dedicated types in `/types` folder.
- **Dockerized Environment**: Tests are designed to run against services provided by the awesome-localstack Docker setup.

## 🗂️ Project Structure

```
.
├── tests/
│   ├── api/
│   │   └── login.api.spec.ts       # API tests for /api/v1/users/signin endpoint
│   └── ui/
│       └── login.ui.spec.ts        # UI tests for the login page
├── types/
│   └── auth.ts                     # TypeScript interfaces for authentication
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Project metadata and dependencies
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js LTS only, recommended `v24.x.x`
- Docker

### Setup

1. **Clone the Repository**

```bash
git clone https://github.com/slawekradzyminski/playwright-2025
cd playwright-2025
```

2. **Install Dependencies**

```bash
npm install
npx playwright install chromium
```

3. **Start the Dockerized Environment**

Follow the instructions in the awesome-localstack repository and start the lightweight profile:

```bash
git clone https://github.com/slawekradzyminski/awesome-localstack
cd awesome-localstack
docker compose -f lightweight-docker-compose.yml up -d
```

The tests expect the following public app URL:

- **App Gateway**: `http://localhost:8081`
- **Login Page**: `http://localhost:8081/login`
- **Auth API**: `http://localhost:8081/api/v1/users/signin`

If you run the app on a different host or port, override the default:

```bash
APP_BASE_URL=http://localhost:8081 npx playwright test
```

If the training stack uses a different seeded admin password, override that too:

```bash
ADMIN_PASSWORD=your-password npx playwright test
```

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

- **Successful Authentication (200)**: Valid credentials return a 200 status with a JWT token and complete user information
- **Validation Errors (400)**: Tests for empty username, short username, and short password scenarios with appropriate error messages
- **Authentication Errors (422)**: Invalid credentials result in 422 status codes with error messages

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
- **awesome-localstack**: Dockerized local AWS environment for development and testing

## Current Target Architecture

The tests assume a gateway-first local setup:

- browser traffic goes to `http://localhost:8081`
- frontend routes are served by the gateway
- backend API is exposed behind the same origin under `/api/v1/...`
- no test should depend on raw backend port `4001`

## Playwright MCP

The Playwright MCP (Model Context Protocol) server enables browser automation capabilities, allowing AI coding assistants to interact with web pages through structured accessibility snapshots.

Read more about Playwright MCP here: https://github.com/microsoft/playwright-mcp

### Prerequisites

- Node.js 18 or newer (LTS releases only)
- Playwright installed

### Cursor

1. Navigate to `Cursor Settings` → `MCP` → `Add new MCP Server`
2. Name it "playwright" and set the command to `npx @playwright/mcp@latest`
3. Save the configuration

### VS Code (GitHub Copilot)

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

### Codex

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

### Claude Code

Use the Claude Code CLI to add the Playwright MCP server:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

### Claude Desktop

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
