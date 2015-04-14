'use strict';

const Tile = require('../ui/tile.js.jsx');

let Sheet = React.createClass({
  render: function() {
    return (
      <article className="sm-col-11 md-col-7 lg-col-6 mx-auto mt3">
        <Tile padding="4">
          {this.props.children}
        </Tile>
      </article>
    );
  }
});
