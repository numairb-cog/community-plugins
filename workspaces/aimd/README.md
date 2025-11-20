# AIMD Plugin for Backstage

The AIMD plugin introduces a new catalog kind called "Aimd" that allows you to display markdown documentation files as entities in your Backstage catalog. This plugin follows the same patterns as the API plugin but is designed specifically for markdown content.

## Features

- **New Catalog Kind**: Introduces the "Aimd" kind for markdown documentation entities
- **Markdown Rendering**: Beautiful rendering of markdown content with syntax highlighting
- **Entity Integration**: Seamlessly integrates with Backstage's catalog system
- **Relations Support**: Supports owner and system relations like other catalog entities
- **$text Substitution**: Load markdown content from external files using `$text` references

## Packages

This workspace contains three packages:

### @backstage-community/plugin-aimd

Frontend plugin that provides UI components for displaying AIMD entities.

**Key Components:**

- `AimdDefinitionCard`: Displays markdown content with tabs for rendered and raw views

### @backstage-community/plugin-catalog-backend-module-aimd

Backend module that handles AIMD entity validation and processing.

**Features:**

- Entity validation using JSON schema
- Automatic relation emission for owners and systems
- Integration with Backstage's catalog processing pipeline

### @backstage-community/plugin-aimd-common

Common library containing shared types and validation logic.

**Exports:**

- `AimdEntityV1alpha1`: TypeScript interface for AIMD entities
- `aimdEntityV1alpha1Validator`: JSON schema validator

## Installation

### Backend Setup

1. Install the backend module:

```bash
yarn workspace backend add @backstage-community/plugin-catalog-backend-module-aimd
```

2. Register the module in your backend (`packages/backend/src/index.ts`):

```typescript
import { catalogModuleAimdEntityModel } from '@backstage-community/plugin-catalog-backend-module-aimd';

// In your backend initialization
backend.add(catalogModuleAimdEntityModel());
```

### Frontend Setup

1. Install the frontend plugin:

```bash
yarn workspace app add @backstage-community/plugin-aimd
```

2. Add the AIMD definition card to your entity page (`packages/app/src/components/catalog/EntityPage.tsx`):

```typescript
import { AimdDefinitionCard } from '@backstage-community/plugin-aimd';
import { isKind } from '@backstage/plugin-catalog';

// In your entity page layout
const aimdPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AimdDefinitionCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

// Add to your entity switch
<EntitySwitch>
  <EntitySwitch.Case if={isKind('aimd')}>{aimdPage}</EntitySwitch.Case>
  {/* ... other cases ... */}
</EntitySwitch>;
```

## Usage

### Creating AIMD Entities

Create a YAML file defining your AIMD entity:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Aimd
metadata:
  name: api-guidelines
  description: API design guidelines and best practices
spec:
  type: markdown
  lifecycle: production
  owner: platform-team
  system: docs-portal
  definition: |
    # API Design Guidelines

    This document outlines best practices for API design.

    ## Core Principles

    - **Consistency** - Use consistent naming conventions
    - **Simplicity** - Keep endpoints intuitive
    - **Developer Experience** - Design APIs that are pleasant to use
```

### Using External Markdown Files

You can reference external markdown files using the `$text` substitution:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Aimd
metadata:
  name: onboarding-guide
  description: New employee onboarding documentation
spec:
  type: markdown
  lifecycle: production
  owner: hr-team
  definition:
    $text: ./onboarding-guide.md
```

### Entity Spec Fields

- **type** (required): The type of documentation (e.g., "markdown")
- **lifecycle** (required): The lifecycle state (e.g., "production", "experimental", "deprecated")
- **owner** (required): Entity reference to the owner (e.g., "team-name")
- **definition** (required): Markdown content (string) or reference to markdown file (object with `$text` property)
- **system** (optional): Entity reference to the system this documentation belongs to

## Examples

See the `examples/` directory for complete examples:

- `api-guidelines.yaml`: API design guidelines with inline markdown
- `onboarding-guide.yaml`: Employee onboarding documentation

## Development

### Running the Frontend Plugin in Development Mode

```bash
cd workspaces/aimd/plugins/aimd
yarn start
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests for a specific package
yarn workspace @backstage-community/plugin-aimd test
```

### Linting

```bash
yarn lint
```

## Contributing

Contributions are welcome! Please follow the [Backstage contribution guidelines](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md).

## License

Apache-2.0
