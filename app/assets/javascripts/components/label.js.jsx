/** @jsx React.DOM */

(function() {

  var LabelColors = {
    'ruby': '#CC342D',
    'python': '#3776ab',
    'django': '#487858',
    'js': '#F0DB4F'
  }

  var Label = React.createClass({

    render: function() {
      var cs = React.addons.classSet({
        'label': true,
        'label-default': !(this.props.name in LabelColors)
      })

      return (
        <span className={cs}
              style={{'background-color': this.color()}}>
          #{this.props.name}
        </span>
      )
    },

    color: function() {
      return LabelColors[this.props.name];
    }

  });

  if (typeof module !== 'undefined') {
    module.exports = Label;
  }

  window.Label = Label;
})();
