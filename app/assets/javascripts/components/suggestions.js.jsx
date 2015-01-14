var Idea = require('./ideas/idea.js.jsx')

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <div className="h4 gray-dark caps center">Ruby</div>
        <div className="tile-grid tile-grid-ideas">
          <div className="main">
            <div className="grid fixed-small">
              {this.renderIdeas()}
            </div>
          </div>
        </div>

        <div className="h4 gray-dark caps center">UX</div>
        <div className="tile-grid tile-grid-ideas">
          <div className="main">
            <div className="grid fixed-small">
              {this.renderIdeas()}
            </div>
          </div>
        </div>

        <div className="h4 gray-dark caps center">React</div>
        <div className="tile-grid tile-grid-ideas">
          <div className="main">
            <div className="grid fixed-small">
              {this.renderIdeas()}
            </div>
          </div>
        </div>
      </div>
    )
  },

  renderIdeas: function(name) {
    var ideas = this.props.ideas

    if (ideas.length) {
      return ideas.map(function(idea) {
        return <Idea idea={idea} />
      })
    }
  }
})

window.Suggestions = module.exports
