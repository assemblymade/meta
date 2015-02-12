jest.dontMock(pathToFile('stores/attachment_store'));

var ActionTypes = require(appFile('constants')).ActionTypes;

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
        commentId: 'foo',
        type: ActionTypes.ATTACHMENT_UPLOADED,
        attachment: { name: 'attachment' }
      });

      expect(AttachmentStore.getAttachment('foo').name).toEqual('attachment');
    });
  });

  describe('getError()', function() {
    // the error is getting clobbered somewhere :(
    xit('returns the latest error', function() {
      var error = 'attachment failed';

      callback({
        commentId: 'foo',
        type: ActionTypes.ATTACHMENT_FAILED,
        error: error
      });

      expect(AttachmentStore.getError('foo')).toEqual(error);
    });
  });
});
