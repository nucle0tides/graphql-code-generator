/* eslint-disable no-console */
import { Types } from '@graphql-codegen/plugin-helpers';
import { ClientSideBaseVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';

import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export class Visitor extends ClientSideBaseVisitor {
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: RawClientSideBasePluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {});

    this._documents = documents;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    return [
      ...baseImports,
      'import { useGraphQL } from "~src/shared/graphql/GraphQLClientProvider";',
      'import useSWR, { SWRConfiguration, SWRResponse } from "swr"',
      'import toast from "react-hot-toast";',
    ];
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    _operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    _hasRequiredVariables: boolean
  ): string {
    const operationName = this.convertName(node.name.value);

    const returnType = `export type I${operationName}Return = ${operationResultType};`;

    const hook = `export const use${operationName} = (variables: ${operationVariablesTypes}, config?: SWRConfiguration): SWRResponse<I${operationName}Return, Error> => {
			const { client } = useGraphQL();
			const fetcher = () => client?.request(${documentVariableName}, variables);
      const swrConfig: SWRConfiguration = {
        ...config,
        onError: (err) => {
          toast.error("Failed to fetch data.", { id: "graphql-failed-to-fetch" });
        },
      }
		  return useSWR([${documentVariableName}, variables], fetcher, swrConfig);
		};`;
    return [hook, returnType].join('\n');
  }
}
