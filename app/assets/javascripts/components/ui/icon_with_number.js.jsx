var Icon = require('./icon.js.jsx')
// TODO This lib is required in application.js (chrislloyd)
// var numeral = require('numeral')

module.exports = React.createClass({
  displayName: 'IconWithNumber',

  render: function() {
    var label = null
    if (this.props.n > 0) {
      label = <span className="ml1">{numeral(this.props.n).format('0,0')}</span>
    }

    return (
      <div>
        <Icon icon={this.props.icon} />
        {label}
      </div>
    )
  }
})
