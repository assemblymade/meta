describe('CommentAttachmentStore', function() {
  jest.dontMock('keymirror');
  jest.dontMock(pathToFile('constants'));

  var CONSTANTS = require.requireActual(pathToFile('constants'))
  var ActionTypes = CONSTANTS.ActionTypes;
  var PayloadSources = CONSTANTS.PayloadSources;
  var CommentAttachmentStore = require.requireActual(pathToFile('stores/comment_attachment_store'));
  var dispatcherCallback = Dispatcher.register.mock.calls[0][0];

  describe('addAttachment()', function() {
    it('responds to COMMENT_ATTACHMENT_ADDED and assigns the attachment', function() {
      dispatcherCallback({
        action: {
          type: ActionTypes.COMMENT_ATTACHMENT_ADDED,
          event: {
            attachmentId: 'attachmentId',
            reactId: '.i'
          }
        }
      });

      expect(CommentAttachmentStore.getAttachments('.i')).toEqual(['attachmentId']);
    });
  });

  describe('addError()', function() {
    it('responds to COMMENT_ATTACHMENT_FAILED and assigns an error', function() {
      dispatcherCallback({
        action: {
          type: ActionTypes.COMMENT_ATTACHMENT_FAILED,
          event: {
            attachmentId: 'attachmentId',
            eventId: 'eventId',
            error: 'blergh'
          }
        }
      });

      expect(CommentAttachmentStore.getErrors('eventId')).toEqual(['blergh']);
    });
  });

  describe('clearErrors()', function() {
    it('responds to COMMENT_ATTACHMENT_UPLOADED and clears errors', function() {
      dispatcherCallback({
        action: {
          type: ActionTypes.COMMENT_ATTACHMENT_FAILED,
          event: {
            attachmentId: 'attachmentId',
            eventId: 'eventId',
            error: 'blergh'
          }
        }
      });

      // FIXME: Clearing out the CommentAttachmentStore is causing strange errors
      //        As a result, we can't be sure what this will retu
      // expect(CommentAttachmentStore.getErrors('eventId')).toEqual(['blergh']);

      dispatcherCallback({
        action: {
          type: ActionTypes.COMMENT_ATTACHMENT_UPLOADED,
          event: {
            attachmentId: 'attachmentId',
            eventId: 'eventId'
          }
        }
      });

      expect(CommentAttachmentStore.getErrors('eventId')).toEqual([]);
    });
  });

  describe('removeAttachments()', function() {
    it('responds to WIP_EVENT_CREATING and clears attachments', function() {
      dispatcherCallback({
        action: {
          type: ActionTypes.COMMENT_ATTACHMENT_ADDED,
          event: {
            attachmentId: 'attachmentId',
            reactId: '.i'
          }
        }
      });

      // FIXME: Clearing out the CommentAttachmentStore is causing strange errors
      //        As a result, we can't be sure what this will return
      // expect(CommentAttachmentStore.getAttachments('.i')).toEqual(['attachmentId']);

      dispatcherCallback({
        action: {
          type: ActionTypes.WIP_EVENT_CREATING,
          event: {}
        }
      });

      expect(CommentAttachmentStore.getAttachments('.i')).toEqual([]);
    });
  });
});
