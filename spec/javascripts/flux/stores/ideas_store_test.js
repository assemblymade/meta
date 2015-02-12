jest.dontMock(appFile('stores/ideas_store'));

describe('IdeasStore', function() {
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var IdeasStore;
  var callback;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'));
    IdeasStore = require(appFile('stores/ideas_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  it('receives ideas', function() {
    callback({
      type: ActionTypes.IDEAS_RECEIVE,
      ideas: [{
        name: 'what a great idea'
      }, {
        name: 'this idea is less good'
      }]
    });

    expect(IdeasStore.getIdeas()[0].name).toEqual('what a great idea');
    expect(IdeasStore.getIdeas()[1].name).toEqual('this idea is less good');
  });
});
