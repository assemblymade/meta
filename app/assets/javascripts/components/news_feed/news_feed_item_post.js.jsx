var Markdown = require('../markdown.js.jsx')

module.exports = React.createClass({
  displayName: 'NewsFeedItemPost',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired
  },

  render: function() {
    return (
      <div className="p3">
        <a className="h3 block bold mt0 mb3 blue" href={this.props.url}>
          {this.props.title}
        </a>
        <div className="gray-darker">
          <Markdown content={this.props.body} normalized={true} />
        </div>
      </div>
    )
  }
})
