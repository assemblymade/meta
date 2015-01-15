var Icon = require('./ui/icon.js.jsx')

module.exports = window.Accordion = React.createClass({
  displayName: 'Accordion',

  propTypes: {
    title: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      open: true
    }
  },

  render: function() {
    var core
    var chevron

    if (this.state.open) {
      core = <div className="core">{this.props.children}</div>
    }

    if (this.state.open) {
      chevron = <Icon icon="chevron-up" />
    } else {
      chevron = <Icon icon="chevron-down" />
    }

    return (
      <div>
        <a className="pill-hover block black pointer noselect px3 py1 mln3 mrn3 mb1 h5 mt0 mb0 bg-gray-5-hover" onClick={this.toggleOpen}>
          <div className="right gray-3">{chevron}</div>
          <strong>{this.props.title}</strong>
        </a>
        {core}
      </div>
    )
  },

  toggleOpen: function() {
    this.setState({open: !this.state.open})
  }
})
