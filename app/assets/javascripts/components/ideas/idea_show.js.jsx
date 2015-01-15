var Avatar = require('../ui/avatar.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Icon = require('../icon.js.jsx');
var IdeaContainer = require('./idea_container.js.jsx');
var IdeaSharePanel = require('./idea_share_panel.js.jsx');
var IdeaStore = require('../../stores/idea_store');
var IdeaTile = require('./idea_tile.js.jsx');
var Love = require('../love.js.jsx');
var Markdown = require('../markdown.js.jsx');
var NewsFeedItemComments = require('../news_feed/news_feed_item_comments.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
var StartConversationModal = require('./start_conversation_modal.js.jsx');
var StartConversationModalStore = require('../../stores/start_conversation_modal_store');
var SvgIcon = require('../ui/svg_icon.js.jsx');

var IdeaShow = React.createClass({
  displayName: 'IdeaShow',

  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount: function() {
    IdeaStore.addChangeListener(this.onIdeaChange);
    StartConversationModalStore.addChangeListener(this.onModalChange);
  },

  componentWillUnmount: function() {
    IdeaStore.removeChangeListener(this.onIdeaChange);
    StartConversationModalStore.removeChangeListener(this.onModalChange);
  },

  getInitialState: function() {
    return {
      idea: IdeaStore.getIdea(),
      isDrawerOpen: false,
      startConversationModalShown: StartConversationModalStore.isModalShown()
    };
  },

  handleShareClick: function() {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  },

  onIdeaChange: function() {
    this.setState({
      idea: IdeaStore.getIdea()
    });
  },

  onModalChange: function() {
    this.setState({
      startConversationModalShown: StartConversationModalStore.isModalShown()
    });
  },

  onRelatedIdeasChange: function() {
    this.setState({
      relatedIdeas: RelatedIdeaStore.getRelatedIdeas()
    });
  },

  render: function() {
    var idea = this.state.idea;
    var navigate = this.props.navigate;

    if (_.isEmpty(idea)) {
      return null;
    }

    return (
      <main role="main">
        <div className="subnav bg-white p3">
          <div className="clearfix">
            <div className="px4 left">
              <h4 className="mt2 mb2">
                Band together to build the app ideas people love.
              </h4>
            </div>
            <div className="px4 right py1">
              <button type="button" className="_button pill theme-green shadow text-shadow border">
                <span className="title">Add your app idea</span>
              </button>
            </div>
          </div>
        </div>

        <IdeaContainer navigate={navigate}>
          {this.renderHeader()}

          <div className="mxn3">
            <Drawer open={this.state.isDrawerOpen}>
              <IdeaSharePanel idea={idea} />
            </Drawer>
          </div>

          {this.renderBody()}
        </IdeaContainer>
        <StartConversationModal idea={idea}
          modalShown={this.state.startConversationModalShown} />
      </main>
    );
  },

  renderBody: function() {
    var idea = this.state.idea;
    var user = idea.user;

    return (
      <div className="_pt3 border-2px">
        <span className="left mr1 ml4"><Avatar user={user} /></span>
        <span className="bold">{user.username}</span>{' '}
        <span className="gray-2">posted</span>

        <div className="py3 px4">
          <h1 className="mt0 mb0">{idea.name}</h1>

          <div className="mt3">
            <Markdown content={idea.body} normalized={true} />
          </div>
        </div>

        <hr className="py0 mb0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <div className="px4">
          <NewsFeedItemComments commentable={true}
              item={idea.news_feed_item}
              showAllComments={true} />
        </div>
      </div>
    );
  },

  renderDiscoverBlocks: function() {
    return (
      <div className="clearfix mxn2 py2">
        <a href="#" className="block col col-6 px2">
          <div className="rounded text-white bg-gray-2 p3">
            <div className="clearfix">
              <div className="col col-8">
                <h6 className="caps mt0 mb0" style={{ fontWeight: 'normal' }}>Trending</h6>
                <span className="bold" style={{ fontSize: 18 }}>Design ideas</span>
              </div>
              <div className="col col-4">
                <span className="right mt0 mb0" style={{ fontSize: 36, fontWeight: 200 }}>112</span>
              </div>
            </div>
          </div>
        </a>

        <a href="#" className="block col col-6 px2">
          <div className="rounded text-white bg-gray-2 p3">
            <div className="clearfix">
              <div className="col col-8">
                <h6 className="caps mt0 mb0" style={{ fontWeight: 'normal' }}>Trending</h6>
                <span className="bold" style={{ fontSize: 18 }}>Mobile ideas</span>
              </div>
              <div className="col col-4">
                <span className="right mt0 mb0" style={{ fontSize: 36, fontWeight: 200 }}>112</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    )
  },

  renderHeader: function() {
    var idea = this.state.idea;

    return (
      <div className="clearfix border-bottom border-2px mb0">
        <div className="center col col-2 px2 mt2">
          <Love
            heartable_id={idea.news_feed_item.id}
            heartable_type="NewsFeedItem" />
        </div>

        <div className="col col-8 border-2px border-right border-left border-gray px2">
          <ProgressBar progress={idea.temperature} />
        </div>

        <div className="col col-1 px1 mt2">
          <a href={idea.url} className="comment-count">
            <SvgIcon type="comment" />
            {idea.comments_count}
          </a>
        </div>

        <div className="col col-1 p2 center border-2px border-left border-gray">
          <a href="javascript:void(0);" className="action-icon gray" onClick={this.handleShareClick}>
            <SvgIcon type="share" />
          </a>
        </div>
      </div>
    );
  },

  renderSubscriptionForm: function() {
    return (
      <div className="card bg-white">
        <div className="clearfix overflow-hidden">
          <div className="py2 col col-1 center">
            <Icon icon="cloud" />
          </div>

          <div className="py2 col col-5">
            <span className="mt2">Get updates on each day's top-ranking product ideas</span>
          </div>

          <div className="py2 col col-5">
            <form className="form-inline">
              <div className="form-group">
                <input className="ml4 form-control input-sm left" ref="email" />
                <button className="btn-primary pill-button pill-button-theme-white pill-button-border pill-button-shadow left ml2">
                  <span className="py2">Join</span>
                </button>
              </div>
            </form>
          </div>

          <div className="py2 col col-1 border-left border-2px center">
            <span>&times;</span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = IdeaShow;
