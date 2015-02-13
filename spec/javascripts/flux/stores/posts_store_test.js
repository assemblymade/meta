jest.dontMock(pathToFile('stores/posts_store'));

var ActionTypes = require(appFile('constants')).ActionTypes;

describe('PostsStore', function(){
  var callback;
  var PostsStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    PostsStore = require(pathToFile('stores/posts_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  it('gets posts for a given product', function(){
    callback({
      type: ActionTypes.POSTS_RECEIVE,
      posts: [{ id: 'foo', body: 'bar' }]
    });

    var posts = PostsStore.getPosts();
    expect(posts[0].id).toEqual('foo');
  });
});
