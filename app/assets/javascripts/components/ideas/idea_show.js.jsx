var Avatar = require('../ui/avatar.js.jsx');
var IdeaDiscussion = require('./idea_discussion.js.jsx');
var IdeaStore = require('../../stores/idea_store');
var IdeaTile = require('./idea_tile.js.jsx');
var Love = require('../love.js.jsx');
var Markdown = require('../markdown.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
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
    IdeaStore.addChangeListener(this.getIdea);
  },

  componentWillUnmount: function() {
    IdeaStore.removeChangeListener(this.getIdea);
  },

  getIdea: function() {
    this.setState({
      idea: IdeaStore.getIdea()
    });
  },

  getInitialState: function() {
    return {
      idea: IdeaStore.getIdea()
    };
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

        <div className="container">
          <div className="clearfix py3">
            <div className="col col-8">
              <h4 className="mt2 mb2">
                <a href="/ideas"
                    className="bold"
                    onClick={navigate.bind(null, (document.referrer || '/ideas'))}>
                    &#8592; All app ideas
                </a>
              </h4>
            </div>

            <div className="col col-4">
              <h5 className="mt2 mb2">Related app ideas</h5>
            </div>
          </div>

          <div className="clearfix">
            <div className="col col-8">
              <div className="idea-item card">
                {this.renderHeader()}
                {this.renderBody()}
              </div>
            </div>

            <div className="col col-4">
              <div className="mb4">
                <IdeaTile idea={idea} />
              </div>

              <div>
                <IdeaTile idea={idea} />
              </div>
            </div>
          </div>

          <div className="clearfix">
            <div className="card bg-white py3">
              <span className="px4">Get updates on each day's top-ranking product ideas</span>
            </div>
          </div>
        </div>
      </main>
    );
  },

  renderBody: function() {
    var idea = this.state.idea;
    var user = idea.user;

    return (
      <div className="py3 px4 border-bottom border-2px">
        <span className="left mr1"><Avatar user={user} /></span>
        <span className="bold">{user.username}</span>{' '}
        <span className="gray-2">posted</span>

        <div className="py3">
          <h1 className="mt0 mb0">{idea.name}</h1>

          <div className="mt3">
            <Markdown content={idea.body} normalized={true} />
          </div>
        </div>

        <div className="py3">
          <IdeaDiscussion comments={[]}
              login_path="/login"
              signup_path="/signup"
              url={idea.url + '/comments'} />
        </div>
      </div>
    );
  },

  renderHeader: function() {
    var idea = this.state.idea;

    return (
      <div className="table mb0 border-bottom border-2px">
        <div className="table-cell center col col-2 px2 mt2">
          <Love
            heartable_id={idea.news_feed_item.id}
            heartable_type="NewsFeedItem" />
        </div>

        <div className="table-cell col col-8 border-2px border-right border-left border-gray px2">
          <ProgressBar progress={88} />
        </div>

        <div className="table-cell col col-1 px2 mt2">
          <a href={idea.url} className="comment-count">
            <SvgIcon type={'svg-icon-comment'} />
            {idea.comments_count}
          </a>
        </div>

        <div className="table-cell col col-1 p2 center border-2px border-left border-gray">
          <a href="#" className="action-icon">
            <SvgIcon type={'svg-icon-share'} />
          </a>
        </div>
      </div>
    );
  }
});

module.exports = IdeaShow;
