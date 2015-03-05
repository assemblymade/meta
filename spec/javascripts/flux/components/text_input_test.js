

describe('TextInput', function() {
  var TextInput;

  beforeEach(function(){
    Dispatcher = require(pathToFile('dispatcher'));
    TextInput = require.requireActual(pathToFile('components/text_input.js.jsx'));
  })

  it('renders a default TextInput', function() {
    var transform = function() {};

    var input = TestUtils.renderIntoDocument(
      <TextInput
          label="Text"
          width="50px"
          prompt="Click"
          size="small"
          prepend="@"
          transform={transform} />
    );

    expect(input.state.inputValue).toEqual('');
    expect(input.state.transform).toEqual(transform);
  });

  describe('handleClick()', function() {
    it('dispatches a tag add action', function() {
      var input = TestUtils.renderIntoDocument(
        <TextInput
            label="Text"
            width="50px"
            prompt="Click"
            size="small"
            prepend="@" />
      );

      input.setState({
        hide: false
      });

      var submitButton = TestUtils.findRenderedDOMComponentWithTag(input, 'a');

      input.setState({
        inputValue: 'tag'
      });

      TestUtils.Simulate.click(submitButton.getDOMNode());

      expect(Dispatcher.dispatch).toBeCalled();
    });
  });

  describe('transform()', function() {
    it('has a default transform method', function() {
      var input = TestUtils.renderIntoDocument(
        <TextInput
            label="Text"
            width="50px"
            prompt="Click"
            size="small"
            prepend="@" />
      );

      expect(input.transform("you're it")).toEqual("you-re-it");
    });
  });
});
