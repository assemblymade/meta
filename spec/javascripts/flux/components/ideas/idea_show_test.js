jest.dontMock(appFile('components/ideas/idea_show.js.jsx'));
jest.dontMock('moment');

describe('IdeaShow', function() {
  var noop = function() {};
  var _$;

  // global.Dispatcher = require(appFile('dispatcher'));
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
    global.moment = require('moment');
  });

  afterEach(function() {
    global.$ = _$;
  });

  it('renders null if there is no idea', function() {
    var IdeaShow = require(appFile('components/ideas/idea_show.js.jsx'));
    var ideaShow = TestUtils.renderIntoDocument(
      <IdeaShow navigate={noop} params={{}} query={{}} />
    );

    var main = TestUtils.scryRenderedDOMComponentsWithTag(ideaShow, 'div');

    expect(ideaShow.render()).toBeNull();
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
      },
      product: {
        url: '/test-idea'
      },
      tentative_name: "unnamed"
    };

    it('renders a show page if it gets an idea', function() {
      var IdeaStore = require(appFile('stores/idea_store'));
      IdeaStore.getIdea.mockReturnValueOnce(idea);

      var IdeaShow = require(appFile('components/ideas/idea_show.js.jsx'));
      var ideaShow = TestUtils.renderIntoDocument(
        <IdeaShow navigate={noop} params={{}} query={{}} />
      );

      expect(ideaShow.render()).not.toBeNull();
    });

    it('renders a show page with composite components if it gets an idea', function() {
      var IdeaStore = require(appFile('stores/idea_store'));
      IdeaStore.getIdea.mockReturnValueOnce(idea);

      var IdeaShow = require(appFile('components/ideas/idea_show.js.jsx'));
      var ideaShow = TestUtils.renderIntoDocument(
        <IdeaShow navigate={noop} params={{}} query={{}} />
      );

      expect(TestUtils.isCompositeComponent(ideaShow)).toBe(true);
    });
  });
});
