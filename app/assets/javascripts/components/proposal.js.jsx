var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./tile.js.jsx')
var ProgressBar = require('./progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')

var Proposal = React.createClass({
  displayName: 'Proposal',
  propTypes: {
    newsFeedItem: React.PropTypes.object,
    user: React.PropTypes.object,
    proposal: React.PropTypes.object
  },

  getInitialState: function() {

    if (this.props.proposal.user_vote_status)
      {
        return {button_text: "Unvote"}
      }
    else
      {
        return {button_text: "Approve"}
      }
  },

  render: function() {
    return (
      <div>
        {this.renderProposal()}
      </div>
    );
  },

  renderProposal: function() {

    var button_text = "Approve";
    if (this.props.proposal.user_vote_status)
      {
        button_text = "Unvote";
      }

    return (
      <div>
        <Tile>
          <div className="row">
            <div className="col-md-7">
              <div className="p4">
                <TextPost author={this.props.user} timestamp={this.props.proposal.created} title={this.props.proposal.name} body={this.props.proposal.description} labels={[]} />
              </div>
            </div>

            <div className="col-md-4">
              <ProgressBar percent={11} />

              <Button action={this.vote} type="default">
                {this.state.button_text}
              </Button>
            </div>
          </div>

          <div className="border-top border-gray-5">
            <NewsFeedItemComments commentable={true} item={this.props.newsFeedItem} showAllComments={true} />
          </div>

          <div className="px3 py2 border-top border-bottom">
            <Love heartable_id={this.props.newsFeedItem.id} heartable_type="NewsFeedItem" />
          </div>

        </Tile>
      </div>

    );
  },

  vote: function() {
    this.state.button_text = "Unvote";
  },

  unvote: function() {
    this.state.button_text = "Approve";
  }


});

module.exports = window.Proposal = Proposal;
