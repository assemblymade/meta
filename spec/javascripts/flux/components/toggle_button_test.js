

describe('ToggleButton', function() {
  var ToggleButton;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'))
    ToggleButton = require.requireActual(pathToFile('components/toggle_button.js.jsx'));
  })

  it('renders a default button', function() {
    var button = TestUtils.renderIntoDocument(
      <ToggleButton bool={true}
          text={{ true: 'Hide', false: 'Show' }}
          classes={{ true: 'zip', false: 'zap' }}
          href={{ true: '/zip', false: '/zap' }} />
    );

    expect(button.state.bool).toBe(true);

    var link = TestUtils.findRenderedDOMComponentWithClass(
      button,
      'zip'
    );

    expect(link).toBeDefined();

    var noLink = TestUtils.scryRenderedDOMComponentsWithClass(
      button,
      'zap'
    );

    expect(noLink.length).toEqual(0);
  });

  it('updates optimistically on click', function() {
    var button = TestUtils.renderIntoDocument(
      <ToggleButton bool={true}
          text={{ true: 'Hide', false: 'Show' }}
          classes={{ true: 'zip', false: 'zap' }}
          href={{ true: '/zip', false: '/zap' }} />
    );

    expect(button.state.bool).toBe(true);

    var link = TestUtils.findRenderedDOMComponentWithClass(
      button,
      'zip'
    );

    expect(link).toBeDefined();

    var noLink = TestUtils.scryRenderedDOMComponentsWithClass(
      button,
      'zap'
    );

    expect(noLink.length).toEqual(0);

    TestUtils.Simulate.click(button.getDOMNode());

    expect(button.state.bool).toBe(false);

    link = TestUtils.findRenderedDOMComponentWithClass(
      button,
      'zap'
    );

    expect(link).toBeDefined();

    noLink = TestUtils.scryRenderedDOMComponentsWithClass(
      button,
      'zip'
    );

    expect(noLink.length).toEqual(0);
  });
});
