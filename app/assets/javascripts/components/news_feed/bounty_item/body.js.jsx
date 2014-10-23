(function() {
  var NewsFeedBountyItemBody = React.createClass({
    propTypes: {
      bounty: React.PropTypes.object.isRequired
    },

    render: function() {
      var bounty = this.props.bounty;

      return (
        <div className="p3">
          <span dangerouslySetInnerHTML={{__html: bounty.markdown_description}} />
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedBountyItemBody;
  }
})();
