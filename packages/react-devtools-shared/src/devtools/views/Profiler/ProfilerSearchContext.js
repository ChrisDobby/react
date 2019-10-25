/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, {createContext, useReducer} from 'react';
import {createRegExp} from '../utils';

export type StateContext = {|
  searchIndex: number | null,
  searchResults: Array<number>,
  searchText: string,
|};

type SearchNode = {|id: number, name: string|};

type SelectNode = (node: SearchNode) => void;

type ACTION_GO_TO_NEXT_SEARCH_RESULT = {|
  type: 'GO_TO_NEXT_SEARCH_RESULT',
|};

type ACTION_GO_TO_PREVIOUS_SEARCH_RESULT = {|
  type: 'GO_TO_PREVIOUS_SEARCH_RESULT',
|};

type ACTION_SET_SEARCH_TEXT = {|
  type: 'SET_SEARCH_TEXT',
  payload: string,
|};

type ACTION_SET_CHART_DATA = {|
  type: 'SET_CHART_DATA',
  payload: {
    data: Array<Array<SearchNode>> | Array<SearchNode>,
    selectNode: SelectNode,
  },
|};

type Action =
  | ACTION_GO_TO_NEXT_SEARCH_RESULT
  | ACTION_GO_TO_PREVIOUS_SEARCH_RESULT
  | ACTION_SET_SEARCH_TEXT
  | ACTION_SET_CHART_DATA;

export type DispatcherContext = (action: Action) => void;

const ProfilerSearchStateContext = createContext<StateContext>(
  ((null: any): StateContext),
);
ProfilerSearchStateContext.displayName = 'ProfilerSearchStateContext';

const ProfilerSearchDispatcherContext = createContext<DispatcherContext>(
  ((null: any): DispatcherContext),
);
ProfilerSearchDispatcherContext.displayName = 'ProfilerSearchDispatcherContext';

type State = {|
  searchIndex: number | null,
  searchResults: Array<SearchNode>,
  searchText: string,
  chartData: Array<Array<SearchNode>> | Array<SearchNode> | null,
  selectNode: SelectNode,
|};

function searchChart(
  items: Array<Array<SearchNode>> | Array<SearchNode> | null,
  searchText: string,
) {
  if (items === null || searchText === '') {
    return [];
  }

  const regExp = createRegExp(searchText);
  const results = [];
  for (let i = 0; i < items.length; i++) {
    if (Array.isArray(items[i])) {
      results.push(
        ...items[i]
          .filter(node => regExp.test(node.name))
          .map(node => ({id: node.id, name: node.name})),
      );
    } else if (typeof items[i] === 'object' && regExp.test(items[i].name)) {
      results.push({
        id: items[i].id,
        name: items[i].name,
      });
    }
  }

  return results;
}

function reduce(state: State, action: Action) {
  let {searchIndex, searchResults, searchText, chartData, selectNode} = state;
  const numberOfSearchResults = searchResults.length;

  switch (action.type) {
    case 'SET_SEARCH_TEXT':
      searchText = (action: ACTION_SET_SEARCH_TEXT).payload;
      searchResults = searchChart(chartData, searchText);
      searchIndex = searchResults.length > 0 ? 0 : null;
      break;

    case 'SET_CHART_DATA':
      chartData = (action: ACTION_SET_CHART_DATA).payload.data;
      selectNode = (action: ACTION_SET_CHART_DATA).payload.selectNode;
      searchResults = searchChart(chartData, searchText);
      searchIndex = searchResults.length > 0 ? 0 : null;
      break;

    case 'GO_TO_NEXT_SEARCH_RESULT':
      if (numberOfSearchResults > 0) {
        searchIndex =
          searchIndex + 1 < numberOfSearchResults ? searchIndex + 1 : 0;
      }
      break;

    case 'GO_TO_PREVIOUS_SEARCH_RESULT':
      if (numberOfSearchResults > 0) {
        searchIndex =
          searchIndex !== null && searchIndex > 0
            ? searchIndex - 1
            : numberOfSearchResults - 1;
      }
      break;

    default:
      return state;
  }

  if (searchIndex !== null) {
    const node = searchResults[searchIndex];
    selectNode(node);
  }

  return {
    ...state,
    searchIndex,
    searchResults,
    searchText,
    chartData,
    selectNode,
  };
}

type Props = {|
  children: React$Node,
|};

function ProfilerSearchContextController({children}: Props) {
  const [state, dispatch] = useReducer(reduce, {
    searchIndex: null,
    searchResults: [],
    searchText: '',
    chartData: null,
    selectNode: () => {},
  });

  return (
    <ProfilerSearchStateContext.Provider value={state}>
      <ProfilerSearchDispatcherContext.Provider value={dispatch}>
        {children}
      </ProfilerSearchDispatcherContext.Provider>
    </ProfilerSearchStateContext.Provider>
  );
}

export {
  ProfilerSearchDispatcherContext,
  ProfilerSearchStateContext,
  ProfilerSearchContextController,
};
