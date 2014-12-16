var Masonry = require('masonry')
var imagesloaded = require('imagesloaded')

module.exports = function MasonryMixin(ref, options) {
  return {
    masonry: false,

    imagesLoaded: function() {
      imagesloaded(this.refs[ref].getDOMNode(), function() {
        this.masonry.layout()
      }.bind(this))
    },

    componentDidMount: function() {
      if (this.masonry) {
        return;
      }

      if (this.props.productPage) {
        return;
      }

      try {
        var el = this.refs[ref].getDOMNode()
        this.masonry = new Masonry(el, options)
        el.focus()
        this.imagesLoaded()
      } catch (e) {
        console.error(e);
      }
    },

    componentDidUpdate: function() {
      if (this.props.productPage) {
        return;
      }

      if (!this.masonry) {
        return
      }

      this.masonry.reloadItems()
      this.imagesLoaded()

      setTimeout(function() {
        window.dispatchEvent(new Event('resize'))
      }, 1);
    }
  }
}
