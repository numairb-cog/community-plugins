/*
 * Copyright 2024 The Backstage Authors
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

import { useEffect, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, Progress } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js';

const useStyles = makeStyles(theme => ({
  markdown: {
    '& pre': {
      backgroundColor: theme.palette.type === 'dark' ? '#1e1e1e' : '#f6f8fa',
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      overflow: 'auto',
    },
    '& code': {
      backgroundColor: theme.palette.type === 'dark' ? '#1e1e1e' : '#f6f8fa',
      padding: '2px 4px',
      borderRadius: 3,
      fontFamily: 'monospace',
    },
    '& pre code': {
      padding: 0,
      backgroundColor: 'transparent',
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    '& p': {
      marginBottom: theme.spacing(2),
    },
    '& ul, & ol': {
      marginBottom: theme.spacing(2),
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: theme.palette.type === 'dark' ? '#2d2d2d' : '#f6f8fa',
      fontWeight: 'bold',
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
}));

export const EntityAimdContent = () => {
  const { entity } = useEntity();
  const classes = useStyles();
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);

        const definition = (entity.spec as any)?.definition;
        if (!definition) {
          setError('No definition found in entity spec');
          setLoading(false);
          return;
        }

        if (
          definition.startsWith('http://') ||
          definition.startsWith('https://')
        ) {
          const response = await fetch(definition);
          if (!response.ok) {
            throw new Error(`Failed to fetch markdown: ${response.statusText}`);
          }
          const text = await response.text();
          setMarkdown(text);
        } else {
          setMarkdown(definition);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load markdown',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [entity]);

  if (loading) {
    return (
      <InfoCard title="Documentation">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Documentation">
        <div>Error: {error}</div>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="Documentation">
      <div className={classes.markdown}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </InfoCard>
  );
};
