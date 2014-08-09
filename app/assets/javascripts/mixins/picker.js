/**
 * Picker is a generic object for dropdown menus with typeahead support.
 * It isn't meant to be used on its own, but rather as a React.js
 * mixin.
 */

var Picker = {
  keys: {
    enter: 13,
    esc: 27,
    up: 38,
    down: 40
  },

  getInitialState: function() {
    return {
      list: [],
      highlightIndex: 0
    };
  },

  clearText: function() {
    this.refs.userInput.getDOMNode().value = '';
    this.setState(this.getInitialState());
  },

  /**
  render: function() {
     * Extend this method in your Picker component.
     * To use the mixin, be sure to include ref='userInput'
     * on the returned element, e.g.:

        return (
          <div>
            <input ref="userInput"
                   onChange={this.handleChange}
                   onKeyDown={this.handleKey}
                   placeholder="@username or email address" />
            { this.state.list.length > 0 ? this.userPicker() : null }
          </div>
        );

    * where userPicker and the other methods are defined on the component
    * itself.
  },
  */

  handleKey: function(e) {
    if (e.keyCode == this.keys.up) {
      e.preventDefault();
      this.moveHighlight(-1);
    } else if (e.keyCode == this.keys.down) {
      e.preventDefault();
      this.moveHighlight(1);
    } else if (e.keyCode == this.keys.enter) {
      e.preventDefault();
      this.selectHighlighted();
    }
  },

  moveHighlight: function(inc) {
    var index = this.constrainHighlight(this.state.highlightIndex + inc);

    // onValidChange needs to be passed from the parent component
    this.props.onValidChange(this.state.list[index]);
    this.setState({ highlightIndex: index });
  },

  selectHighlighted: function() {
    var text = this.refs.userInput.getDOMNode().value

    this.clearText();

    this.handleSelected(text, this.state.list[this.state.highlightIndex]);
  },

  handleSelected: function(text, selected) {
    this.setState({ list: [] });

    // onSelected needs to be passed from the parent component
    this.props.onSelected(text);
  },

  constrainHighlight: function(index) {
    return Math.max(
      -1, Math.min(this.state.list.length - 1, index)
    );
  }
};
