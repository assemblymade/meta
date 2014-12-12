jest.dontMock(appFile('actions/comment_action_creators'));

describe('CommentActionCreators', function() {
  var CommentActionCreators;

  describe('updateComment()', function() {
    beforeEach(function() {
      $.ajax = jest.genMockFunction();

      Dispatcher = require(appFile('dispatcher'));
      CommentActionCreators = require(appFile('actions/comment_action_creators'));
      Dispatcher.dispatch.mockClear();
    });

    it('makes a call to update a comment', function(){
      CommentActionCreators.updateComment('thread', 'commentId', 'commentBody', 'commentUrl');

      expect($.ajax).toBeCalled();
    });
  });

  describe('uploadAttachment()', function() {
    beforeEach(function() {
      $.ajax = jest.genMockFunction();

      Dispatcher = require(appFile('dispatcher'));
      CommentActionCreators = require(appFile('actions/comment_action_creators'));
      Dispatcher.dispatch.mockClear();
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
      expect(Dispatcher.dispatch).toBeCalled();
      expect(Dispatcher.dispatch.mock.calls[0][0].type).toEqual('COMMENT_ATTACHMENT_UPLOADED');
    });

    it('dispatches a failure event on error', function() {
      $.ajax.mockImplementation(function(options) {
        options.error();
      });

      CommentActionCreators.uploadAttachment('productSlug', 'eventId');

      // Dispatcher.handleServerAction is alread mocked
      expect(Dispatcher.dispatch).toBeCalled();
      expect(Dispatcher.dispatch.mock.calls[0][0].type).toEqual('COMMENT_ATTACHMENT_FAILED');
    });
  });
});
