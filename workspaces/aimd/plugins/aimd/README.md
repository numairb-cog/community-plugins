# AIMD Plugin

This plugin provides support for displaying AI Markdown Documentation (AIMD) entities in Backstage.

## Features

- Browse all AIMD entities in the catalog
- Display markdown documentation with syntax highlighting
- Support for GitHub Flavored Markdown
- Fetch markdown from URLs or display inline content

## Installation

1. Install the plugin:

```bash
yarn --cwd packages/app add @backstage-community/plugin-aimd
```

2. Add the AIMD page to your app:

```tsx
// In packages/app/src/App.tsx
import { AimdPage } from '@backstage-community/plugin-aimd';

<Route path="/aimd" element={<AimdPage />} />;
```

3. Add AIMD content to entity pages:

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityAimdContent,
  isAimdAvailable,
} from '@backstage-community/plugin-aimd';

const aimdPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EntityAimdContent />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

export const entityPage = (
  <EntitySwitch>
    {/* ... other cases ... */}
    <EntitySwitch.Case if={isAimdAvailable} children={aimdPage} />
  </EntitySwitch>
);
```

## Usage

Create an AIMD entity in your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: AIMD
metadata:
  name: my-documentation
  description: 'My project documentation'
spec:
  type: markdown
  lifecycle: production
  owner: platform-team
  definition: https://raw.githubusercontent.com/example/repo/main/docs/README.md
```

## License

Apache-2.0
