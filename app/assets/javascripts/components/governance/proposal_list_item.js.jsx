var Avatar = require('../ui/avatar.js.jsx');
var Icon = require('../icon.js.jsx');
var Heart = require('../heart.js.jsx');
var ListItemMixin = require('../../mixins/list_item_mixin.js.jsx');
var NewsFeedItemModal = require('../news_feed/news_feed_item_modal.js.jsx');
var Button = require('../ui/button.js.jsx')
var ProgressBar = require('../ui/progress_bar.js.jsx')

var max_description_length = 300;

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
                {this.voteState()}
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

  voteState: function() {
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
        <div className = "bg-green white px2 py1 rounded bold center">Passed</div>
      )
    }
    else if (this.props.proposal.state === "expired") {
      return (
        <div className = "bg-black white px2 py1 rounded bold center">Expired</div>
      )
    }

  },

  renderProgress: function() {
    var my_style = "";
    if (this.props.proposal.state === "passed"){
      my_style = "success";
    }
    else if (this.props.proposal.state === "failed") {
      my_style = "danger";
    }
    else if (this.props.proposal.state === "closed") {
      my_style = "success";
    }
    else if(this.props.proposal.state === "expired") {
      my_style = "gray"
    }
    return (
      <ProgressBar progress={this.props.proposal.status} threshold = {50} type = {my_style} />
    )
  },

  renderSummary: function() {
    var proposal = this.props.proposal;
    var desc = proposal.short_body

    if (proposal.description) {
      return (
        <div className="h5 gray-dark">
          {desc}
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
        <div style={{ display: 'inline-block' }} >
          <Avatar user={user} size={24} />
        </div>

        <span className="gray-dark ml2">
          <a href={user.url}>@{user.username}</a> created this proposal {moment(proposal.created_at).fromNow()}
        </span>
      </div>
    );
  }
});

module.exports = ProposalListIem;
