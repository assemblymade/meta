/** @jsx React.DOM */

(function() {

  var CharacterLimitedTextarea = React.createClass({

    propTypes: {
      limit: React.PropTypes.number
    },

    getInitialState: function() {
      return {
        text: "",
      };
    },

    render: function() {
      var cs = React.addons.classSet({
        'form-group': true,
        'has-error': this.isOverCharacterLimit()
      })

      return (
        <div className={cs}>
          <textarea className="form-control" name={this.props.name} id={this.props.id} onChange={this.updateText}></textarea>
          <p className="help-block">
            {this.characterCount()} characters
          </p>
        </div>
      )
    },

    updateText: function(e) {
      this.setState({
        text: e.target.value
      })
    },

    characterCount: function() {
      return this.props.limit - this.state.text.length
    },

    isOverCharacterLimit: function() {
      return this.characterCount() <= 0
    }

  });

  // --

  if (typeof module !== 'undefined') {
    module.exports = CharacterLimitedTextarea
  }

  window.CharacterLimitedTextarea = CharacterLimitedTextarea

})()
