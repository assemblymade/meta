

(function() {
  var TaggedInput = React.createClass({
    renderTags: function() {
      if(!this.props.tags.length) {
        return
      }

      return this.props.tags.map(function(tag) {
        return (
          <div className="table-cell">
            <a className="tag mr1 inline">
              {tag.type}:{tag.value}
              <span className="remove" onClick={this.handleRemoveClick(tag)} style={{ display: 'inline' }}>
                &times;
              </span>
            </a>
          </div>
        )
      }.bind(this))
    },

    renderSuggestion: function() {
      return null
    },

    handleChange: function(event) {
      // var value = event.target.value
      // var lastChar = value[value.length - 1]

      // if(lastChar === ' ') {
      //   parseData = this.parseTags(value)

      //   if(parseData.tags.length) {
      //     value = parseData.value

      //     for (i in parseData.tags) {
      //       debugger
      //       this.props.onAddTag(parseData.tags[i])
      //     }
      //   }
      // }

      this.setState({
        value: event.target.value
      })
    },

    handleRemoveClick: function(tag) {
      return function(event) {
        event.preventDefault()
        this.props.onRemoveTag(tag)
      }.bind(this)
    },

    parseTags: function(unparsedTag) {
      var words = unparsedTag.split(/(\s*,?\s*)+/)
      var parts = _.partition(words, function(word) {
        return word.indexOf(':') == -1
      })

      var text = parts[0].join(' ')
      var tags = parts[1].map(function(tag) {
        var values = tag.split(':')

        if(values.length > 1) {
          return { type: values[0], value: values[1] }
        }
      })

      return { text: text, tags: tags }
    },

    render: function() {
      return (
        <div>
          <div className="table mb0">
            <div className="table-cell full-width">
              <input type="text" value={this.props.value} onChange={this.props.onChange} className="full-width" style={{ padding: 0 }} />
            </div>
          </div>
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
