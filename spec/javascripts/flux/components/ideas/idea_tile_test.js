jest.dontMock(appFile('components/ideas/idea_tile.js.jsx'));

describe('IdeaTile', function() {
  global.Dispatcher = require(appFile('dispatcher'));
  global.ReactUjs = { mountReactComponents: function() {} };

  var idea = {
    body: 'idea',
    comments_count: 2,
    name: 'test-idea',
    news_feed_item: {
      id: 'nfi1'
    },
    short_body: 'shorty shorty shorty',
    temperature: 90,
    user: {
      avatar_url: 'http://imgur.com/avatar.jpg',
      username: 'hover_boots'
    }
  };

  it('renders a tile with an idea', function() {
    jest.dontMock(appFile('components/ui/tile.js.jsx'));

    var IdeaTile = require(appFile('components/ideas/idea_tile.js.jsx'));
    var ideaTile = TestUtils.renderIntoDocument(
      <IdeaTile idea={idea} />
    );

    var renderWrapper = function() {
      ideaTile.render();
    };

    expect(renderWrapper).not.toThrow();
  });

  it('renders the short_body in a Markdown component', function() {
    jest.dontMock(appFile('components/markdown.js.jsx'));
    jest.dontMock(appFile('components/ui/tile.js.jsx'));

    var Markdown = require(appFile('components/markdown.js.jsx'));
    var IdeaTile = require(appFile('components/ideas/idea_tile.js.jsx'));
    var ideaTile = TestUtils.renderIntoDocument(
      <IdeaTile idea={idea} />
    );

    var markdown = TestUtils.findRenderedComponentWithType(ideaTile, Markdown);

    expect(markdown.getDOMNode().innerHTML).toEqual('shorty shorty shorty');
  });
});
