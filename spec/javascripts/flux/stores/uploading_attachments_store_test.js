jest.dontMock(pathToFile('stores/uploading_attachments_store'));

var ActionTypes = require(appFile('constants')).ActionTypes;

describe('UploadingAttachmentsStore', function(){
  var callback;
  var UploadingAttachmentsStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    UploadingAttachmentsStore = require(pathToFile('stores/uploading_attachments_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getUploadingAttachments()', function() {
    it('returns the attachments being uploaded', function() {
      callback({
        commentId: 'foo',
        type: ActionTypes.ATTACHMENT_UPLOADING,
        text: '![Uploading](attachment...)'
      });

      callback({
        commentId: 'foo',
        type: ActionTypes.ATTACHMENT_UPLOADING,
        text: '![Uploading](attachment2...)'
      });

      var attachments = UploadingAttachmentsStore.getUploadingAttachments('foo');

      expect(attachments[0]).toEqual('![Uploading](attachment...)');
      expect(attachments[1]).toEqual('![Uploading](attachment2...)');
    });
  });
});
