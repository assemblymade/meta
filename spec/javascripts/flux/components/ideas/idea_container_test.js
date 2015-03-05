jest.dontMock(appFile('components/ideas/idea_container.js.jsx'));
jest.dontMock(appFile('components/ui/tile.js.jsx'));

describe('IdeaContainer', function() {
  global.Dispatcher = require(appFile('dispatcher'));

  it('renders a container for an idea and its children', function() {
    var IdeaContainer = require(appFile('components/ideas/idea_container.js.jsx'));
    var noop = function() {};
    var ideaContainer = TestUtils.renderIntoDocument(
      <IdeaContainer navigate={noop}>
        <div className="test-child" />
      </IdeaContainer>
    );

    var ic = TestUtils.findRenderedComponentWithType(
      ideaContainer,
      IdeaContainer
    );

    var div = TestUtils.findRenderedDOMComponentWithClass(
      ideaContainer,
      'test-child'
    );

    expect(ic).toBeDefined();
    expect(div).toBeDefined();
  });

  it('provides a link back to the ideas index', function() {
    var IdeaContainer = require(appFile('components/ideas/idea_container.js.jsx'));
    var navigate = jest.genMockFn();
    var ideaContainer = TestUtils.renderIntoDocument(
      <IdeaContainer>
        <div className="test-child" />
      </IdeaContainer>
    );

    var anchor = TestUtils.findRenderedDOMComponentWithTag(
      ideaContainer,
      'a'
    );

    TestUtils.Simulate.click(anchor);

    expect(anchor).toBeDefined();
  });
});
