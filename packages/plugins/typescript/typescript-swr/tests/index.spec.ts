// import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';
// import { ReactApolloRawPluginConfig } from '../src/config.js';
// import { parse, GraphQLSchema, buildClientSchema, buildASTSchema, buildSchema } from 'graphql';
// import gql from 'graphql-tag';
import { Types } from '@graphql-codegen/plugin-helpers';
// import { plugin as tsDocumentsPlugin } from '../../operations/src/index.js';
// import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
// import { extract } from 'jest-docblock';

import { parse, buildClientSchema } from 'graphql';

describe('typescript-swr', () => {
  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

  const basicDoc = parse(/* GraphQL */ `
    query testQuery {
      feed {
        id
        commentCount
        repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
      }
    }
  `);

  const queryWithVariables = parse(/* GraphQL */ `
    query withVariables($type: FeedType!) {
      feed(type: $type) {
        id
      }
    }
  `);

  it('returns', () => {
    expect(schema).not.toBe(null);
  });

  describe('Imports', () => {
    it('should import the things', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain("import gql from 'graphql-tag';");
      // we could make this a config option tbh
      expect(content.prepend).toContain('import { useGraphQL } from "~src/shared/graphql/GraphQLClientProvider";');
      expect(content.prepend).toContain('import useSWR, { SWRConfiguration, SWRResponse } from "swr"');
      expect(content.prepend).toContain('import toast from "react-hot-toast";');
    });
  });
});
