/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import typeof ReactTestRenderer from 'react-test-renderer';
import type {FrontendBridge} from 'react-devtools-shared/src/bridge';
import type {
  DispatcherContext,
  StateContext,
} from 'react-devtools-shared/src/devtools/views/Profiler/ProfilerSearchContext';
import type Store from 'react-devtools-shared/src/devtools/store';

describe('ProfilerSearchContext', () => {
  let React;
  let ReactDOM;
  let TestRenderer: ReactTestRenderer;
  let bridge: FrontendBridge;
  let store: Store;
  let utils;

  let BridgeContext;
  let ProfilerContextController;
  let StoreContext;
  let TreeContextController;
  let ProfilerSearchContext;

  let dispatch: DispatcherContext;
  let state: StateContext;

  beforeEach(() => {
    utils = require('./utils');
    utils.beforeEachProfiling();

    bridge = global.bridge;
    store = global.store;
    store.collapseNodesByDefault = false;
    store.recordChangeDescriptions = true;

    React = require('react');
    ReactDOM = require('react-dom');
    TestRenderer = utils.requireTestRenderer();

    BridgeContext = require('react-devtools-shared/src/devtools/views/context')
      .BridgeContext;
    ProfilerContextController = require('react-devtools-shared/src/devtools/views/Profiler/ProfilerContext')
      .ProfilerContextController;
    StoreContext = require('react-devtools-shared/src/devtools/views/context')
      .StoreContext;
    TreeContextController = require('react-devtools-shared/src/devtools/views/Components/TreeContext')
      .TreeContextController;
    ProfilerSearchContext = require('react-devtools-shared/src/devtools/views/Profiler/ProfilerSearchContext');
  });

  const Capture = () => {
    dispatch = React.useContext(
      ProfilerSearchContext.ProfilerSearchDispatcherContext,
    );
    state = React.useContext(ProfilerSearchContext.ProfilerSearchStateContext);
    return null;
  };

  const Contexts = ({
    defaultSelectedElementID = null,
    defaultSelectedElementIndex = null,
  }: any) => (
    <BridgeContext.Provider value={bridge}>
      <StoreContext.Provider value={store}>
        <TreeContextController
          defaultSelectedElementID={defaultSelectedElementID}
          defaultSelectedElementIndex={defaultSelectedElementIndex}>
          <ProfilerContextController>
            <ProfilerSearchContext.ProfilerSearchContextController>
              <Capture />
            </ProfilerSearchContext.ProfilerSearchContextController>
          </ProfilerContextController>
        </TreeContextController>
      </StoreContext.Provider>
    </BridgeContext.Provider>
  );

  const selectNode = () => {};

  it('should find elements in the chart rows', () => {
    const chartRows = [
      [{id: 1, name: 'Foo'}],
      [{id: 2, name: 'Bar'}, {id: 3, name: 'Baz'}],
    ];

    const Foo = () => null;
    const Bar = () => null;
    const Baz = () => null;

    utils.act(() =>
      ReactDOM.render(
        <React.Fragment>
          <Foo />
          <Bar />
          <Baz />
        </React.Fragment>,
        document.createElement('div'),
      ),
    );

    let renderer;
    utils.act(() => (renderer = TestRenderer.create(<Contexts />)));
    expect(state).toMatchSnapshot('1: initial state');

    utils.act(() =>
      dispatch({
        type: 'SET_CHART_DATA',
        payload: {data: chartRows, selectNode},
      }),
    );

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'ba'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('2: search for "ba" - multiple match');

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'f'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('3: search for "f" - single match');

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'y'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('4: search for "y" - no match');
  });

  it('should find elements in the chart nodes', () => {
    const chartNodes = [
      {id: 1, name: 'Foo'},
      {id: 2, name: 'Bar'},
      {id: 3, name: 'Baz'},
    ];

    const Foo = () => null;
    const Bar = () => null;
    const Baz = () => null;

    utils.act(() =>
      ReactDOM.render(
        <React.Fragment>
          <Foo />
          <Bar />
          <Baz />
        </React.Fragment>,
        document.createElement('div'),
      ),
    );

    let renderer;
    utils.act(() => (renderer = TestRenderer.create(<Contexts />)));
    expect(state).toMatchSnapshot('1: initial state');

    utils.act(() =>
      dispatch({
        type: 'SET_CHART_DATA',
        payload: {data: chartNodes, selectNode},
      }),
    );

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'ba'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('2: search for "ba" - multiple match');

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'f'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('3: search for "f" - single match');

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'y'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('4: search for "y" - no match');
  });

  it('should select the next and previous items within the search results', () => {
    const chartNodes = [
      {id: 1, name: 'Foo'},
      {id: 2, name: 'Bar'},
      {id: 3, name: 'Baz'},
      {id: 4, name: 'Bar'},
      {id: 5, name: 'Baz'},
    ];

    const Foo = () => null;
    const Bar = () => null;
    const Baz = () => null;

    utils.act(() =>
      ReactDOM.render(
        <React.Fragment>
          <Foo />
          <Bar />
          <Baz />
          <Bar />
          <Baz />
        </React.Fragment>,
        document.createElement('div'),
      ),
    );

    let renderer;
    utils.act(() => (renderer = TestRenderer.create(<Contexts />)));
    expect(state).toMatchSnapshot('1: initial state');

    utils.act(() =>
      dispatch({
        type: 'SET_CHART_DATA',
        payload: {data: chartNodes, selectNode},
      }),
    );

    utils.act(() => dispatch({type: 'SET_SEARCH_TEXT', payload: 'ba'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('2: search for "ba"');

    utils.act(() => dispatch({type: 'GO_TO_NEXT_SEARCH_RESULT'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('3: go to second result');

    utils.act(() => dispatch({type: 'GO_TO_NEXT_SEARCH_RESULT'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('4: go to third result');

    utils.act(() => dispatch({type: 'GO_TO_PREVIOUS_SEARCH_RESULT'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('5: go to second result');

    utils.act(() => dispatch({type: 'GO_TO_PREVIOUS_SEARCH_RESULT'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('6: go to first result');

    utils.act(() => dispatch({type: 'GO_TO_PREVIOUS_SEARCH_RESULT'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('7: wrap to last result');

    utils.act(() => dispatch({type: 'GO_TO_NEXT_SEARCH_RESULT'}));
    utils.act(() => renderer.update(<Contexts />));
    expect(state).toMatchSnapshot('8: wrap to first result');

    store.getElementIDAtIndex(0);
  });
});
