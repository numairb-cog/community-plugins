# catalog-backend-module-aimd

This is a backend module for the catalog plugin that adds support for the AIMD (AI Markdown Documentation) entity kind.

## Installation

Add the module to your backend:

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins

backend.add(import('@backstage-community/plugin-catalog-backend-module-aimd'));

backend.start();
```

## AIMD Entity

The AIMD entity kind allows you to register markdown documentation files as first-class entities in the Backstage catalog.

Example AIMD entity:

```yaml
apiVersion: backstage.io/v1alpha1
kind: AIMD
metadata:
  name: architecture-docs
  description: Architecture documentation for the system
spec:
  type: markdown
  lifecycle: production
  owner: platform-team
  system: core-platform
  definition: https://raw.githubusercontent.com/example/repo/main/docs/ARCHITECTURE.md
```

### Spec Fields

- `type` (required): The type of the markdown documentation (e.g., "markdown", "mdx", "asciidoc")
- `lifecycle` (required): The lifecycle state of the documentation (e.g., "experimental", "production", "deprecated")
- `owner` (required): An entity reference to the owner of the documentation
- `system` (optional): An entity reference to the system that the documentation belongs to
- `definition` (required): The URL or content of the markdown documentation

## Frontend Plugin

To display AIMD entities in your Backstage frontend, install the companion frontend plugin:

```bash
yarn workspace app add @backstage-community/plugin-aimd
```

See the [@backstage-community/plugin-aimd](../aimd/README.md) documentation for frontend integration instructions.
