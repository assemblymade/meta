/** @jsx React.DOM */

(function() {
  var ListItemMixin = require('../mixins/list_item_mixin.js.jsx');

  var BountyListItem = React.createClass({
    mixins: [ListItemMixin],

    render: function() {
      var bounty = this.props.bounty

      return (
        <div className="bg-white rounded shadow mb2">
          <div className="p3">
            <div className="h4 mt0 mb1">
              {this.renderTitle()}
            </div>

            <div>
              <div className="right ml2">
                {this.renderUrgency()}
              </div>

              <span className="mr2">
                <BountyValuation {...this.props.bounty} {...this.props.valuation} />
              </span>

              <span className="gray mr2">
                {this.renderComments(bounty.comments_count)}
              </span>

              <span className="h6 mt0 mb0">
                {this.renderTags(bounty.tags)}
              </span>
            </div>
          </div>
          {this.renderLocker()}
        </div>
      )
    },

    renderLocker: function() {
      var bounty = this.props.bounty

      if(!bounty.locker) {
        return
      }

      var user = bounty.locker

      return (
        <div className="px3 py2 border-top h6 mb0 mt0">
          <Avatar user={user} size={18} style={{ display: 'inline-block' }} />
          {' '}
          <a href={user.url} className="bold black">
            {user.username}
          </a>
          {' '}
          <span className="gray-dark">
            has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
          </span>
        </div>
      )
    },

    renderTitle: function() {
      var bounty = this.props.bounty

      return (
        <a href={bounty.url}>
          {bounty.title}
          {' '}
          <span className="gray-dark ml1">
            #{bounty.number}
          </span>
        </a>
      )
    },

    renderUrgency: function() {
      var bounty = this.props.bounty

      var urgencies = ['Urgent', 'Now', 'Someday']

      return (
        <div className="right">
          <Urgency initialLabel={bounty.urgency.label} state={bounty.state} url={bounty.urgency_url} urgencies={urgencies} />
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyListItem
  }

  window.BountyListItem = BountyListItem
})();
