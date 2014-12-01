jest.dontMock(appFile('components/news_feed/news_feed_item.js.jsx'))

describe('NewsFeedItem', function() {
  it('renders a news feed item', function() {
    Dispatcher = require(appFile('dispatcher'))
    
    var NewsFeedItem = require(appFile('components/news_feed/news_feed_item.js.jsx'))
    var newsFeedItem = TestUtils.renderIntoDocument(
      <NewsFeedItem product={{}} user={{}} />
    );


    var nfi = TestUtils.findRenderedComponentWithType(
      newsFeedItem,
      NewsFeedItem
    );

    expect(nfi).toBeDefined();
  });
});
