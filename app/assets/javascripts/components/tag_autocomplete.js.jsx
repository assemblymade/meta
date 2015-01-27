var TextInput = require('./text_input.js.jsx')

var TagAutocomplete = React.createClass({
  getInitialState() {
    return {
      value: '',
      tags: [],
      suggestedTags: []
    }
  },

  render() {
    var tags = this.renderTags()
    var input = this.renderInput()
    var dropdown = this.renderDropdown()

    return (
      <div>
        <div className="relative">
          <div className="form-control input-md">
            <ul className="list-reset overflow-hidden">
              {tags}
              {input}
            </ul>
          </div>
          {dropdown}
        </div>
        <div className="h6 bold inline-block">
          Popular Tags
        </div>
      </div>
    )
  },

  renderTags() {
    var tags = this.state.tags

    return tags.map(tag => <li>#{tag}</li>)
  },

  renderInput() {
    var value = this.state.value

    return (
      <li className="overflow-hidden">
        <input type="text" value={this.state.value} onChange={this.onChange} className="inline-block full-width" style={{ border: 'none', padding: 0 }} />
      </li>
    )
  },

  renderDropdown() {
    var tags = this.state.suggestedTags

    if (!tags.length) {
      return
    }

    return (
      <DropdownMenu>
        {tags.map(tag => <DropdownMenu.Item label={tag} />)}
      </DropdownMenu>
    )
  },

  onChange(event) {
    this.setState({
      value: event.target.value,
      suggestedTags: ['red', 'green', 'blue']
    })
  }
})

module.exports = TagAutocomplete
