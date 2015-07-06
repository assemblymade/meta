import classnames from 'classnames'

const ProgressBar = React.createClass({
  propTypes: {
    value: React.PropTypes.number.isRequired,
    color: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      color: 'gray-2'
    }
  },

  render() {
    const {color} = this.props
    const value = numeral(this.props.value)
    const cs = classnames('progress-bar', `bg-${color}`)

    const style = {
      width: value.format('0%')
    }

    return <div className={cs} role="progressbar" style={style}>
      <span className="sr-only">{value.format('0%')}</span>
    </div>
  }
})

const Progress = React.createClass({

  statics: {
    Bar: ProgressBar
  },

  propTypes: {
    size: React.PropTypes.oneOf(['sm', 'default']),
  },

  getDefaultProps() {
    return {
      size: 'default'
    }
  },

  render() {
    const {size} = this.props
    const cs = classnames('progress', 'clearfix', {
      'progress--sm': size === 'sm',
      'progress--default': size === 'default',
    })

    return (
      <div className={cs}>
        {this.props.children}
      </div>
    )
  },
});

export default Progress
