var Lightbox = require('../lightbox.js.jsx');
// Even assigning NewsFeedItem locally to what's on window fails -- this is
// really, really weird
// var NewsFeedItem = window.NewsFeedItem;

var NewsFeedItemModal = React.createClass({
  displayName: 'NewsFeedItemModal',
  propTypes: {
    item: React.PropTypes.object.isRequired,
    onHidden: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
    var modal = $(this.getDOMNode()).modal({ show: true });

    modal.on('hidden.bs.modal', this.props.onHidden);
    window.app.setCurrentAnalyticsProduct(this.props.item.product);
  },

  render: function() {
    return (
      <Lightbox>
        {this.renderItem()}
      </Lightbox>
    );
  },

  renderItem: function() {
    return <NewsFeedItem {...this.props.item}
        commentable={true}
        showAllComments={true}
        enableModal={false} />;
  }
});

module.exports = NewsFeedItemModal;
