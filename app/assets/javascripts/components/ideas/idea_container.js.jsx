var RelatedIdeas = require('./related_ideas.js.jsx');

var IdeaContainer = React.createClass({
  displayName: 'IdeaContainer',

  propTypes: {
    navigate: React.PropTypes.func.isRequired
  },

  render() {
    var navigate = this.props.navigate;

    return (
      <div className="container">
        <div className="clearfix mxn2 py3">
          <div className="col col-8 px2">
            <h4 className="mt2 mb2">
              <a href="/ideas"
                className="bold"
                onClick={navigate.bind(null, '/ideas')}>
                &#8592; All app ideas
              </a>
            </h4>
          </div>

          <div className="col col-4 px2">
            <h5 className="mt2 mb2">Other app ideas</h5>
          </div>
        </div>

        <div className="clearfix mxn2">
          <div className="col col-8 px2">
            <div className="idea-item bg-white rounded shadow">
              {this.props.children}
            </div>
          </div>

          <div className="col col-4 px2">
            <RelatedIdeas />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = IdeaContainer;
