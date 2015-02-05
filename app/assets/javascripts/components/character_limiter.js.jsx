var CharacterLimiter = React.createClass({

  propTypes: {
    control: React.PropTypes.element.isRequired,
    limit: React.PropTypes.number.isRequired
  },

  getDefaultProps: function() {
    return {
      limit: 140
    }
  },

  getInitialState: function() {
    return {
      text: "",
    };
  },

  render: function() {
    return (
      <div onChange={this.updateText}>
        {this.props.control}
        <p className="mt1 h6 gray-2 mb0">
          {this.characterCount()} characters left
        </p>
      </div>
    )
  },

  updateText: function(e) {
    this.setState({text: e.target.value})
  },

  characterCount: function() {
    return this.props.limit - this.state.text.length
  },

  isOverCharacterLimit: function() {
    return this.characterCount() <= 0
  }

})

module.exports = window.CharacterLimiter = CharacterLimiter
