const Icon = require('./ui/icon.js.jsx')

module.exports = React.createClass({
  displayName: 'HeartCount',

  propTypes: {
    count: React.PropTypes.number.isRequired
  },

  render() {
    return <div>
      <Icon icon="heart" verticalAlign={-1} extraClasses="gray-3" />
      <span> {this.props.count}</span>
    </div>
  }
})
