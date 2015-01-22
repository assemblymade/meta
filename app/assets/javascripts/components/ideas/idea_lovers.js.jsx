var Avatar = require('../ui/avatar.js.jsx');
var LoversActionCreators = require('../../actions/lovers_action_creators');
var LoversStore = require('../../stores/lovers_store');

var IdeaLovers = React.createClass({
  propTypes: {
    heartableId: React.PropTypes.string.isRequired,
    limit: React.PropTypes.number
  },

  componentDidMount() {
    LoversStore.addChangeListener(this.onLoveChange);
    LoversActionCreators.retrieveLovers(this.props.heartableId);
  },

  componentWillUnmount() {
    LoversStore.removeChangeListener(this.onLoveChange);
  },

  getDefaultProps() {
    return {
      limit: 8
    };
  },

  getInitialState() {
    return {
      lovers: LoversStore.getLovers(this.props.heartableId) || []
    };
  },

  onLoveChange() {
    this.setState({
      lovers: LoversStore.getLovers(this.props.heartableId)
    });
  },

  render() {
    return (
      <div className="clearfix">
        {this.renderLovers()}
      </div>
    )
  },

  renderLovers() {
    var lovers = this.state.lovers;
    var limit = this.props.limit;

    if (!lovers || !lovers.length) {
      return <span className="gray-1">No love just yet &mdash; be the first to heart this idea!</span>;
    }

    var renderedLovers = lovers.slice(0, limit).map((lover) => {
      return (
        <span className="left mr1" key={lover.id}>
          <Avatar user={lover} size={20} />
        </span>
      );
    });

    if (lovers.length > limit) {
      renderedLovers.push(
        <span className="bold bg-gray-3 center px1"
          style={{
            borderRadius: 8,
            minWidth: 50,
            height: 20,
            color: 'white' }}>
          + {lovers.length - limit}
        </span>
      );
    }

    return renderedLovers;
  }
});

module.exports = IdeaLovers;
