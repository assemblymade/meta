var IconWithNumber = require('./icon_with_number.js.jsx')

module.exports = React.createClass({
  displayName: 'Jewel',

  propTypes: {
    icon: React.PropTypes.string.isRequired,
    n: React.PropTypes.number.isRequired,
  },

  getDefaultProps: function() {
    return {
      n: 0
    }
  },

  render: function() {

    var styles = {
      borderRadius: '1rem',
      fontSize: 13,
      lineHeight: '2rem'
    }

    var classes = ['inline-block', 'center', 'px2', 'bold', 'white']
    if (this.props.n > 0) {
      classes.push('bg-red')
      classes.push('bg-red-dark-hover')
    } else {
      classes.push('bg-gray-3')
      classes.push('bg-gray-2-hover')
    }

    cs = React.addons.classSet.apply(null, classes)

    return (
      <div className={cs} style={styles}>
        <IconWithNumber icon={this.props.icon} n={this.props.n} />
      </div>
    )
  }
})
