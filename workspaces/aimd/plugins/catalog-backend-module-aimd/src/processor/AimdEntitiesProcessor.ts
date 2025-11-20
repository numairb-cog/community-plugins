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
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PART_OF,
  RELATION_HAS_PART,
} from '@backstage/catalog-model';
import type { LocationSpec } from '@backstage/plugin-catalog-node';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import { aimdEntityV1alpha1Validator } from '@backstage-community/plugin-aimd-common';

/**
 * Processor for Aimd entities.
 *
 * @public
 */
export class AimdEntitiesProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'AimdEntitiesProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return await aimdEntityV1alpha1Validator.check(entity);
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    const selfRef = getCompoundEntityRef(entity);

    /**
     * Utilities
     */
    function doEmit(
      targets: string | string[] | undefined,
      context: { defaultKind?: string; defaultNamespace: string },
      outgoingRelation: string,
      incomingRelation: string,
    ): void {
      if (!targets) {
        return;
      }
      for (const target of [targets].flat()) {
        const targetRef = parseEntityRef(target, context);
        emit(
          processingResult.relation({
            source: selfRef,
            type: outgoingRelation,
            target: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
          }),
        );
        emit(
          processingResult.relation({
            source: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
            type: incomingRelation,
            target: selfRef,
          }),
        );
      }
    }

    /**
     * Emit relations for Aimd entities
     */
    if (entity.kind === 'Aimd') {
      doEmit(
        entity.spec?.owner,
        { defaultKind: 'Group', defaultNamespace: selfRef.namespace },
        RELATION_OWNED_BY,
        RELATION_OWNER_OF,
      );

      doEmit(
        entity.spec?.system,
        { defaultKind: 'System', defaultNamespace: selfRef.namespace },
        RELATION_PART_OF,
        RELATION_HAS_PART,
      );
    }

    return entity;
  }
}
