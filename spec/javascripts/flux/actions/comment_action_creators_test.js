describe('CommentActionCreators', function() {
  jest.dontMock('keymirror');
  jest.dontMock(pathToFile('constants'));

  global.CONSTANTS.ActionTypes = {
    COMMENT_ATTACHMENT_UPLOADED: 'COMMENT_ATTACHMENT_UPLOADED',
    COMMENT_ATTACHMENT_FAILED: 'COMMENT_ATTACHMENT_FAILED'
  };

  var CommentActionCreators = require.requireActual(pathToFile('actions/comment_action_creators'));

  describe('uploadAttachment()', function() {
    beforeEach(function() {
      $.ajax = jest.genMockFunction();

      Dispatcher.handleServerAction.mockClear();
    });

    it('makes a call to upload assets', function() {
      CommentActionCreators.uploadAttachment('productSlug', 'eventId');

      expect($.ajax).toBeCalled();
    });

    it('dispatches a success event on success', function() {
      $.ajax.mockImplementation(function(options) {
        options.success();
      });

      CommentActionCreators.uploadAttachment('productSlug', 'eventId');

      // Dispatcher.handleServerAction is alread mocked
      expect(Dispatcher.handleServerAction).toBeCalled();
      expect(Dispatcher.handleServerAction.mock.calls[0][0].type).toEqual('COMMENT_ATTACHMENT_UPLOADED');
    });

    it('dispatches a failure event on error', function() {
      $.ajax.mockImplementation(function(options) {
        options.error();
      });

      CommentActionCreators.uploadAttachment('productSlug', 'eventId');

      // Dispatcher.handleServerAction is alread mocked
      expect(Dispatcher.handleServerAction).toBeCalled();
      expect(Dispatcher.handleServerAction.mock.calls[0][0].type).toEqual('COMMENT_ATTACHMENT_FAILED');
    });
  });
});
