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
      return <span />;
    }

    var renderedLovers = lovers.slice(0, limit).map((lover) => {
      return (
        <li className="left mr1 mt1" key={lover.id}>
          <Avatar user={lover} size={24} />
        </li>
      );
    });

    if (lovers.length > limit) {
      renderedLovers.push(
        <li className="left py1 h6 bold gray-2 mt1">
          + {lovers.length - limit}
        </li>
      );
    }

    return renderedLovers;
  }
});

module.exports = IdeaLovers;
