var Interests = React.createClass({
  propTypes: {
    marks: React.PropTypes.array.isRequired
  },

  getDefaultProps: function() {
    return {
      jokeMarks: {
        'Development': ['Intercal'],
        'Design': ['Microsoft Paint'],
        'Growth': ['Air Guitar']
      },
      marks: {}
    }
  },

  getInitialState: function() {
    return {
      selected: []
    }
  },

  renderMarks: function(section) {
    var marks = this.props.marks[section]
    var jokeMarks = this.props.jokeMarks[section]

    marks = marks.concat(_.intersection(this.state.selected, jokeMarks))

    marks = marks.map(function(mark) {
      return this.renderMark(mark, section)
    }.bind(this))

    return (
      <div className="row">
        <div className="col-xs-12">
          <h4 className="gray-2 caps mt3 mb3 ml2">
            {section}
          </h4>
          {marks}
        </div>
      </div>
    )
  },

  renderMark: function(mark, section) {
    var selected = this.state.selected
    var index = selected.indexOf(mark)
    var isSelected = index >= 0

    var handleClick = function(event) {
      event.stopPropagation()
      event.preventDefault()

      if (isSelected) {
        selected.splice(index, 1)
      } else {
        selected.push(mark)
      }

      this.setState({
        selected: selected
      })
    }.bind(this)

    var classes = ['bg-white', 'border-2', 'p2', 'rounded', 'caps', 'bold']

    if (isSelected) {
      classes = classes.concat(['green', 'green-hover', 'green-focus', 'border-green'])
    } else {
      classes = classes.concat(['blue', 'border-white'])
    }

    var icon = null

    if (isSelected) {
      icon = <span className="icon icon-check mr1"></span>
    }

    return (
      <div className="inline-block px2 py3">
        <a className={classes.join(' ')} onClick={handleClick} href="#">
          {icon}
          {mark.toUpperCase()}
        </a>
      </div>
    )
  },

  renderProgress: function() {
    var progress = (this.state.selected.length / 3) * 360;

    if (progress >= 360) {
      return
    }

    return (
      <span className="mr2 pie-container">
        <div className={progress > 180 ? 'pie big' : 'pie'} data-start="0" data-value={progress}></div>
        <div className={progress < 180 ? 'pie big' : 'pie'} data-start={progress} data-value={360 - progress}></div>
      </span>
    )
  },

  renderFooter: function() {
    var selected = this.state.selected
    var progress = Math.min(selected.length / 3 * 100, 100)

    var classes = ['right', 'bg-blue', 'bold', 'h4', 'px3', 'py2', 'rounded', 'mt0', 'b0', 'align-left']

    if (progress < 100) {
      classes.push('gray-5', 'gray-5-hover')
    } else {
      classes.push('white', 'white-hover')
    }

    var suggestionsUrl = ['/', 'suggestions']

    if (selected.length) {
     var params = selected.map(function(mark) {
        return 'tags[]=' + encodeURI(mark)
      }).join('&')
      suggestionsUrl = suggestionsUrl.concat(['?', params])
    }

    var selectionsLeft = 3 - selected.length
    var text = null
    var style = {}

    if (selectionsLeft > 0) {
      var topic = selectionsLeft > 1 ? 'topics' : 'topic'
      text = 'Pick ' + selectionsLeft + ' more ' + topic
      style = { width: 250, paddingLeft: 64 }
    } else {
      text = 'Go ahead and look at your suggestions'
    }

    var handleClick = function(event) {
      event.stopPropagation()
      event.preventDefault()

      this.setState({
        selected: _.union(this.state.selected, ['Intercal', 'Microsoft Paint', 'Air Guitar'])
      })
    }.bind(this)

    if(!this.state.selected.length) {
      var skipButton = (
        <span className="h4 py2 mt0 mb0 mr2" style={{ 'line-height': 48 }}>
          <a onClick={handleClick} href="#" className="underline">Just pick them for me</a>
          {' '}
          or
        </span>
      )
    }

    if(this.state.selected.length >= 3) {
      var encouragement = (
        <span className="h4 py2 mt0 mb0 mr2" style={{ lineHeight: '48px' }}>
          Keep going! You're on a roll.
        </span>
      )
    }

    return (
      <div className="row mt4">
        <div className="col-xs-12">
          <div className="align-right">
            {skipButton}
            {encouragement}
            <a className={classes.join(' ')} style={style} href={suggestionsUrl.join('')}>
              {this.renderProgress()}
              {text}
            </a>
          </div>
        </div>
      </div>
    )
  },

  render: function() {
    return (
      <div>
        {this.renderMarks('Growth')}
        {this.renderMarks('Design')}
        {this.renderMarks('Development')}

        {this.renderFooter()}
      </div>
    )
  }
})

module.exports = window.Interests = Interests
