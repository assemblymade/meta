jest.dontMock(appFile('stores/ideas_routes_store'));

describe('IdeasRoutesStore', function() {
  var ActionTypes = global.CONSTANTS.ActionTypes;
  var IdeasRoutesStore;
  var callback;
  var MockComponent;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'));
    IdeasRoutesStore = require(appFile('stores/ideas_routes_store'));
    callback = Dispatcher.register.mock.calls[0][0];
    MockComponent = TestUtils.mockComponent(jest.genMockFn(), 'mockComponent');
  });

  it('receives a component and context', function() {
    callback({
      type: ActionTypes.IDEAS_ROUTE_CHANGED,
      component: MockComponent,
      context: {
        location: 'is everything'
      }
    });

    expect(IdeasRoutesStore.getComponent()).toEqual(MockComponent);
    expect(IdeasRoutesStore.getContext().location).toEqual('is everything');
  });

  it('does not change the context if the action excludes it', function() {
    callback({
      type: ActionTypes.IDEAS_ROUTE_CHANGED,
      component: MockComponent,
      context: {
        location: 'is everything'
      }
    });

    expect(IdeasRoutesStore.getComponent()).toEqual(MockComponent);
    expect(IdeasRoutesStore.getContext().location).toEqual('is everything');

    callback({
      type: ActionTypes.IDEAS_ROUTE_CHANGED,
      component: <div />,
    });

    expect(IdeasRoutesStore.getComponent()).not.toEqual(MockComponent);
    expect(IdeasRoutesStore.getContext().location).toEqual('is everything');
  });

  it('does not change the component if the action excludes it', function() {
    callback({
      type: ActionTypes.IDEAS_ROUTE_CHANGED,
      component: MockComponent,
      context: {
        location: 'is everything'
      }
    });

    expect(IdeasRoutesStore.getComponent()).toEqual(MockComponent);
    expect(IdeasRoutesStore.getContext().location).toEqual('is everything');

    callback({
      type: ActionTypes.IDEAS_ROUTE_CHANGED,
      context: {
        location: 'is nothing'
      }
    });

    expect(IdeasRoutesStore.getComponent()).toEqual(MockComponent);
    expect(IdeasRoutesStore.getContext().location).toEqual('is nothing');
  });
});
