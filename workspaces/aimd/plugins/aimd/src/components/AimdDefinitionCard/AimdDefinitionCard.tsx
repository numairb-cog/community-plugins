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

import { useState, ChangeEvent } from 'react';
import { makeStyles, Tab, Tabs } from '@material-ui/core';
import { InfoCard, CodeSnippet } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import ReactMarkdown from 'react-markdown';
import { AimdEntityV1alpha1 } from '@backstage-community/plugin-aimd-common';

const useStyles = makeStyles(theme => ({
  markdown: {
    '& h1': {
      fontSize: '2rem',
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
    '& h2': {
      fontSize: '1.5rem',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1.5),
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
    '& h3': {
      fontSize: '1.125rem',
      marginTop: theme.spacing(2.5),
      marginBottom: theme.spacing(1),
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
    '& p': {
      marginBottom: theme.spacing(1.5),
      lineHeight: 1.8,
    },
    '& ul, & ol': {
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(1.5),
    },
    '& li': {
      marginBottom: theme.spacing(1),
    },
    '& code': {
      backgroundColor: theme.palette.type === 'dark' ? '#2d2d2d' : '#f5f5f5',
      padding: theme.spacing(0.25, 0.75),
      borderRadius: theme.shape.borderRadius,
      fontFamily: 'Monaco, Courier New, monospace',
      fontSize: '0.875rem',
      color: theme.palette.error.main,
    },
    '& pre': {
      backgroundColor: theme.palette.type === 'dark' ? '#2d2d2d' : '#f5f5f5',
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      overflow: 'auto',
      marginBottom: theme.spacing(1.5),
      '& code': {
        backgroundColor: 'transparent',
        padding: 0,
        color: theme.palette.text.primary,
      },
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2),
      margin: theme.spacing(1.5, 0),
      color: theme.palette.text.secondary,
      fontStyle: 'italic',
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      margin: theme.spacing(2, 0),
    },
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1.5),
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: theme.palette.type === 'dark' ? '#2d2d2d' : '#f5f5f5',
      fontWeight: 500,
    },
  },
}));

/**
 * Component for displaying AIMD entity markdown definition.
 *
 * @public
 */
export const AimdDefinitionCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [activeTab, setActiveTab] = useState(0);

  const aimdEntity = entity as AimdEntityV1alpha1;
  const definition = aimdEntity.spec?.definition;

  let definitionText = '';
  if (typeof definition === 'string') {
    definitionText = definition;
  } else if (
    definition &&
    typeof definition === 'object' &&
    '$text' in definition
  ) {
    definitionText = definition.$text as string;
  }

  const handleTabChange = (_event: ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <InfoCard
      title={entity.metadata.name}
      subheader={
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Markdown" />
          <Tab label="Raw" />
        </Tabs>
      }
    >
      {activeTab === 0 && (
        <div className={classes.markdown}>
          <ReactMarkdown>{definitionText}</ReactMarkdown>
        </div>
      )}
      {activeTab === 1 && (
        <CodeSnippet
          text={definitionText}
          language="markdown"
          showCopyCodeButton
        />
      )}
    </InfoCard>
  );
};
