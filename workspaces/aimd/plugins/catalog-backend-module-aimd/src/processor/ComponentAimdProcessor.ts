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
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  RELATION_CONSUMES_AIMD,
  RELATION_AIMD_CONSUMED_BY,
} from '../relations';

/**
 * Annotation key for specifying AIMD entities consumed by a component.
 * Value should be a comma-separated list of entity references.
 * Example: "aimd:default/docs1, aimd:default/docs2"
 *
 * @public
 */
export const ANNOTATION_AIMD_CONSUMES = 'aimd.io/consumes';

/**
 * Processor that creates consumesAimd/aimdConsumedBy relations for components
 * that have the aimd.io/consumes annotation.
 *
 * @public
 */
export class ComponentAimdProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'ComponentAimdProcessor';
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (entity.kind !== 'Component') {
      return entity;
    }

    const annotation = entity.metadata.annotations?.[ANNOTATION_AIMD_CONSUMES];
    if (!annotation) {
      return entity;
    }

    const selfRef = getCompoundEntityRef(entity);

    const aimdRefs = annotation
      .split(',')
      .map(ref => ref.trim())
      .filter(ref => ref.length > 0);

    for (const aimdRef of aimdRefs) {
      try {
        const target = parseEntityRef(aimdRef, {
          defaultKind: 'AIMD',
          defaultNamespace: selfRef.namespace,
        });

        emit(
          processingResult.relation({
            source: selfRef,
            type: RELATION_CONSUMES_AIMD,
            target,
          }),
        );
        emit(
          processingResult.relation({
            source: target,
            type: RELATION_AIMD_CONSUMED_BY,
            target: selfRef,
          }),
        );
      } catch (error) {
        emit(
          processingResult.generalError(
            _location,
            `Invalid AIMD entity reference in ${ANNOTATION_AIMD_CONSUMES}: ${aimdRef}`,
          ),
        );
      }
    }

    return entity;
  }
}
