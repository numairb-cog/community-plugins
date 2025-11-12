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

export { catalogModuleAimd } from './module';
export { AimdEntityProcessor } from './processor/AimdEntityProcessor';
export {
  ComponentAimdProcessor,
  ANNOTATION_AIMD_CONSUMES,
} from './processor/ComponentAimdProcessor';
export type { AimdEntityV1alpha1 } from './kinds/AimdEntityV1alpha1';
export { aimdEntityV1alpha1Validator } from './kinds/AimdEntityV1alpha1';
export { RELATION_CONSUMES_AIMD, RELATION_AIMD_CONSUMED_BY } from './relations';
