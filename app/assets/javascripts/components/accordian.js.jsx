module.exports = window.Accordian = React.createClass({
  displayName: 'Accordian',

  propTypes: {
    title: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      open: true
    }
  },

  render: function() {
    var core = null

    if (this.state.open) {
      core = <div className="core">{this.props.children}</div>
    }

    var chevron = null
    if (this.state.open) {
      chevron = <span className="icon icon-chevron-up"></span>
    } else {
      chevron = <span className="icon icon-chevron-down"></span>
    }

    return (
      <div className="accordian">
        <a className="block black pointer noselect" onClick={this.toggleOpen}>
          <span className="block h5 mt0 bold inline-block w50p">
            {this.props.title}
          </span>
          <span className="inline-block gray-green w50p right-align">
            {chevron}
          </span>
        </a>
        {core}
      </div>
    )
  },

  toggleOpen: function() {
    this.setState({open: !this.state.open})
  }
})
