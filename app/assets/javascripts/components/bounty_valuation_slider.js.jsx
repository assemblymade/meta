(function() {
  var BountyValuationSlider = React.createClass({
    getDefaultProps: function() {
      return {
        steps: []
      }
    },

    getInitialState: function() {
      return {
        dragging: false,
        selectedStep: Math.round(Math.max(this.props.steps.length - 1, 0) / 2)
      }
    },

    componentDidUpdate: function (props, state) {
      if (this.state.dragging && !state.dragging) {
        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mouseup', this.handleMouseUp)
      } else if (!this.state.dragging && state.dragging) {
        document.removeEventListener('mousemove', this.handleMouseMove)
        document.removeEventListener('mouseup', this.handleMouseUp)
      }

      if (this.state.selectedStep !== state.selectedStep) {
        this.props.onChange({ target: { value: this.props.steps[this.state.selectedStep] }})
      }
    },

    handleClick: function(event) {
      this.setState({
        selectedStep: this.stepAtPosition(event.pageX)
      })

      event.stopPropagation()
      event.preventDefault()
    },

    handleMouseDown: function() {
      this.setState({
        dragging: true
      })
    },

    handleMouseMove: function(event) {
      if (!this.state.dragging)  {
        return
      }

      this.setState({
        selectedStep: this.stepAtPosition(event.pageX)
      })

      event.stopPropagation()
      event.preventDefault()
    },

    handleMouseUp: function(event) {
      this.setState({
        dragging: false
      })

      event.stopPropagation()
      event.preventDefault()
    },

    selectedStepExamples: function() {
      return [
        'Bug fixes, Feedback',
        'Mockups, Small features, Homepage copy',
        'Design assets, Front-end styling, Styleguide',
        'Rebranding, Full stack features, Performance tuning',
        'Entire site redesign, Execute marketing plan'
      ][this.state.selectedStep]
    },

    selectedStepPosition: function() {
      return this.state.selectedStep * this.stepPosition()
    },

    stepPosition: function() {
      return 1 / Math.max(this.props.steps.length - 1, 1) * 100
    },

    stepWidth: function() {
      return 1 / Math.max(this.props.steps.length, 1) * 100
    },

    stepAtPosition: function(position) {
      var offsetPosition = position - $(this.getDOMNode()).offset().left
      var percentage = offsetPosition / $(this.getDOMNode()).outerWidth()
      var position = Math.round(percentage * (this.props.steps.length - 1))

      return Math.max(0, Math.min(position, this.props.steps.length - 1))
    },

    render: function() {
      return (
        <div>
          <div className="slider" onClick={this.handleClick}>
            <ul className="slider-steps list-reset" style={{ width: 100 + this.stepPosition() + '%', marginLeft: -this.stepPosition()/2 + '%', padding: '0 17px' }}>
              {this.props.steps.map(function(step) {
                return (
                  <li style={{ width: this.stepWidth() + '%' }} key={step}>
                    {step}
                  </li>
                )
              }.bind(this))}
            </ul>

            <div className="slider-bar" style={{ width: this.selectedStepPosition() + '%' }}></div>

            <div style={{ margin: '0 13px', position: 'relative' }}>
              <div className="slider-cursor" style={{ left: this.selectedStepPosition() + '%' }} onMouseDown={this.handleMouseDown}></div>
            </div>
          </div>

          <div className="h6 mt2 mb0">
            <strong>Examples: </strong>
            <span className="gray-2">
              {this.selectedStepExamples()}
            </span>
          </div>
        </div>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyValuationSlider
  }

  window.BountyValuationSlider = BountyValuationSlider
})()
