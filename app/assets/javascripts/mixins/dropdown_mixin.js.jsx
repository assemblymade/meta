var EscKeyCode = 27

var DropdownMixin = {
  getInitialState: function () {
    return {
      open: false
    }
  },

  componentWillUnmount: function () {
    this.unbindRootCloseHandlers()
  },

  // --

  toggleDropdown: function() {
    return this.setDropdownState(!this.state.open)
  },

  isDropdownOpen: function() {
    return this.state.open
  },

  // --

  setDropdownState: function (isOpen, cb) {
    if (isOpen) {
      this.bindRootCloseHandlers()
    } else {
      this.unbindRootCloseHandlers()
    }

    return this.setState({open: isOpen}, cb)
  },

  bindRootCloseHandlers: function () {
    document.addEventListener('click', this.handleDocumentClick)
    document.addEventListener('keyup', this.handleDocumentKeyup)
  },

  unbindRootCloseHandlers: function () {
    document.removeEventListener('click', this.handleDocumentClick)
    document.removeEventListener('keyup', this.handleDocumentKeyup)
  },

  handleDocumentClick: function (e) {
    if (!this.getDOMNode().contains(e.target)) {
      this.setDropdownState(false)
    }
  },

  handleDocumentKeyup: function (e) {
    if (e.keyCode === EscKeyCode) {
      this.setDropdownState(false)
    }
  }
}

module.exports = DropdownMixin
