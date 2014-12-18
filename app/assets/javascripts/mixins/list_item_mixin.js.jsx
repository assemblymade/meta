var ListItemMixin = {
  renderComments: function(count) {
    return [
      <Icon icon="comment" />,
      <span className="px1 foo">
        {count}
      </span>
    ];
  },

  renderLove: function(heartableId) {
    if (!heartableId) {
      return;
    }

    return (
      <div className="px3 py2 border-top mb0 mt0">
        <Love heartable_type='NewsFeedItem' heartable_id={heartableId} />
      </div>
    )
  },

  renderTags: function(tags) {
    tags = tags || [];

    return tags.map(function(tag) {
      return (
        <a className="fs0_9 caps gray-2 mr2 pointer" href={tag.url}>
          #{tag.name}
        </a>
      )
    });
  }
};

module.exports = ListItemMixin;
