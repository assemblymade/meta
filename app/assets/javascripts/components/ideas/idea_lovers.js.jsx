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
      limit: 5
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
      <ul className="list-reset mb0 mxn1 clearfix">
        {this.renderLovers()}
      </ul>
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
        <li className="left px1" key={lover.id}>
          <Avatar user={lover} size={24} />
        </li>
      );
    });

    if (lovers.length > limit) {
      renderedLovers.push(
        <li className="right bold gray-2 px1">
          +{lovers.length - limit}
        </li>
      );
    }

    return renderedLovers;
  }
});

module.exports = IdeaLovers;
