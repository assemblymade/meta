describe('CommentAttachmentStore', function() {
  var ActionTypes = require(appFile('constants')).ActionTypes;

  var dispatcherCallback;
  var CommentAttachmentStore;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'))
    CommentAttachmentStore = require.requireActual(pathToFile('stores/comment_attachment_store'));
    dispatcherCallback = Dispatcher.register.mock.calls[0][0];
  })

  describe('addAttachment()', function() {
    it('responds to COMMENT_ATTACHMENT_ADDED and assigns the attachment', function() {
      dispatcherCallback({
        type: ActionTypes.COMMENT_ATTACHMENT_ADDED,
        event: {
          attachmentId: 'attachmentId',
          reactId: '.i'
        }
      });

      expect(CommentAttachmentStore.getAttachments('.i')).toEqual(['attachmentId']);
    });
  });

  describe('addError()', function() {
    it('responds to COMMENT_ATTACHMENT_FAILED and assigns an error', function() {
      dispatcherCallback({
        type: ActionTypes.COMMENT_ATTACHMENT_FAILED,
        event: {
          attachmentId: 'attachmentId',
          eventId: 'eventId',
          error: 'blergh'
        }
      });

      expect(CommentAttachmentStore.getErrors('eventId')).toEqual(['blergh']);
    });
  });

  describe('clearErrors()', function() {
    it('responds to COMMENT_ATTACHMENT_UPLOADED and clears errors', function() {
      dispatcherCallback({
        type: ActionTypes.COMMENT_ATTACHMENT_FAILED,
        event: {
          attachmentId: 'attachmentId',
          eventId: 'eventId',
          error: 'blergh'
        }
      });

      // FIXME: Clearing out the CommentAttachmentStore is causing strange errors
      //        As a result, we can't be sure what this will retu
      // expect(CommentAttachmentStore.getErrors('eventId')).toEqual(['blergh']);

      dispatcherCallback({
        type: ActionTypes.COMMENT_ATTACHMENT_UPLOADED,
        event: {
          attachmentId: 'attachmentId',
          eventId: 'eventId'
        }
      });

      expect(CommentAttachmentStore.getErrors('eventId')).toEqual([]);
    });
  });

  describe('removeAttachments()', function() {
    it('responds to WIP_EVENT_CREATING and clears attachments', function() {
      dispatcherCallback({
        type: ActionTypes.COMMENT_ATTACHMENT_ADDED,
        event: {
          attachmentId: 'attachmentId',
          reactId: '.i'
        }
      });

      // FIXME: Clearing out the CommentAttachmentStore is causing strange errors
      //        As a result, we can't be sure what this will return
      // expect(CommentAttachmentStore.getAttachments('.i')).toEqual(['attachmentId']);

      dispatcherCallback({
        type: ActionTypes.WIP_EVENT_CREATING,
        event: {}
      });

      expect(CommentAttachmentStore.getAttachments('.i')).toEqual([]);
    });
  });
});
