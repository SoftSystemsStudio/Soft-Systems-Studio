# Playwright MCP (Model Context Protocol) Setup

This repository includes **Playwright MCP**, an official Microsoft integration that allows Claude and other AI assistants to control Playwright browser automation directly.

## Installation Status

✅ **@playwright/mcp** (v0.0.54) is installed and configured in the dev container.

- **Global Installation:** `npm install -g @playwright/mcp`
- **GitHub:** [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **NPM:** [@playwright/mcp on npm](https://www.npmjs.com/package/@playwright/mcp)

## Configuration

### Dev Container

The `.devcontainer/devcontainer.json` has been configured with:

```jsonc
"customizations": {
  "vscode": {
    "settings": {
      "modelContextProtocol.servers": {
        "playwright": {
          "command": "sh",
          "args": [
            "-c",
            "npx @playwright/mcp"
          ]
        }
      }
    }
  }
}
```

The `postCreateCommand` also ensures `@playwright/mcp` is globally available:

```bash
npm install -g @playwright/mcp
```

## What You Can Do with Playwright MCP

Once connected, Claude and other AI assistants can:

- **Launch browsers** (Chromium, Firefox, WebKit)
- **Navigate to URLs**
- **Click elements, fill forms**
- **Take screenshots**
- **Extract text and data from pages**
- **Interact with JavaScript on pages**
- **Automate multi-step workflows**

## Example Use Cases

### Web Testing & QA

- Automate end-to-end tests
- Generate test scripts from natural language
- Verify website functionality

### Web Scraping

- Extract data from websites
- Monitor web pages for changes
- Capture dynamic content

### Browser Automation

- Automate repetitive browser tasks
- Fill and submit forms
- Interact with SPA applications

## How to Use in Claude

Simply ask Claude to:

```text
"Use Playwright to open softsystemsstudiollc.com and take a screenshot"
```

Or:

```text
"Automate a login flow to my application at localhost:3000"
```

Claude will use the Playwright MCP tools to perform these actions.

## Troubleshooting

### MCP Server Not Connecting

If you see connection errors:

1. **Verify installation:**

   ```bash
   npm list -g @playwright/mcp
   ```

2. **Reinstall if needed:**

   ```bash
   npm install -g @playwright/mcp
   ```

3. **Check VS Code settings:**
   - Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Search: "Preferences: Open User Settings (JSON)"
   - Verify `modelContextProtocol.servers.playwright` is present

4. **Rebuild dev container:**
   - Command Palette: "Dev Containers: Rebuild Container"

### Browser Installation

Playwright MCP requires browser binaries. First time use will download them automatically:

```bash
playwright install
```

Or download specific browsers:

```bash
playwright install chromium firefox webkit
```

## Documentation & Resources

- **Playwright Docs:** [https://playwright.dev](https://playwright.dev)
- **MCP Specification:** [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **GitHub Repository:** [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **NPM Package:** [@playwright/mcp on npm](https://www.npmjs.com/package/@playwright/mcp)

## Next Steps

1. **Restart your dev container** to activate the configuration
2. **Test with Claude** by asking it to perform a simple browser task
3. **Check the Playwright docs** for available actions and options

---

**Last Updated:** December 31, 2025  
**Package Version:** @playwright/mcp@0.0.54
