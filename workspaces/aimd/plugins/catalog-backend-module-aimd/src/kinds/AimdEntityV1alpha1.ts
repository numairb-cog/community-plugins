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

import type { Entity, KindValidator } from '@backstage/catalog-model';
import { entityKindSchemaValidator } from '@backstage/catalog-model';
import schema from '../schema/AIMD.v1alpha1.schema.json';

/**
 * Backstage AIMD entity.
 *
 * @public
 */
export interface AimdEntityV1alpha1 extends Entity {
  apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
  kind: 'AIMD';
  spec: {
    type: string;
    lifecycle: string;
    owner: string;
    system?: string;
    definition: string;
  };
}

/**
 * {@link KindValidator} for {@link AimdEntityV1alpha1}.
 *
 * @public
 */
const validator = entityKindSchemaValidator(schema);
export const aimdEntityV1alpha1Validator: KindValidator = {
  async check(data: unknown) {
    try {
      return validator(data) === data;
    } catch {
      return false;
    }
  },
};
