var Avatar = require('../ui/avatar.js.jsx');
var Icon = require('../icon.js.jsx');
var Love = require('../love.js.jsx');
var NewsFeedItemModal = require('../news_feed/news_feed_item_modal.js.jsx');

var ProposalListIem = React.createClass({
  displayName: 'ProposalListItem',

  propTypes: {
    proposal: React.PropTypes.object.isRequired
  },

  render: function() {
    var proposal = this.props.proposal;

    return (
      <div className="bg-white rounded shadow mb2">
        <div className="px3">
          {this.renderTitle()}
          {this.renderSummary()}
        </div>

        <div className="px3 mb1 mt0 gray-dark">

        </div>

        {this.renderUser()}

      </div>
    );
  },

  renderSummary: function() {
    var proposal = this.props.proposal;

    if (proposal.description) {
      return (
        <div className="h5 mt0 mb2 gray-dark">
          {proposal.description}
        </div>
      );
    }
  },

  renderTitle: function() {
    var proposal = this.props.proposal;

    return (
      <div className="h4 mb1 mt0" style={{ paddingTop: '1rem' }}>
        <a href={proposal.url} className="black">
          {proposal.name}
        </a>
      </div>
    );
  },

  renderUser: function() {
    var proposal = this.props.proposal;
    var user = proposal.user;

    return (
      <div className="h6 px3 py2 b0 mt0 border-top">
        <Avatar user={user} size={24} style={{ display: 'inline-block' }} />

        <span className="gray-dark ml2">
          <a href={user.url}>@{user.username}</a> created this proposal {moment(proposal.created_at).fromNow()}
        </span>
      </div>
    );
  }
});

module.exports = ProposalListIem;
