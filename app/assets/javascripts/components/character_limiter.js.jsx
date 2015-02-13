'use strict';

let CharacterLimiter = React.createClass({

  propTypes: {
    control: React.PropTypes.element.isRequired,
    limit: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      limit: 140
    }
  },

  getInitialState() {
    return {
      textLength: "",
    };
  },

  render() {
    return (
      <div onChange={this.updateText}>
        {this.props.control}
        <p className="mt1 h6 gray-2 mb0">
          {this.characterCount()} characters left
        </p>
      </div>
    )
  },

  updateText(e) {
    this.setState({
      textLength: e.target.value.length
    });
  },

  characterCount() {
    return this.props.limit - this.state.textLength
  },

  isOverCharacterLimit() {
    return this.characterCount() < 0
  }
});

module.exports = CharacterLimiter;
