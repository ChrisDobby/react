import * as React from 'react';
import {useContext, useMemo} from 'react';
import {TreeStateContext} from './TreeContext';
import {createRegExp} from '../utils';

import styles from './DisplayName.css';

type DisplayNameProps = {|
  displayName: string | null,
  id: number,
|};

export default function DisplayName({displayName, id}: DisplayNameProps) {
  const {searchIndex, searchResults, searchText} = useContext(TreeStateContext);
  const isSearchResult = useMemo(() => {
    return searchResults.includes(id);
  }, [id, searchResults]);
  const isCurrentResult =
    searchIndex !== null && id === searchResults[searchIndex];

  if (!isSearchResult || displayName === null) {
    return displayName;
  }

  const match = createRegExp(searchText).exec(displayName);

  if (match === null) {
    return displayName;
  }

  const startIndex = match.index;
  const stopIndex = startIndex + match[0].length;

  const children = [];
  if (startIndex > 0) {
    children.push(<span key="begin">{displayName.slice(0, startIndex)}</span>);
  }
  children.push(
    <mark
      key="middle"
      className={isCurrentResult ? styles.CurrentHighlight : styles.Highlight}>
      {displayName.slice(startIndex, stopIndex)}
    </mark>,
  );
  if (stopIndex < displayName.length) {
    children.push(<span key="end">{displayName.slice(stopIndex)}</span>);
  }

  return children;
}
