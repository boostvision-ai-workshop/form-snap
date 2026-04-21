# MCP Setup Guide for opencode

## 1. What is MCP

Model Context Protocol (MCP) is a standard for connecting AI tools to external systems in a structured way. Instead of hard-coding one-off integrations, an MCP server exposes tools, resources, and prompts through a shared protocol that compatible clients can use.

For this template, MCP matters because it lets agents reach services outside the local repository when needed. Key examples include Figma (reading existing designs) and Stitch (generating new designs from prompts): a Designer agent can inspect design files or generate UI screens without copying that information into the codebase. More generally, MCP gives agents a clean way to interact with external tools and APIs when a workflow requires it. Official spec: <https://modelcontextprotocol.io/>

## 2. Where MCP Configs Live

opencode stores MCP configuration at the **user level** in `~/.config/opencode/opencode.json`.

Inside that file, MCP servers live under the top-level `"mcp"` key. These settings are **not** project-level by default because they often contain sensitive values such as OAuth credentials, access tokens, or custom headers.

> WARNING: Never commit MCP config files to version control.

General shape:

```json
{
  "mcp": {
    "server-name": {
      "type": "remote",
      "enabled": true
    }
  }
}
```

## 3. Figma MCP Setup

Use Figma MCP when you want agents to read design files in Figma.

1. Go to Figma settings and create or retrieve the OAuth credentials required by Figma MCP, or follow the latest instructions in the Figma MCP documentation.
2. Open `~/.config/opencode/opencode.json`.
3. Add a `figma` entry under the `"mcp"` key:

```json
{
  "mcp": {
    "figma": {
      "type": "remote",
      "enabled": true,
      "url": "https://mcp.figma.com/mcp",
      "oauth": {
        "clientId": "your-client-id",
        "clientSecret": "your-client-secret"
      }
    }
  }
}
```

4. Save the file and start opencode normally.
5. On first use, opencode will handle the OAuth flow automatically.

What this enables:

- Designer workflows can read Figma components and layer structure.
- Agents can inspect styles, variables, and layout metadata from shared design files.
- Design context stays in Figma instead of being copied into the repo.

## 3.5. Stitch MCP Setup (Google AI Design Generation)

Use Stitch MCP when you want agents to generate new design screens from text prompts. Stitch is Google's AI-powered UI design platform that creates production-ready HTML/CSS from natural language descriptions. Unlike Figma MCP (which reads existing designs), Stitch MCP generates new designs through AI.

> NOTE: Stitch is an experimental Google product. Setup requirements may change as the platform evolves.

### Option A: Using Community CLI (Recommended)

1. Get a Stitch API key from Google Cloud Console, or run the interactive setup:
   ```bash
   npx @_davideast/stitch-mcp init
   ```

2. Open `~/.config/opencode/opencode.json`.

3. Add a `stitch` entry under the `"mcp"` key:

```json
{
  "mcp": {
    "stitch": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_API_KEY": "your-stitch-api-key"
      }
    }
  }
}
```

4. Save the file and start opencode normally.

### Option B: Using Official SDK

Use the official Google SDK instead of the community CLI:

```json
{
  "mcp": {
    "stitch": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "@google/stitch-sdk", "proxy"],
      "env": {
        "STITCH_API_KEY": "your-stitch-api-key"
      }
    }
  }
}
```

### Option C: OAuth via gcloud (No API Key)

Authenticate using your local gcloud credentials instead of an API key:

```json
{
  "mcp": {
    "stitch": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_USE_SYSTEM_GCLOUD": "1",
        "GOOGLE_CLOUD_PROJECT": "your-project-id"
      }
    }
  }
}
```

This requires `gcloud` CLI to be installed and authenticated on your system.

What this enables:

- Designer workflows can generate new UI screens from text prompts.
- Agents can retrieve HTML/CSS code and screenshots from generated designs.
- Design iteration happens through AI generation rather than manual design tools.
- Rapid prototyping without opening Figma or other design software.

### Optional: Using Both Together

You can configure both Figma and Stitch simultaneously for hybrid workflows:

```json
{
  "mcp": {
    "figma": {
      "type": "remote",
      "enabled": true,
      "url": "https://mcp.figma.com/mcp",
      "oauth": {
        "clientId": "your-client-id",
        "clientSecret": "your-client-secret"
      }
    },
    "stitch": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_API_KEY": "your-stitch-api-key"
      }
    }
  }
}
```

This lets agents read existing Figma designs **and** generate new designs via Stitch in the same project.

## 4. MCP Server Types

opencode can connect to different kinds of MCP servers depending on how they are hosted and authenticated.

### Remote + OAuth

Use this for hosted MCP services that rely on OAuth, such as Figma MCP.

```json
{
  "type": "remote",
  "enabled": true,
  "url": "https://example.com/mcp",
  "oauth": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret"
  }
}
```

### Remote + Headers

Use this when the server expects API authentication through headers, often a bearer token.

```json
{
  "type": "remote",
  "enabled": true,
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer your-api-key"
  }
}
```

### Local Binary

Use this for an MCP server you run locally through a command.

```json
{
  "type": "local",
  "enabled": true,
  "command": ["npx", "-y", "@example/mcp-server"],
  "args": ["--port", "3100"]
}
```

## 5. Database Access - Why No Supabase MCP

This template does **not** use MCP for database access. Supabase Postgres is accessed through SQLAlchemy inside the FastAPI backend.

That architecture is intentional:

- All data flows through the API server.
- The frontend never queries the database directly.
- Authentication and authorization stay centralized in backend code.
- Database access remains controlled, auditable, and consistent with the service layer.

There is no official Supabase MCP server for this template's application data flow. Instead, the agent system works through code generation and normal backend implementation: SQLAlchemy models, service logic, and Alembic migrations. The database connection itself is configured through the `DATABASE_URL` environment variable; see `docs/setup-guide.md` for environment setup details.

## 6. Adding Custom MCP Servers

You can add project-specific or organization-specific MCP servers by creating another entry under the `"mcp"` key in `~/.config/opencode/opencode.json`.

Basic pattern:

1. Pick a unique key name for the server.
2. Choose the correct server type: `remote` or `local`.
3. Add the required authentication fields, headers, or command settings.
4. Restart opencode if needed and test the server on first use.

Example:

```json
{
  "mcp": {
    "my-custom-server": {
      "type": "remote",
      "enabled": true,
      "url": "https://mcp.example.com/server",
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
```

For the full list of supported options, check the current opencode documentation because available fields can evolve over time.

## 7. Advanced - Project-Level Overrides

**Optional / Advanced:** opencode can also read project-specific MCP overrides from a `.mcp/` directory inside a repository. This is rarely needed, and user-level config is sufficient for most setups. If you use project-level overrides, keep them minimal and avoid storing secrets in shared files. Project-level MCP files should still be gitignored to prevent secret leakage.
