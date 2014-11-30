jest.dontMock(appFile('components/news_feed/news_feed.js.jsx'))
jest.dontMock('outlayer');

describe('NewsFeed', function() {
  global.xhr = require(appFile('xhr'));  

  it('renders', function() {
    Dispatcher = require(appFile('dispatcher'))
    var NewsFeed = require(appFile('components/news_feed/news_feed.js.jsx'));

    global.xhr.get.mockReturnValue([]);

    var newsFeed = TestUtils.renderIntoDocument(
      <NewsFeed />
    );

    var nf = TestUtils.findRenderedComponentWithType(
      newsFeed,
      NewsFeed
    );

    expect(nf).toBeDefined();
    expect(nf.state.page).toEqual(1);
  });
});
