'use strict'

const Icon = require('./icon.js.jsx');

const Accordion = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
  },

  getInitialState() {
    return {
      open: true
    }
  },

  render() {
    let content = null,
        chevron = null

    if (this.state.open) {
      content = this.props.children
    }

    if (this.state.open) {
      chevron = <Icon icon="angle-up" />
    } else {
      chevron = <Icon icon="angle-down" />
    }

    return (
      <div>
        <a className="pill block black black-hover bg-darken-1-hover pointer px3 py1 mb1 h5 mt0 mb0 visible-hover-wrapper" onClick={this.toggleOpen}>
          <div className="visible-hover right gray-2">
            {chevron}
          </div>
          {this.props.title}
        </a>
        {content}
      </div>
    )
  },

  toggleOpen() {
    this.setState({open: !this.state.open})
  }
})

module.exports = window.Accordion = Accordion
