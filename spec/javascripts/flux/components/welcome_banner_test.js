

describe('WelcomeBanner', function() {
  Dispatcher = require(pathToFile('dispatcher'));
  var WB = require.requireActual(pathToFile('constants')).WELCOME_BANNER;
  var WelcomeBanner = require.requireActual(pathToFile('components/welcome_banner.js.jsx'));
  var WelcomeBannerStore = require(pathToFile('stores/welcome_banner_store'));

  describe('onClick()', function() {
    it('dispatches a click event', function() {
      var welcomeBanner = TestUtils.renderIntoDocument(
        <WelcomeBanner discoverBountiesPath="/bounties" userPath="/trillian/dismiss" />
      );

      var button = TestUtils.findRenderedDOMComponentWithTag(welcomeBanner, 'button');

      TestUtils.Simulate.click(button.getDOMNode());

      expect(Dispatcher.dispatch).toBeCalledWith({
        action: WB.ACTIONS.WELCOME_BANNER_DISMISSED,
        data: "/trillian/dismiss"
      });
    });
  });
});
