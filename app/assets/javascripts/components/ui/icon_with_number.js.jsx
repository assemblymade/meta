var Icon = require('./icon.js.jsx')
// TODO This lib is required in application.js (chrislloyd)
// var numeral = require('numeral')

var IconWithNumber = React.createClass({

  propTypes: {
    icon: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
          ]),
    n: React.PropTypes.number.isRequired,
    showZeros: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      showZeros: false
    }
  },

  render: function() {
    var label
    var icon

    if (this.props.n > 0 || this.props.showZeros) {
      // This is a horrible hack for CI because numeral isn't required in the
      // jest tests. Ask @chrislloyd about this one.
      var formattedNumeral
      if (window.numeral) {
        formattedNumeral = numeral(this.props.n).format('0,0')
      } else {
        formattedNumeral = this.props.n
      }
      label = formattedNumeral
    }

    if (typeof this.props.icon === "string") {
      icon = <Icon icon={this.props.icon} />
    } else {
      icon = this.props.icon
    }

  
    return (
      <div>{icon} {label}</div>
    )

  }
})

module.exports = IconWithNumber
