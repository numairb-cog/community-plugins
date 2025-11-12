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

import { aimdEntityV1alpha1Validator } from '../AimdEntityV1alpha1';

describe('aimdEntityV1alpha1Validator', () => {
  describe('check', () => {
    it('should accept a valid AIMD entity', async () => {
      const entity = {
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

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        true,
      );
    });

    it('should accept a valid AIMD entity with system', async () => {
      const entity = {
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

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        true,
      );
    });

    it('should accept inline markdown definition', async () => {
      const entity = {
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
          definition: '# Hello World\n\nThis is inline markdown.',
        },
      };

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        true,
      );
    });

    it('should reject entity missing type', async () => {
      const entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          lifecycle: 'production',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
        },
      };

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });

    it('should reject entity missing lifecycle', async () => {
      const entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 'markdown',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
        },
      };

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });

    it('should reject entity missing owner', async () => {
      const entity = {
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

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });

    it('should reject entity missing definition', async () => {
      const entity = {
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
        },
      };

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });

    it('should reject entity with invalid type field (not string)', async () => {
      const entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: {
          name: 'test-docs',
          namespace: 'default',
        },
        spec: {
          type: 123,
          lifecycle: 'production',
          owner: 'user:default/guest',
          definition: 'https://example.com/docs.md',
        },
      };

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });

    it('should reject entity with empty definition', async () => {
      const entity = {
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
          definition: '',
        },
      };

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });

    it('should reject non-AIMD entity', async () => {
      const entity = {
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

      await expect(aimdEntityV1alpha1Validator.check(entity)).resolves.toBe(
        false,
      );
    });
  });
});
