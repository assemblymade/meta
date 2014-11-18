/** @jsx React.DOM */

(function() {
  var TaggedInput = React.createClass({
    getInitialState: function() {
      return {
        unparsedTag: ''
      }
    },

    renderTags: function() {
      if(!this.props.tags.length) {
        return
      }

      return this.props.tags.map(function(tag) {
        return ( 
          <li>
            <a className="tag inline">
              {tag.type}:{tag.value}
              <span className="remove">
                &times;
              </span>
            </a>
          </li>
        )
      })
    },

    renderSuggestion: function() {
      return null
    },

    handleChange: function(event) {
      var value = event.target.value
      var lastChar = value[value.length - 1]

      if(lastChar === ' ') {
        tag = this.parseTag(value)

        if(tag) {
          value = ''
          this.props.onAddTag(tag)
        }
      }

      this.setState({
        unparsedTag: value
      })
    },

    parseTag: function(unparsedTag) {
      var values = unparsedTag.split(':')

      if(values.length > 1) {
        return { type: values[0], value: values[1] }
      }
    },

    render: function() {
      return (
        <div className="form-control form-control-tagged">
          <ul className="list-inline">
            {this.renderTags()}

            <li>
              <input type="text" value={this.state.unparsedTag} onChange={this.handleChange} />
            </li>
          </ul>
          {this.renderSuggestion()}
        </div>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = TaggedInput
  }

  window.TaggedInput = TaggedInput
})();
