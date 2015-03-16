'use strict'

const Icon = require('./icon.js.jsx')

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
    let content
    let chevron

    if (this.state.open) {
      content = <div className="px3">{this.props.children}</div>
    }

    if (this.state.open) {
      chevron = <Icon icon="chevron-up" />
    } else {
      chevron = <Icon icon="chevron-down" />
    }

    return (
      <div>
        <a className="pill block black black-hover pointer px3 py1 mb1 h5 mt0 mb0 bg-gray-5-hover" onClick={this.toggleOpen}>
          <div className="right gray-2">{chevron}</div>
          <strong>{this.props.title}</strong>
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
