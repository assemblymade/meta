jest.dontMock(pathToFile('stores/attachment_store'));

var ActionTypes = global.CONSTANTS.ActionTypes;

describe('AttachmentStore', function(){
  var callback;
  var AttachmentStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    AttachmentStore = require(pathToFile('stores/attachment_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getAttachment()', function() {
    it('returns the latest attachment', function() {
      callback({
        type: ActionTypes.ATTACHMENT_UPLOADED,
        attachment: { name: 'attachment' }
      });

      expect(AttachmentStore.getAttachment().name).toEqual('attachment');
    });
  });

  describe('getError()', function() {
    it('returns the latest error', function() {
      var error = new Error('attachemtn failed');

      callback({
        type: ActionTypes.ATTACHMENT_FAILED,
        error: error
      });

      expect(AttachmentStore.getError()).toEqual(error);
    });
  });
});
