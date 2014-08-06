/** @jsx React.DOM */

jest.dontMock('../../../app/assets/javascripts/components/avatar.js.jsx');

describe('Avatar', function() {
  var Avatar = require('../../../app/assets/javascripts/components/avatar.js.jsx');

  it('renders a default avatar', function() {
    var avatar = TestUtils.renderIntoDocument(
      <Avatar />
    );

    var img = TestUtils.findRenderedDOMComponentWithTag(
      avatar,
      'img'
    );

    expect(img.getDOMNode().src).toContain('/assets/avatars/default.png');
  });

  it('renders a user avatar', function() {
    var user = {
      avatar_url: '/chicago.png'
    };

    var avatar = TestUtils.renderIntoDocument(
      <Avatar user={user} />
    );

    var img = TestUtils.findRenderedDOMComponentWithTag(
      avatar,
      'img'
    );

    expect(img.getDOMNode().src).toContain('/chicago.png');
  });
});
