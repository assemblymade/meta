var NewsFeedItemModalMixin = {
  handleClick: function(e) {
    if (this.props.enableModal) {
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();

        this.showModal(e);
      }
    }
  },

  showModal: function(e) {
    var url = this.props.url;

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      return window.open(url, '_blank');
    }

    var width = window.innerWidth;

    if (width > 480) {
      this.props.triggerModal(e)
    } else {
      window.location = url;
    }
  }
};

module.exports = NewsFeedItemModalMixin;
