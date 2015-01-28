var Label = require('./label.js.jsx')
var OverflowFade = require('./overflow_fade.js.jsx')

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

    return (
      <OverflowFade dimension="horizontal" width="100%" height={height} >
        <div className="mxn1" style={{whiteSpace: 'nowrap'}}>
          {items}
        </div>
      </OverflowFade>
    )
  }
})

module.exports = SingleLineList
