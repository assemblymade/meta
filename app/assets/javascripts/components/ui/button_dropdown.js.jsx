var Button = require('./button.js.jsx')
var Icon = require('./icon.js.jsx')
var DropdownMenu = require('./dropdown_menu.js.jsx')
var DropdownMixin = require('../../mixins/dropdown_mixin.js.jsx')

var ButtonDropdown = React.createClass({

  mixins: [
    DropdownMixin
  ],

  propTypes: {
    dropdownMenu: React.PropTypes.element.isRequired,
    action: React.PropTypes.func
  },

  render: function() {
    var dropdownMenu
    var actionButton
    var toggleButton

    if (this.isDropdownOpen()) {
      dropdownMenu = this.props.dropdownMenu
    }

    if (this.props.action) {
      actionButton = (
        <Button {...this.props} action={this.props.action}>
          {this.props.children}
        </Button>
      )

      toggleButton = (
        <Button {...this.props} action={this.toggleDropdown} active={this.isDropdownOpen()}>
          <Icon icon="chevron-down" />
        </Button>
      )
    } else {
      toggleButton = (
        <Button {...this.props} action={this.toggleDropdown} active={this.isDropdownOpen()}>
          {this.props.children} <Icon icon="chevron-down" />
        </Button>
      )
    }

    return (
      <div className="button-dropdown">
        {actionButton}
        {toggleButton}
        {dropdownMenu}
      </div>
    )
  }

})

module.exports = window.ButtonDropdown = ButtonDropdown
