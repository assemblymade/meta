'use strict'

const OverflowFade = require('./overflow_fade.js.jsx');

const REM_BASE = 12

const Reveal = React.createClass({
  propTypes: {
    maxHeight: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      maxHeight: 20 * REM_BASE
    }
  },

  getInitialState() {
    return {
      revealed: false,
      height: -1
    }
  },

  componentDidMount() {
    this.setState({
      height: $(this.refs.children.getDOMNode()).outerHeight()
    })
  },

  render() {
    const {maxHeight} = this.props
    const {height, revealed} = this.state
    const children = <div ref="children">{this.props.children}</div>

    if (height < maxHeight || revealed) {
      return children
    } else {
      return <div>
        <div className="mb2">
          <OverflowFade height={maxHeight} dimension="vertical">
            {children}
          </OverflowFade>
        </div>
        <a href="#" onClick={this.handleReveal}>Read more</a>
      </div>
    }
  },

  handleReveal(e) {
    e.preventDefault()
    this.setState({
      revealed: true
    })
  }
})

module.exports = Reveal
