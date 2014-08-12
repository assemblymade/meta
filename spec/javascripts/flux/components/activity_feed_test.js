/** @jsx React.DOM */

jest.dontMock(pathToFile('components/activity_feed.js.jsx'));

describe('ActivityFeed', function() {
  it('renders an activity feed', function() {
    var ActivityFeed = require(pathToFile('components/activity_feed.js.jsx'));

    var activities = [
      {
        actor: {
          username: 'trillian'
        },
        subject: {
          body_html: '<p>42</p>'
        },
        verb: 'answered'
      }
    ];

    var activityFeed = TestUtils.renderIntoDocument(
      <ActivityFeed activities={activities} />
    );

    var bodyHtml = TestUtils.findRenderedDOMComponentWithClass(
      activityFeed,
      'row'
    );

    expect(bodyHtml.getDOMNode().textContent).toEqual('@trillian answered 42');
  });
});
