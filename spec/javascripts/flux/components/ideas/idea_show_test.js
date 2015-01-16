jest.dontMock(appFile('components/ideas/idea_show.js.jsx'));
jest.dontMock(appFile('stores/related_ideas_store'));
jest.dontMock(appFile('stores/start_conversation_modal_store'));

describe('IdeaShow', function() {
  var noop = function() {};
  var _$;

  global.Dispatcher = require(appFile('dispatcher'));

  global.ZeroClipboard = function() {
    return {
      on: function() {}
    };
  };

  global.ReactUjs = {
    mountReactComponents: noop
  };

  beforeEach(function() {
    _$ = global.$;
    global.$ = function() {
      return {
        autosize: noop,
        find: noop,
        trigger: noop
      };
    };
  });

  afterEach(function() {
    global.$ = _$;
  });

  it('renders null if there is no idea', function() {
    var IdeaShow = require(appFile('components/ideas/idea_show.js.jsx'));
    var ideaShow = TestUtils.renderIntoDocument(
      <IdeaShow navigate={noop} params={{}} query={{}} />
    );

    var main = TestUtils.scryRenderedDOMComponentsWithTag(ideaShow, 'main');

    expect(main.length).toBe(0);
  });

  describe('with idea', function() {
    var idea = {
      body: 'idea',
      comments_count: 2,
      name: 'test-idea',
      news_feed_item: {
        id: 'nfi1'
      },
      temperature: 90,
      user: {
        avatar_url: 'http://imgur.com/avatar.jpg',
        username: 'hover_boots'
      }
    };

    it('renders a show page if it gets an idea', function() {
      var IdeaStore = require(appFile('stores/idea_store'));
      IdeaStore.getIdea.mockReturnValueOnce(idea);

      var IdeaShow = require(appFile('components/ideas/idea_show.js.jsx'));
      var ideaShow = TestUtils.renderIntoDocument(
        <IdeaShow navigate={noop} params={{}} query={{}} />
      );

      var main = TestUtils.scryRenderedDOMComponentsWithTag(ideaShow, 'main');
      var nfiComments = TestUtils.findRenderedComponentWithType(
        ideaShow,
        require(appFile('components/news_feed/news_feed_item_comments.js.jsx'))
      );

      expect(TestUtils.isCompositeComponent(ideaShow)).toBe(true);
      expect(main.length).toBe(1);
      expect(nfiComments).toBeDefined();
    });
  });
});
