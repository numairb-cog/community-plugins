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

import {
  ComponentAimdProcessor,
  ANNOTATION_AIMD_CONSUMES,
} from '../ComponentAimdProcessor';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';

describe('ComponentAimdProcessor', () => {
  const processor = new ComponentAimdProcessor();
  const location: LocationSpec = {
    type: 'url',
    target: 'https://example.com/catalog-info.yaml',
  };

  describe('getProcessorName', () => {
    it('should return the processor name', () => {
      expect(processor.getProcessorName()).toBe('ComponentAimdProcessor');
    });
  });

  describe('postProcessEntity', () => {
    it('should emit consumesAimd and aimdConsumedBy relations for single AIMD reference', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: 'aimd:default/architecture-docs',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted).toHaveLength(2);
      expect(emitted[0]).toMatchObject({
        type: 'relation',
        relation: {
          source: {
            kind: 'component',
            namespace: 'default',
            name: 'my-service',
          },
          type: 'consumesAimd',
          target: {
            kind: 'aimd',
            namespace: 'default',
            name: 'architecture-docs',
          },
        },
      });
      expect(emitted[1]).toMatchObject({
        type: 'relation',
        relation: {
          source: {
            kind: 'aimd',
            namespace: 'default',
            name: 'architecture-docs',
          },
          type: 'aimdConsumedBy',
          target: {
            kind: 'component',
            namespace: 'default',
            name: 'my-service',
          },
        },
      });
    });

    it('should emit relations for multiple AIMD references', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]:
              'aimd:default/architecture-docs, aimd:default/api-guide',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted).toHaveLength(4);

      expect(emitted[0]).toMatchObject({
        type: 'relation',
        relation: {
          source: {
            kind: 'component',
            namespace: 'default',
            name: 'my-service',
          },
          type: 'consumesAimd',
          target: {
            kind: 'aimd',
            namespace: 'default',
            name: 'architecture-docs',
          },
        },
      });
      expect(emitted[1]).toMatchObject({
        type: 'relation',
        relation: {
          source: {
            kind: 'aimd',
            namespace: 'default',
            name: 'architecture-docs',
          },
          type: 'aimdConsumedBy',
          target: {
            kind: 'component',
            namespace: 'default',
            name: 'my-service',
          },
        },
      });

      expect(emitted[2]).toMatchObject({
        type: 'relation',
        relation: {
          source: {
            kind: 'component',
            namespace: 'default',
            name: 'my-service',
          },
          type: 'consumesAimd',
          target: { kind: 'aimd', namespace: 'default', name: 'api-guide' },
        },
      });
      expect(emitted[3]).toMatchObject({
        type: 'relation',
        relation: {
          source: { kind: 'aimd', namespace: 'default', name: 'api-guide' },
          type: 'aimdConsumedBy',
          target: {
            kind: 'component',
            namespace: 'default',
            name: 'my-service',
          },
        },
      });
    });

    it('should use default kind AIMD when kind is not specified', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: 'architecture-docs',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted[0].relation.target).toMatchObject({
        kind: 'aimd',
        namespace: 'default',
        name: 'architecture-docs',
      });
    });

    it('should use entity namespace as default when namespace is not specified', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'custom-namespace',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: 'architecture-docs',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted[0].relation.target).toMatchObject({
        kind: 'aimd',
        namespace: 'custom-namespace',
        name: 'architecture-docs',
      });
    });

    it('should handle whitespace in annotation value', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]:
              '  aimd:default/docs1  ,  aimd:default/docs2  ',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted).toHaveLength(4);
      expect(emitted[0].relation.target.name).toBe('docs1');
      expect(emitted[2].relation.target.name).toBe('docs2');
    });

    it('should emit error for invalid entity reference', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: 'invalid::reference',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toMatchObject({
        type: 'error',
      });
      expect(emitted[0].error.message).toContain(
        'Invalid AIMD entity reference',
      );
    });

    it('should not process non-Component entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: 'aimd:default/other-docs',
          },
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
        },
      };

      const emit = jest.fn();

      const result = await processor.postProcessEntity(entity, location, emit);

      expect(result).toBe(entity);
      expect(emit).not.toHaveBeenCalled();
    });

    it('should not process Component without annotation', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emit = jest.fn();

      const result = await processor.postProcessEntity(entity, location, emit);

      expect(result).toBe(entity);
      expect(emit).not.toHaveBeenCalled();
    });

    it('should handle empty annotation value', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: '',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emit = jest.fn();

      const result = await processor.postProcessEntity(entity, location, emit);

      expect(result).toBe(entity);
      expect(emit).not.toHaveBeenCalled();
    });

    it('should handle annotation with only commas and whitespace', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'my-service',
          namespace: 'default',
          annotations: {
            [ANNOTATION_AIMD_CONSUMES]: '  ,  ,  ',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      const emit = jest.fn();

      const result = await processor.postProcessEntity(entity, location, emit);

      expect(result).toBe(entity);
      expect(emit).not.toHaveBeenCalled();
    });
  });
});
