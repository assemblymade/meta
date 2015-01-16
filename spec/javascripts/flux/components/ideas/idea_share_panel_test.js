jest.dontMock(appFile('components/ideas/idea_share_panel.js.jsx'));

describe('IdeaSharePanel', function() {
  it('renders a panel of sharing options', function() {
    global.ZeroClipboard = function() {
      return {
        on: function() {}
      };
    };

    var IdeaSharePanel = require(appFile('components/ideas/idea_share_panel.js.jsx'));
    var idea = { url: '/twitter' };
    var ideaSharePanel = TestUtils.renderIntoDocument(
      <IdeaSharePanel idea={idea} message="share!" />
    );

    var anchors = TestUtils.scryRenderedDOMComponentsWithTag(
      ideaSharePanel,
      'a'
    );

    expect(anchors).toBeDefined();
    expect(anchors.length).toEqual(4);
  });
});
