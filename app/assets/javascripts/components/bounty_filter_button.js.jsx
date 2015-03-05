

(function() {
  var BountyFilterButton = React.createClass({
    getDefaultProps: function() {
      return {
        options: []
      }
    },

    renderOption: function(option) {
      return (
        <li>
          <a onClick={this.props.onFilterClick(option)} href="#">
            {option.name}
          </a>
        </li>
      )
    },

    renderOptions: function() {
      return this.props.options.map(function(option) {
        return this.renderOption(option)
      }.bind(this))
    },

    render: function() {
      return (
        <div className="dropdown">
          <a className="dropdown-toggle black bold no-wrap" data-toggle="dropdown" href="#">
            {this.props.name}
            {' '}
            <span className="icon icon-chevron-down"></span>
          </a>

          <ul className="dropdown-menu">
            {this.renderOptions()}
          </ul>
        </div>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyFilterButton
  }

  window.BountyFilterButton = BountyFilterButton
})()
