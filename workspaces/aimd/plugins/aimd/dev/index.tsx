/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { aimdPlugin } from '../src/plugin';
import { AimdDefinitionCard } from '../src/components/AimdDefinitionCard';

const mockAimdEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Aimd',
  metadata: {
    name: 'api-guidelines',
    description: 'API design guidelines and best practices',
    namespace: 'default',
  },
  spec: {
    type: 'markdown',
    lifecycle: 'production',
    owner: 'platform-team',
    system: 'docs-portal',
    definition: `# API Design Guidelines

This document outlines the best practices and standards for designing RESTful APIs at our organization. Following these guidelines ensures consistency, maintainability, and a great developer experience.

## Core Principles

Our API design philosophy is built on three fundamental principles:

- **Consistency** - Use consistent naming conventions, response formats, and error handling across all endpoints
- **Simplicity** - Keep endpoints intuitive and easy to understand
- **Developer Experience** - Design APIs that are pleasant to use and well-documented

## URL Structure

All API endpoints should follow RESTful conventions:

\`\`\`
GET    /api/v1/resources          # List all resources
POST   /api/v1/resources          # Create a new resource
GET    /api/v1/resources/{id}     # Get a specific resource
PUT    /api/v1/resources/{id}     # Update a resource
DELETE /api/v1/resources/{id}     # Delete a resource
\`\`\`

### Naming Conventions

- Use plural nouns for resource names (e.g., \`/users\`, not \`/user\`)
- Use kebab-case for multi-word resources (e.g., \`/user-profiles\`)
- Avoid verbs in endpoint names - use HTTP methods instead

## Response Format

All responses should be in JSON format with consistent structure:

\`\`\`json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-13T16:00:00Z",
    "version": "1.0"
  }
}
\`\`\`

> **Note:** For paginated responses, include pagination metadata in the \`meta\` object.

## Error Handling

Use standard HTTP status codes and provide meaningful error messages:

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

## Authentication

All API requests must include authentication via Bearer tokens:

\`\`\`
Authorization: Bearer {token}
\`\`\`

For more information, see our [Authentication Guide](#).`,
  },
};

createDevApp()
  .registerPlugin(aimdPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockAimdEntity}>
        <AimdDefinitionCard />
      </EntityProvider>
    ),
    title: 'AIMD Plugin Demo',
    path: '/aimd',
  })
  .render();
