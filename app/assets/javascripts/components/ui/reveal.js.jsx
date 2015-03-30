'use strict'

import OverflowFade from './overflow_fade.js.jsx'

const Reveal = React.createClass({

  getInitialState() {
    return {
      revealed: false
    }
  },

  render() {
    const {children} = this.props

    if (this.state.revealed) {
      return children
    } else {
      return <div>
        <div className="mb2">
          <OverflowFade height="20rem" dimension="vertical">
            {children}
          </OverflowFade>
        </div>
        <a href="#" onClick={this.handleReveal}>Read more</a>
      </div>
    }
  },

  handleReveal(e) {
    e.preventDefault()
    this.setState({
      revealed: true
    })
  }

})

export default Reveal
