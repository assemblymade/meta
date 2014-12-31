var LoveStore = require('../stores/love_store');
var UserStore = require('../stores/user_store');

// Why do this component and the Love component use underscored variables?

var Lovers = React.createClass({
  propTypes: {
    heartable_id: React.PropTypes.string.isRequired
  },

  componentDidMount: function() {
    LoveStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    LoveStore.removeChangeListener(this._onChange)
  },

  getInitialState: function() {
    return _.extend(this.getStateFromStore(), { showAllLovers: false });
  },

  getFirstLover: function() {
    var recentLovers = this.state.recentLovers;

    if (this.state.user_heart) {
      return UserStore.getUser();
    }

    return recentLovers[0];
  },

  getStateFromStore: function() {
    var heartable = LoveStore.get(this.props.heartable_id)
    var hearts = (heartable.hearts || [])
    var lovers = _(hearts).reduce(function(memo, h) {
      memo.push(h.user)
      return memo
    }, [])

    return {
      hearts_count: heartable.hearts_count,
      recentLovers: lovers,
      user_heart: heartable.user_heart || false
    }
  },

  render: function() {
    if (this.state.recentLovers.length < 1) {
      return null;
    }

    var lover = this.getFirstLover();

    return (
      <div className="inline-block mb1">
        <div className="inline-block valign-mid">
          {this.renderAvatar(lover)}
        </div>
        <div className="inline-block valign-mid gray-2 fs3">
          {this.renderLoverLink(lover)}
          {this.renderMessage()}
        </div>
      </div>
    );
  },

  renderAvatar: function(user) {
    return (
      <div className="left mr1">
        <Avatar user={user} size={18} />
      </div>
    );
  },

  renderLoverLink: function(lover) {
    var userId = UserStore.getId();

    return (
      <a href={lover.url}
          className="black bold">
        {lover.id === userId ? 'You' : lover.username}
      </a>
    );
  },

  renderManyLovers: function() {
    var count = this.state.hearts_count - 1;
    var lover = this.getFirstLover();

    return (
      <span>{' '}
        and
        <span onClick={this.showAllLovers}>{' '}
          {count} {count === 1 ? 'other person' : 'others'}
        </span>
        {' '}like this
      </span>
    );
  },

  renderMessage: function() {
    var userHeart = this.state.user_heart;
    var count = this.state.hearts_count;

    if (count === 1) {
      return ' like' + (userHeart ? ' ' : 's ') + 'this';
    }

    return this.renderManyLovers();
  },

  showAllLovers: function() {
    LoveActionCreators.retrieveAllHearts(this.props.heartable_id);
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }
})

window.Lovers = Lovers
module.exports = Lovers
