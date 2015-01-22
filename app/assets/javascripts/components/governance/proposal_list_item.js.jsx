var Avatar = require('../ui/avatar.js.jsx');
var Icon = require('../icon.js.jsx');
var Love = require('../love.js.jsx');
var ListItemMixin = require('../../mixins/list_item_mixin.js.jsx');
var NewsFeedItemModal = require('../news_feed/news_feed_item_modal.js.jsx');
var Button = require('../ui/button.js.jsx')

var ProposalListIem = React.createClass({
  displayName: 'ProposalListItem',

  propTypes: {
    proposal: React.PropTypes.object.isRequired
  },

  mixins: [ListItemMixin],

  render: function() {
    var proposal = this.props.proposal;

    return (
      <div className="bg-white rounded shadow mb2">
        <div className="px3">
          <div className="row">
            <div className="col-md-7">
              {this.renderTitle()}
              {this.renderSummary()}
            </div>
            <div className="col-md-5">
              <div className = "row py3">
                {this.renderProgress()}
              </div>
              <div className = "row">
                {this.vote_state()}
              </div>
            </div>
          </div>
        </div>

        <div className="px3 mb1 mt0 gray-dark">
          {this.renderComments(proposal.comments_count)}
        </div>
        {this.renderLove(this.props.proposal.news_feed_item_id)}
        {this.renderUser()}
      </div>
    );
  },

  vote_state: function() {
    if (this.props.proposal.state==="open") {
      return (
        <div className="bg-blue white ml4 mr4 py2 rounded bold center">Open</div>
      )
    } else if (this.props.proposal.state === "failed") {
      return (
        <div className = "bg-red white px2 py1 rounded bold center">Failed</div>
      )
    }
    else if (this.props.proposal.state === "passed") {
      return (
        <div className = "bg-green while px2 py1 rounded bold center">Passed</div>
      )
    }

  },

  renderProgress: function() {
    var my_style = "progress-info";
    if (this.props.proposal.state === "passed"){
      my_style = "progress-success";
    }
    else if (this.props.proposal.state === "failed") {
      my_style = "progress-danger";
    }
    else if (this.props.proposal.state === "closed") {
      my_style = "progress-success";
    }

    return (
      <ProgressBar percent={this.props.proposal.status} style = {my_style} />
    )
  },

  renderSummary: function() {
    var proposal = this.props.proposal;

    if (proposal.description) {
      return (
        <div className="h5 gray-dark">
          {proposal.description}
        </div>
      );
    }
  },

  renderTitle: function() {
    var proposal = this.props.proposal;

    return (
      <div className="h3 mb1 mt0" style={{ paddingTop: '1rem' }}>
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
