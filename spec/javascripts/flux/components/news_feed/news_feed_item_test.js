/** @jsx React.DOM */

describe('NewsFeedItem', function() {
  var NewsFeedItem = require.requireActual(
    path.resolve(
      __dirname,
      '../../../../../',
      'app/assets/javascripts/components/news_feed/news_feed_item.js.jsx'
    )
  );

  it('renders a news feed item', function() {
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
