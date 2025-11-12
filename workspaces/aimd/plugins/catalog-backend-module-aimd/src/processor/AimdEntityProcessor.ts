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
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PART_OF,
  RELATION_HAS_PART,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  AimdEntityV1alpha1,
  aimdEntityV1alpha1Validator,
} from '../kinds/AimdEntityV1alpha1';

/**
 * Processor for AIMD entities.
 *
 * @public
 */
export class AimdEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'AimdEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'AIMD' && aimdEntityV1alpha1Validator(entity);
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (entity.kind !== 'AIMD') {
      return entity;
    }

    const aimd = entity as AimdEntityV1alpha1;
    const selfRef = getCompoundEntityRef(entity);

    const doEmit = (
      targetRef: string | undefined,
      context: { defaultKind?: string; defaultNamespace: string },
      outgoingRelation: string,
      incomingRelation: string,
    ) => {
      if (!targetRef) {
        return;
      }

      const target = parseEntityRef(targetRef, context);
      emit(
        processingResult.relation({
          source: selfRef,
          type: outgoingRelation,
          target,
        }),
      );
      emit(
        processingResult.relation({
          source: target,
          type: incomingRelation,
          target: selfRef,
        }),
      );
    };

    doEmit(
      aimd.spec.owner,
      { defaultKind: 'Group', defaultNamespace: selfRef.namespace },
      RELATION_OWNED_BY,
      RELATION_OWNER_OF,
    );

    if (aimd.spec.system) {
      doEmit(
        aimd.spec.system,
        { defaultKind: 'System', defaultNamespace: selfRef.namespace },
        RELATION_PART_OF,
        RELATION_HAS_PART,
      );
    }

    return entity;
  }
}
