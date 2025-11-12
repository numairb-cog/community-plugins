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

## Relations

### consumesAimd / aimdConsumedBy

Components can declare that they consume AIMD documentation using the `aimd.io/consumes` annotation. This creates bidirectional relations similar to how components consume APIs.

Example component that consumes AIMD documentation:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    aimd.io/consumes: 'aimd:default/architecture-docs, aimd:default/api-guide'
spec:
  type: service
  lifecycle: production
  owner: platform-team
```

This will create:

- `consumesAimd` relations from the component to the AIMD entities
- `aimdConsumedBy` relations from the AIMD entities back to the component

### dependsOn / dependencyOf

Components can also use the standard `dependsOn` relation to reference AIMD entities:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
spec:
  type: service
  lifecycle: production
  owner: platform-team
  dependsOn:
    - aimd:default/architecture-docs
```

## Frontend Plugin

To display AIMD entities in your Backstage frontend, install the companion frontend plugin:

```bash
yarn workspace app add @backstage-community/plugin-aimd
```

See the [@backstage-community/plugin-aimd](../aimd/README.md) documentation for frontend integration instructions.
