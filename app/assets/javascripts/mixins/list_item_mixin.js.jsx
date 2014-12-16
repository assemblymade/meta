var ListItemMixin = {
  renderComments: function(count) {
    return [
      <Icon icon="comment" />,
      <span className="px1">
        {count}
      </span>
    ];
  },

  renderTags: function(tags) {
    tags = tags || [];

    return tags.map(function(tag) {
      return (
        <a className="h6 bold caps gray-3 mr2 pointer" href={tag.url}>
          {tag.name}
        </a>
      )
    });
  }
};

module.exports = ListItemMixin;
