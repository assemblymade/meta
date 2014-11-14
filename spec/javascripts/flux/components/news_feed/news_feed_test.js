/** @jsx React.DOM */

jest.dontMock('outlayer');

describe('NewsFeed', function() {
  global.xhr = require(
    path.resolve(
      __dirname,
      '../../../../../',
      'app/assets/javascripts/xhr.js'
    )
  );

  var NewsFeed = require.requireActual(
    path.resolve(
      __dirname,
      '../../../../../',
      'app/assets/javascripts/components/news_feed/news_feed.js.jsx'
    )
  );

  it('renders', function() {
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
