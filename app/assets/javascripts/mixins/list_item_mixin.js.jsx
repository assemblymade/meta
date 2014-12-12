/** @jsx React.DOM */

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
        <a className="caps gray-dark mr1" href={tag.url}>
          #{tag.name}
        </a>
      )
    });
  }
};

module.exports = ListItemMixin;
