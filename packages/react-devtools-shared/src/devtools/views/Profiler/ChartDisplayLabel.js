/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, {useMemo, useContext} from 'react';
import {createRegExp} from '../utils';
import {ProfilerSearchStateContext} from './ProfilerSearchContext';

import styles from './ChartDisplayLabel.css';

type ChartDisplayLabelProps = {|
  label: string | null,
  id: number,
|};

function ChartDisplayLabel({label, id}: ChartDisplayLabelProps) {
  const {searchResults, searchText, searchIndex} = useContext(
    ProfilerSearchStateContext,
  );
  const isSearchResult = useMemo(
    () => {
      return searchResults.map(result => result.id).includes(id);
    },
    [id, searchResults],
  );
  if (!isSearchResult || label === null) {
    return label;
  }

  const isCurrentResult =
    searchIndex !== null && id === searchResults[searchIndex].id;

  const match = createRegExp(searchText).exec(label);

  if (match === null) {
    return label;
  }

  const startIndex = match.index;
  const stopIndex = startIndex + match[0].length;

  const children = [];
  if (startIndex > 0 && label !== null) {
    children.push(<span key="begin">{label.slice(0, startIndex)}</span>);
  }
  children.push(
    <mark
      key="middle"
      className={isCurrentResult ? styles.CurrentHighlight : styles.Highlight}>
      {label.slice(startIndex, stopIndex)}
    </mark>,
  );
  if (stopIndex < label.length) {
    children.push(<span key="end">{label.slice(stopIndex)}</span>);
  }

  return children;
}

export default ChartDisplayLabel;
