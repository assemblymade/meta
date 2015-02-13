jest.dontMock(appFile('components/news_feed/news_feed.js.jsx'))
jest.dontMock('url');

describe('NewsFeed', function() {
  it('renders', function() {
    Dispatcher = require(appFile('dispatcher'))
    var NewsFeed = require(appFile('components/news_feed/news_feed.js.jsx'));

    var newsFeed = TestUtils.renderIntoDocument(
      <NewsFeed url="/updates" />
    );

    var nf = TestUtils.findRenderedComponentWithType(
      newsFeed,
      NewsFeed
    );

    expect(nf).toBeDefined();
    expect(nf.state.page).toEqual(1);
  });
});
