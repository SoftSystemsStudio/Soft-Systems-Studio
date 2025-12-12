# Documentation

Welcome to the Soft Systems Studio documentation.

---

## Getting Started

| Document                                | Description                                 |
| --------------------------------------- | ------------------------------------------- |
| [Project Overview](PROJECT_OVERVIEW.md) | **High-level system overview (START HERE)** |
| [Main README](../README.md)             | Project overview and quick start            |
| [Contributing](../CONTRIBUTING.md)      | Development setup and workflow              |

---

## Reference

| Document                        | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| [Architecture](ARCHITECTURE.md) | System design, data flows, and package structure |
| [API Reference](API.md)         | REST API endpoints, authentication, and examples |
| [Environment Variables](ENV.md) | Complete environment variable reference          |

---

## Operations

| Document                    | Description                                        |
| --------------------------- | -------------------------------------------------- |
| [Deployment](DEPLOYMENT.md) | Production deployment guide for all platforms      |
| [Security](SECURITY.md)     | Security model, authentication, and best practices |

---

## Internal

| Document                            | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| [Client Config](CLIENT_CONFIG.md)   | ClientConfig contract for intake → config → prompts |
| [Tailwind Pivot](Tailwind-Pivot.md) | Frontend styling migration notes                    |

---

## Quick Links

### Development

```bash
# Start development
pnpm dev

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

### Database

```bash
# Generate Prisma client
pnpm --filter apps-agent-api prisma:generate

# Run migrations
pnpm --filter apps-agent-api migrate:dev

# Open Prisma Studio
pnpm --filter apps-agent-api prisma studio
```

### Docker

```bash
# Development stack
docker compose -f docker-compose.dev.yml up --build

# Production
docker compose up --build

# Local infrastructure only
docker compose -f infra/docker-compose.yml up -d
```

---

## Support

- **Issues**: [GitHub Issues](https://github.com/SoftSystemsStudio/Soft-Systems-Studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SoftSystemsStudio/Soft-Systems-Studio/discussions)
- **Security**: security@softsystems.studio
