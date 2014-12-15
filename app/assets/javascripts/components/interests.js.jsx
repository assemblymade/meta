var Interests = React.createClass({
  propTypes: {
    curatedMarks: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      selectedMarks: [],
      selectedSuggestions: []
    }
  },

  renderCuratedMarks: function() {
    return this.props.curatedMarks.map(function(mark) {
      return this.renderCuratedMark(mark)
    }.bind(this))
  },

  renderCuratedMark: function(mark) {
    var selectedMarks = this.state.selectedMarks
    var index = _.pluck(selectedMarks, 'name').indexOf(mark.name)
    var selected = index >= 0

    var handleClick = function() {
      if (selected) {
        selectedMarks.splice(index, 1)
      } else {
        selectedMarks.push(mark)
      }

      this.setState({
        selectedMarks: selectedMarks
      })
    }.bind(this)

    var classes = ['btn', 'btn-block', 'mt2', 'py2', 'border-2']

    if (selected) {
      classes = classes.concat(['btn-default', 'green', 'border-green'])
    } else {
      classes = classes.concat(['btn-primary', 'white', 'bg-blue', 'border-blue'])
    }

    var icon = null

    if (selected) {
      icon = <span className="icon icon-check mr1"></span>
    }

    return (
      <div className="col-md-4">
        <div className="bg-white rounded h4 mt0 mb0 p3">
          <h3 className="bold h3 mt0 mb1">
            {mark.name.toUpperCase()}
          </h3>

          <p className="mb0">
            {mark.description}            
          </p>

          <a className={classes.join(' ')} onClick={handleClick} href="#">
            {icon}
            That&#39;s me
          </a>
        </div>
      </div>
    )
  },

  renderSuggestedHeader: function() {
    if (this.state.selectedMarks.length) {
      return (
        <div>
          <div className="row py4">
            <div className="col-md-4 col-md-offset-4">
              <hr />
            </div>
          </div>

          <div className="row mb4">
            <div className="col-md-8 col-md-offset-2 center">
              <p className="large">Sweet! Pick three specialties so we can help you find the perfect product.</p>
            </div>
          </div>
        </div>
      )
    }
  },

  renderSuggestedMarks: function() {
    var selectedMarks = this.state.selectedMarks

    var marks = _.pluck(selectedMarks, 'related_marks')
    var marks = _.zip.apply(this, marks)
    var marks = _.chain(marks).flatten().compact().groupBy(function(mark, index) { return Math.floor(index / 4) }).values().value()

    return marks.map(function(row) {
      return (
        <div className="row mt3">
          {row.map(this.renderSuggestedMark)}
        </div>
      )
    }.bind(this))
  },

  renderSuggestedMark: function(mark) {
    var selectedSuggestions = this.state.selectedSuggestions
    var index = _.pluck(selectedSuggestions, 'name').indexOf(mark.name)
    var selected = index >= 0

    var handleClick = function() {
      if (selected) {
        selectedSuggestions.splice(index, 1)
      } else {
        selectedSuggestions.push(mark)
      }

      this.setState({
        selectedSuggestions: selectedSuggestions
      })
    }.bind(this)

    var classes = ['btn', 'btn-block', 'py3', 'bg-white', 'border-2']

    if (selected) {
      classes = classes.concat(['btn-default', 'green', 'border-green'])
    } else {
      classes = classes.concat(['btn-primary', 'blue', 'border-white'])
    }

    var icon = null

    if (selected) {
      icon = <span className="icon icon-check mr1"></span>
    }

    return (
      <div className="col-md-3">
        <a className={classes.join(' ')} onClick={handleClick} href="#">
          {mark.name.toUpperCase()}
        </a>
      </div>
    )
  },

  renderSuggestedFooter: function() {
    var selectedMarks = this.state.selectedMarks
    var selectedSuggestions = this.state.selectedSuggestions

    if (selectedMarks.length) {
      var progress = Math.min(selectedSuggestions.length / 3 * 100, 100)

      var classes = ['right', 'btn', 'btn-primary']

      if (progress < 100) {
        classes.push('disabled')
      }

      var suggestionsUrl = ['/', 'suggestions']

      if(selectedSuggestions.length) {
       var params = selectedSuggestions.map(function(mark) {
          return 'tags[]=' + encodeURI(mark.name)
        }).join('&')
        suggestionsUrl = suggestionsUrl.concat(['?', params])
      }

      return (
        <div className="row mt4">
          <div className="col-md-6">
            <div className="progress mt1">
              <div className="progress-bar bg-green" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{ width: progress + '%' }}></div>
            </div>
          </div>

          <div className="col-md-6">
            <a className={classes.join(' ')} href={suggestionsUrl.join('')}>
              Take a look at some suggestions
            </a>
          </div>
        </div>
      )
    }
  },

  render: function() {
    return (
      <div>
        {this.renderCuratedMarks()}

        {this.renderSuggestedHeader()}
        {this.renderSuggestedMarks()}
        {this.renderSuggestedFooter()}
      </div>
    )
  }
})

module.exports = window.Interests = Interests
