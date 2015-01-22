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
    proposal: React.PropTypes.object,
    user_vote_state: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      approved: this.props.user_vote_state,
      percent: this.props.proposal.status
    };
  },

  render: function() {
    return (
      <div>
        {this.renderProposal()}
      </div>
    );
  },

  renderSubmit: function() {
    var text = this.state.approved ? 'Unvote' : 'Approve'
    var css = this.state.approved ? 'btn btn-danger' : 'btn btn-success'

    return (
      <button className = {css} onClick={this.toggle_vote}>
      {text}
    </button>
    )
  },

  renderAgreements: function() {
    return (
      <div>
      </div>
    )
  },

  renderProposal: function() {
    var my_style = 'progress-success';
    var progress_style = {
      position: 'relative',
      top: "50%",
      transform: "translateY(120%)"
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

            <div className="col-md-4" style = {progress_style} >
              <ProgressBar percent={this.state.percent} style = {my_style} />
                <div className = "col-md-offset-3">
                  {this.renderSubmit()}
                </div>
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

    toggle_vote: function(e) {
      e.preventDefault()

      var choicedata = {proposal: this.props.proposal.id}

      var proposalComponent = this
      $.ajax({
        method: 'POST',
        url: "/choices",
        json: true,
        data: choicedata,
      success: function(data) {
        proposalComponent.setState({percent: data.progress, approved: data.approved})
        console.log(data.progress)
      }});


    }

  });

    module.exports = window.Proposal = Proposal;
