var Label = require('./label.js.jsx')

var SingleLineList = React.createClass({

  propTypes: {
    height: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      height: '2rem'
    }
  },

  render: function() {
    var height, items, shadowStyle

    height = this.props.height
    items = _.map(this.props.items, item => {
      return <div className="inline-block px1">{item}</div>
    })

    shadowStyle = {
      width: height,
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0), white)'
    }

    return <div className="relative mxn1 overflow-hidden" style={{height: height, whiteSpace: 'nowrap'}}>
      {items}
      <div className="absolute top-0 right-0 bottom-0" style={shadowStyle}></div>
    </div>
  }
})

module.exports = SingleLineList
