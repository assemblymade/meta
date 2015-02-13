jest.dontMock(appFile('stores/comment_store'));

describe('CommentStore', () => {
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var CommentStore, callback, Dispatcher;

  beforeEach(() => {
    Dispatcher = require(pathToFile('dispatcher'));
    CommentStore = require(pathToFile('stores/comment_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getComment()', () => {
    it('gets the comment when set', () => {
      callback({
        type: ActionTypes.COMMENT_UPDATED,
        comment: { id: 123, body: 'test_comment' }
      });

      expect(CommentStore.getComment(123).body).toEqual('test_comment');
    });

    it('returns null when the comment is updated', () => {
      callback({
        type: ActionTypes.COMMENT_UPDATED,
        comment: { id: 123, body: 'test_comment' }
      });

      expect(CommentStore.getComment(123).body).toEqual('test_comment');

      callback({
        type: ActionTypes.COMMENTED_UPDATE_RECEIEVED,
        commentId: 123
      });

      expect(CommentStore.getComment(123)).toBeFalsy();
    });
  });
});
