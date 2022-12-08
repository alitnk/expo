import React from 'react';

import { renderMethod } from './APISectionMethods';

import { InlineCode } from '~/components/base/code';
import { B, P } from '~/components/base/paragraph';
import { H2, H3Code, H4 } from '~/components/plugins/Headings';
import { APIDataType } from '~/components/plugins/api/APIDataType';
import {
  CommentData,
  InterfaceDefinitionData,
  MethodSignatureData,
  PropData,
} from '~/components/plugins/api/APIDataTypes';
import { APISectionDeprecationNote } from '~/components/plugins/api/APISectionDeprecationNote';
import { APISectionPlatformTags } from '~/components/plugins/api/APISectionPlatformTags';
import {
  CommentTextBlock,
  getTagData,
  mdInlineComponents,
  parseCommentContent,
  renderFlags,
  renderParamRow,
  ParamsTableHeadRow,
  resolveTypeName,
  renderDefaultValue,
  STYLES_APIBOX,
  STYLES_NESTED_SECTION_HEADER,
  getTagNamesList,
} from '~/components/plugins/api/APISectionUtils';
import { Cell, Row, Table } from '~/ui/components/Table';

export type APISectionInterfacesProps = {
  data: InterfaceDefinitionData[];
};

const renderInterfaceComment = (
  comment?: CommentData,
  signatures?: MethodSignatureData[],
  defaultValue?: string
) => {
  if (signatures && signatures.length) {
    const { type, parameters, comment: signatureComment } = signatures[0];
    const initValue = defaultValue || getTagData('default', signatureComment)?.text;
    return (
      <>
        {parameters?.length ? parameters.map(param => renderParamRow(param)) : null}
        <B>Returns: </B>
        <InlineCode>{resolveTypeName(type)}</InlineCode>
        {signatureComment && (
          <>
            <br />
            <APISectionDeprecationNote comment={comment} />
            <CommentTextBlock
              comment={signatureComment}
              components={mdInlineComponents}
              afterContent={renderDefaultValue(initValue)}
            />
          </>
        )}
      </>
    );
  } else {
    const initValue = defaultValue || getTagData('default', comment)?.text;
    return (
      <>
        <APISectionDeprecationNote comment={comment} />
        <CommentTextBlock
          comment={comment}
          components={mdInlineComponents}
          afterContent={renderDefaultValue(initValue)}
          emptyCommentFallback="-"
        />
      </>
    );
  }
};

const renderInterfacePropertyRow = ({
  name,
  flags,
  type,
  comment,
  signatures,
  defaultValue,
}: PropData): JSX.Element => {
  const initValue = parseCommentContent(defaultValue || getTagData('default', comment)?.text);
  return (
    <Row key={name}>
      <Cell fitContent>
        <B>{name}</B>
        {renderFlags(flags, initValue)}
      </Cell>
      <Cell fitContent>
        <APIDataType typeDefinition={type} />
      </Cell>
      <Cell fitContent>{renderInterfaceComment(comment, signatures, initValue)}</Cell>
    </Row>
  );
};

const renderInterface = ({
  name,
  children,
  comment,
  extendedTypes,
}: InterfaceDefinitionData): JSX.Element | null => {
  const interfaceChildren = children?.filter(child => !child?.inheritedFrom) || [];

  if (!interfaceChildren.length) return null;

  const interfaceMethods = interfaceChildren.filter(child => child.signatures);
  const interfaceFields = interfaceChildren.filter(child => !child.signatures);

  return (
    <div key={`interface-definition-${name}`} css={STYLES_APIBOX}>
      <APISectionDeprecationNote comment={comment} />
      <APISectionPlatformTags comment={comment} prefix="Only for:" />
      <H3Code tags={getTagNamesList(comment)}>
        <InlineCode>{name}</InlineCode>
      </H3Code>
      {extendedTypes?.length ? (
        <P>
          <B>Extends: </B>
          {extendedTypes.map(extendedType => (
            <InlineCode key={`extend-${extendedType.name}`}>
              {resolveTypeName(extendedType)}
            </InlineCode>
          ))}
        </P>
      ) : null}
      <CommentTextBlock comment={comment} includePlatforms={false} />
      {interfaceMethods.length ? (
        <>
          <div css={STYLES_NESTED_SECTION_HEADER}>
            <H4>{name} Methods</H4>
          </div>
          {interfaceMethods.map(method => renderMethod(method, { exposeInSidebar: false }))}
        </>
      ) : undefined}
      {interfaceFields.length ? (
        <>
          <div css={STYLES_NESTED_SECTION_HEADER}>
            <H4>{name} Properties</H4>
          </div>
          <Table>
            <ParamsTableHeadRow />
            <tbody>{interfaceFields.map(renderInterfacePropertyRow)}</tbody>
          </Table>
        </>
      ) : undefined}
    </div>
  );
};

const APISectionInterfaces = ({ data }: APISectionInterfacesProps) =>
  data?.length ? (
    <>
      <H2 key="interfaces-header">Interfaces</H2>
      {data.map(renderInterface)}
    </>
  ) : null;

export default APISectionInterfaces;
