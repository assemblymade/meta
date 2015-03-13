'use strict';

// https://github.com/jxnblk/rebass/blob/master/src/modal.jsx
const classnames = require('classnames');
const colorbass = require('colorbass');

const Modal = React.createClass({
  getDefaultProps: function() {
    return {
      isOpen: false,
      flush: false,
      fullBleed: false,
      size: 'medium',
      header: '',
      color: false,
      onDismiss: function() {}
    }
  },

  render: function() {
    let isOpen = this.props.isOpen;
    let header = this.props.header;
    let bassClasses = colorbass(this.props.color);
    let classes = {
      body: classnames( this.props.flush ? '' : 'p2'),
      header: classnames('flex', 'flex-center', bassClasses.primary),
      container: classnames('flex flex-center overflow-auto bg-darken-3', { p2: !this.props.fullBleed }),
    };
    let width = 640;
    if (this.props.size == 'big') { width = 960 }
    else if (this.props.size == 'small') { width = 320 }

    let styles = {
      container: {
        display: isOpen ? '' : 'none',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1000,
      },
      overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      modal: {
        position: 'relative',
        width: this.props.fullBleed ? 'auto' : width,
        maxWidth: '100%',
        margin: 'auto',
        overflow: 'hidden',
        boxShadow: '0 4px 4px rgba(0,0,0,.1)',
        opacity: 0.98
      },
      dismissButton: {
        fontSize: '2rem'
      },
    };

    if (this.props.fullBleed) {
      styles.modal.position = 'absolute';
      styles.modal.top = 0;
      styles.modal.right = 0;
      styles.modal.bottom = 0;
      styles.modal.left = 0;
      styles.modal.margin = 0;
    }

    return (
      <div className={classes.container}
        style={styles.container}>
        <a href="#!"
          style={styles.overlay}
          onClick={this.props.onDismiss}/>
        <div className="bg-white rounded"
          style={styles.modal}>
          <div className={classes.header}>
            <div className="bold p2 flex-auto">{header}</div>
            <button className="h3 button bg-white"
              style={styles.dismissButton}
              onClick={this.props.onDismiss}
              title="Dismiss">
              &times;
            </button>
          </div>
          <div className={classes.body}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Modal;
