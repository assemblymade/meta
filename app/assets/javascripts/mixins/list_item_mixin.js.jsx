var Heart = require('../components/heart.js.jsx');
var Label = require('../components/ui/label.js.jsx');

var ListItemMixin = {
  onModalHidden: function() {
    this.setState({
      modalShown: false
    });
  },

  renderComments: function(count) {
    return [
      <span className="gray-3"><Icon icon="comment" /></span>,
      <span className="px1" style={{marginLeft: '-2px'}}>
        {count}
      </span>
    ];
  },

  renderLove: function(heartableId) {
    if (!heartableId) {
      return;
    }
    return (
      <div className="px3 py1 border-top mb0 mt0">
        <Heart size="small" heartable_type='NewsFeedItem' heartable_id={heartableId} />
      </div>
    )
  },

  renderTags: function(tags) {
    tags = tags || [];

    return tags.map(function(tag) {
      return (
        <a className="mr2" href={tag.url} key={'post-tag-' + tag.name}>
          <Label name={tag.name} />
        </a>
      )
    });
  },

  showModal: function(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    e.preventDefault();

    this.setState({
      modalShown: true
    });
  }
};

module.exports = ListItemMixin;
