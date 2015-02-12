jest.dontMock(appFile('stores/idea_store'));

describe('IdeaStore', function() {
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var IdeaStore;
  var callback;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'));
    IdeaStore = require(appFile('stores/idea_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  it('receives an idea', function() {
    callback({
      type: ActionTypes.IDEA_RECEIVE,
      idea: {
        name: 'what a great idea'
      }
    });

    expect(IdeaStore.getIdea().name).toEqual('what a great idea');
  });
});
