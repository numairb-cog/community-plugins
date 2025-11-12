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

import { AimdEntityProcessor } from '../AimdEntityProcessor';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';

describe('AimdEntityProcessor', () => {
  const processor = new AimdEntityProcessor();

  describe('getProcessorName', () => {
    it('should return the processor name', () => {
      expect(processor.getProcessorName()).toBe('AimdEntityProcessor');
    });
  });

  describe('validateEntityKind', () => {
    it('should validate a valid AIMD entity', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
        },
      };

      await expect(processor.validateEntityKind(entity)).resolves.toBe(true);
    });

    it('should reject non-AIMD entity', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
        },
        spec: {
          type: 'service',
          lifecycle: 'production',
          owner: 'user:default/guest',
        },
      };

      await expect(processor.validateEntityKind(entity)).resolves.toBe(false);
    });

    it('should reject invalid AIMD entity', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          definition: 'https://example.com/docs.md',
        },
      };

      await expect(processor.validateEntityKind(entity)).resolves.toBe(false);
    });
  });

  describe('postProcessEntity', () => {
    const location: LocationSpec = {
      type: 'url',
      target: 'https://example.com/catalog-info.yaml',
    };

    it('should emit ownedBy and ownerOf relations', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
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
          source: { kind: 'aimd', namespace: 'default', name: 'test-docs' },
          type: 'ownedBy',
          target: { kind: 'user', namespace: 'default', name: 'guest' },
        },
      });
      expect(emitted[1]).toMatchObject({
        type: 'relation',
        relation: {
          source: { kind: 'user', namespace: 'default', name: 'guest' },
          type: 'ownerOf',
          target: { kind: 'aimd', namespace: 'default', name: 'test-docs' },
        },
      });
    });

    it('should emit partOf and hasPart relations when system is present', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          owner: 'user:default/guest',
          system: 'system:default/platform',
          definition: 'https://example.com/docs.md',
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
          source: { kind: 'aimd', namespace: 'default', name: 'test-docs' },
          type: 'ownedBy',
          target: { kind: 'user', namespace: 'default', name: 'guest' },
        },
      });
      expect(emitted[1]).toMatchObject({
        type: 'relation',
        relation: {
          source: { kind: 'user', namespace: 'default', name: 'guest' },
          type: 'ownerOf',
          target: { kind: 'aimd', namespace: 'default', name: 'test-docs' },
        },
      });

      expect(emitted[2]).toMatchObject({
        type: 'relation',
        relation: {
          source: { kind: 'aimd', namespace: 'default', name: 'test-docs' },
          type: 'partOf',
          target: { kind: 'system', namespace: 'default', name: 'platform' },
        },
      });
      expect(emitted[3]).toMatchObject({
        type: 'relation',
        relation: {
          source: { kind: 'system', namespace: 'default', name: 'platform' },
          type: 'hasPart',
          target: { kind: 'aimd', namespace: 'default', name: 'test-docs' },
        },
      });
    });

    it('should not emit system relations when system is not present', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted).toHaveLength(2);
      expect(emitted.every((e: any) => e.relation.type !== 'partOf')).toBe(
        true,
      );
      expect(emitted.every((e: any) => e.relation.type !== 'hasPart')).toBe(
        true,
      );
    });

    it('should not process non-AIMD entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
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

    it('should use default namespace for owner reference', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'custom-namespace',
        },
        spec: {
          type: 'markdown',
          lifecycle: 'production',
          owner: 'guest', // no namespace specified
          definition: 'https://example.com/docs.md',
        },
      };

      const emitted: any[] = [];
      const emit = jest.fn((result: any) => {
        emitted.push(result);
      });

      await processor.postProcessEntity(entity, location, emit);

      expect(emitted[0].relation.target).toMatchObject({
        kind: 'group',
        namespace: 'custom-namespace', // should use entity's namespace
        name: 'guest',
      });
    });
  });
});
