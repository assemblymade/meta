import Accordion from '../ui/accordion.js.jsx'
import Button from '../ui/button.js.jsx'
import classnames from 'classnames'
import moment from 'moment'
import React, {PropTypes} from 'react'
import Tile from '../ui/tile.js.jsx'

export default React.createClass({
  propTypes: {
    product: PropTypes.object,
  },

  render() {
    return (
      <div className="mb3">
        <Accordion title="Export to assembly.com">
          <div className="mxn3">
            <Tile>
              <div className="block px3 py2 clearfix border-bottom">
                <p>
                  <a href="http://changelog.assembly.com/new">Create a changelog</a> and use the current url to import {this.props.product.name}
                </p>
              </div>
            </Tile>
          </div>
        </Accordion>
      </div>
    )
  }
})
