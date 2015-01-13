var Icon = require('./icon.js.jsx')
// TODO This lib is required in application.js (chrislloyd)
// var numeral = require('numeral')

var IconWithNumber = React.createClass({

  propTypes: {
    icon: React.PropTypes.string.isRequired,
    n: React.PropTypes.number.isRequired
  },

  render: function() {
    var label = null
    if (this.props.n > 0) {
      // This is a horrible hack for CI because numeral isn't required in the
      // jest tests. Ask @chrislloyd about this one.
      var formattedNumeral
      if (window.numeral) {
        formattedNumeral = numeral(this.props.n).format('0,0')
      } else {
        formattedNumeral = this.props.n
      }
      label = <span className="ml1">{formattedNumeral}</span>
    }

    return (
      <div>
        <Icon icon={this.props.icon} />
        {label}
      </div>
    )
  }
})

module.exports = IconWithNumber
