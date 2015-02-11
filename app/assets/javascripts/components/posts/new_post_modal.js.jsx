'use strict';

const Lightbox = require('../lightbox.js.jsx');
const NewPostForm = require('./new_post_form.js.jsx');
const Tile = require('../ui/tile.js.jsx');

let NewPostModal = React.createClass({
  propTypes: {
    id: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      id: 'new-post-modal'
    };
  },

  render() {
    return (
      <Lightbox title="Create a post" id={this.props.id}>
        <div className="modal-body">
          <div className="clearfix full-width">
            <NewPostForm />
          </div>
        </div>
      </Lightbox>
    );
  }
});

module.exports = window.NewPostModal = NewPostModal;
