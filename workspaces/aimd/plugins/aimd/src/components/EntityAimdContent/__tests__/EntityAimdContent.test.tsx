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

import { render, screen, waitFor } from '@testing-library/react';
import { EntityAimdContent } from '../EntityAimdContent';
import { useEntity } from '@backstage/plugin-catalog-react';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

global.fetch = jest.fn();

describe('EntityAimdContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: '# Test' },
      },
    });

    render(<EntityAimdContent />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render inline markdown content', async () => {
    const markdownContent = '# Hello World\n\nThis is a test.';
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: markdownContent },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('This is a test.')).toBeInTheDocument();
    });
  });

  it('should fetch and render markdown from HTTP URL', async () => {
    const markdownContent = '# Remote Content\n\nFetched from URL.';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => markdownContent,
    });

    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: 'http://example.com/docs.md' },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('Remote Content')).toBeInTheDocument();
      expect(screen.getByText('Fetched from URL.')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('http://example.com/docs.md');
  });

  it('should fetch and render markdown from HTTPS URL', async () => {
    const markdownContent = '# Secure Content\n\nFetched from HTTPS.';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => markdownContent,
    });

    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: 'https://example.com/docs.md' },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('Secure Content')).toBeInTheDocument();
      expect(screen.getByText('Fetched from HTTPS.')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/docs.md');
  });

  it('should display error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: 'https://example.com/missing.md' },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to fetch markdown: Not Found/),
      ).toBeInTheDocument();
    });
  });

  it('should display error when fetch throws exception', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );

    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: 'https://example.com/docs.md' },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('should display error when definition is missing', async () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: {},
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(
        screen.getByText(/No definition found in entity spec/),
      ).toBeInTheDocument();
    });
  });

  it('should render markdown with code blocks', async () => {
    const markdownContent =
      '# Code Example\n\n```javascript\nconst x = 42;\n```';
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: markdownContent },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('Code Example')).toBeInTheDocument();
      expect(screen.getByText(/const x = 42/)).toBeInTheDocument();
    });
  });

  it('should render markdown with links', async () => {
    const markdownContent = '# Links\n\n[Backstage](https://backstage.io)';
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: markdownContent },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('Links')).toBeInTheDocument();
      const link = screen.getByRole('link', { name: 'Backstage' });
      expect(link).toHaveAttribute('href', 'https://backstage.io');
    });
  });

  it('should render markdown with lists', async () => {
    const markdownContent = '# List\n\n- Item 1\n- Item 2\n- Item 3';
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: markdownContent },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  it('should render markdown with tables', async () => {
    const markdownContent =
      '# Table\n\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: markdownContent },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText('Table')).toBeInTheDocument();
      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Header 2')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 2')).toBeInTheDocument();
    });
  });

  it('should handle non-Error exceptions', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'AIMD',
        metadata: { name: 'test-docs' },
        spec: { definition: 'https://example.com/docs.md' },
      },
    });

    render(<EntityAimdContent />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load markdown/)).toBeInTheDocument();
    });
  });
});
