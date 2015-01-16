jest.dontMock(appFile('stores/start_conversation_modal_store'));

describe('StartConversationModalStore', function() {
  var ActionTypes = global.CONSTANTS.ActionTypes;
  var StartConversationModalStore;
  var callback;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'));
    StartConversationModalStore = require(appFile('stores/start_conversation_modal_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  it('sets the modalShown to true on IDEAS_NEW_IDEA_CREATED', function() {
    expect(StartConversationModalStore.isModalShown()).toEqual(false);

    callback({
      type: ActionTypes.IDEAS_NEW_IDEA_CREATED
    });

    expect(StartConversationModalStore.isModalShown()).toEqual(true);
  });

  it('sets the modalShown to false on START_CONVERSATION_MODAL_HIDDEN', function() {
    expect(StartConversationModalStore.isModalShown()).toEqual(false);

    callback({
      type: ActionTypes.IDEAS_NEW_IDEA_CREATED
    });

    expect(StartConversationModalStore.isModalShown()).toEqual(true);

    callback({
      type: ActionTypes.START_CONVERSATION_MODAL_HIDDEN
    });

    expect(StartConversationModalStore.isModalShown()).toEqual(false);
  });
});
