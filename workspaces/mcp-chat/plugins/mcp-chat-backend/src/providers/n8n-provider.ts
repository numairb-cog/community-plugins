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
import { LLMProvider } from './base-provider';
import { ChatMessage, Tool, ChatResponse, ProviderConfig } from '../types';

export interface N8NProviderConfig extends ProviderConfig {
  inputField?: string;
  responseField?: string;
}

/**
 * N8N Provider
 *
 * Integrates with N8N workflows that connect to ChatGPT or other LLMs.
 * This provider sends chat messages to an N8N webhook endpoint and
 * returns responses back to Backstage.
 *
 * Configuration example in app-config.yaml:
 * ```yaml
 * mcpChat:
 *   providers:
 *     - id: n8n
 *       baseUrl: 'http://dss-ubuntu-1.cec.delllabs.net:5678/webhook/fast-podqa-withjiraInfo'
 *       token: ${N8N_BEARER_TOKEN}
 *       model: 'n8n-chatgpt'
 *       inputField: 'chatInput'    # Optional, defaults to 'chatInput'
 *       responseField: 'output'    # Optional, defaults to 'output'
 * ```
 */
export class N8NProvider extends LLMProvider {
  private inputField: string;
  private responseField: string;

  constructor(config: N8NProviderConfig) {
    super(config);
    this.inputField = config.inputField || 'chatInput';
    this.responseField = config.responseField || 'output';
  }

  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    const requestBody = this.formatRequest(messages, tools);
    const response = await this.makeRequest('', requestBody);
    return this.parseResponse(response);
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      const testPayload = {
        [this.inputField]: 'test',
        sessionId: 'test-connection',
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `N8N API error (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          errorMessage =
            errorText.length > 100
              ? `${errorText.substring(0, 100)}...`
              : errorText;
        }

        if (response.status === 401) {
          errorMessage =
            'Invalid bearer token. Please check your N8N bearer token configuration.';
        } else if (response.status === 429) {
          errorMessage =
            'Rate limit exceeded. Please try again later or check your N8N usage limits.';
        } else if (response.status === 403) {
          errorMessage =
            'Access forbidden. Please check your bearer token permissions.';
        } else if (response.status === 404) {
          errorMessage =
            'N8N webhook not found. Please verify your baseUrl configuration.';
        }

        return {
          connected: false,
          error: errorMessage,
        };
      }

      return {
        connected: true,
        models: [this.model],
      };
    } catch (error) {
      return {
        connected: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to N8N webhook',
      };
    }
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]): any {
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    let question = messages[messages.length - 1].content || '';

    if (question.includes('Prompt: ')) {
      question = question.split('Prompt: ').pop() || question;
    }

    const payload: any = {
      [this.inputField]: question,
    };

    return payload;
  }

  protected parseResponse(response: any): ChatResponse {
    let content: string;

    if (typeof response === 'object' && response !== null) {
      try {
        if (
          response.choices &&
          Array.isArray(response.choices) &&
          response.choices.length > 0 &&
          response.choices[0].message?.content
        ) {
          content = response.choices[0].message.content;
        } else if (this.responseField in response) {
          content = response[this.responseField];
        } else {
          throw new Error('Unexpected response format from N8N');
        }
      } catch (error) {
        throw new Error(
          `Failed to parse N8N response: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    } else {
      throw new Error('Invalid response format from N8N');
    }

    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: content,
          },
        },
      ],
    };
  }

  protected async makeRequest(endpoint: string, body: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N request failed (${response.status}): ${errorText}`);
    }

    return response.json();
  }
}
