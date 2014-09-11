/** @jsx React.DOM */

var Dispatcher = require('../dispatcher');

(function() {
  var DragAndDrop = React.createClass({
    getInitialState: function() {
      return { display: 'none', opacity: 1 };
    },

    render: function() {
      return (
        <span id='logo-upload'
              className='img-shadow js-dropzone-select'
              style={{cursor: 'pointer'}}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}>

          <img src={this.props.url}
              alt={this.props.alt}
              style={{opacity: this.state.opacity}}
              className='img-rounded'
              width='100%' />

          <span style={{
              display: this.state.display,
              position: 'absolute',
              'text-align': 'center',
              'margin-top': '-80px',
              width: '100%',
              'z-index': -1,
              'font-size': '12px',
              'font-weight': 'bold'
          }}>
            Drag and drop or click here
            <br />
            to change the logo
          </span>

        </span>
      );
    },

    componentDidMount: function() {
      var self = this;

      // TODO: Fix this godawful hack
      var _timeout,
          node = this.getDOMNode();

      $(node).bind('dragover', function(e) {
        // prevent jitters
        if (_timeout) {
          clearTimeout(_timeout);
        }

        self.setState({
          display: 'block',
          opacity: 0.5
        });
      });

      $(node).bind('dragleave', function(e) {
        _timeout = setTimeout(function() {
          self.setState({
            display: 'none',
            opacity: 1
          });
        });
      });
    },

    onMouseEnter: function(e) {
      this.setState({
        display: 'block',
        opacity: 0.5
      });
    },

    onMouseLeave: function(e) {
      this.setState({
        display: 'none',
        opacity: 1
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DragAndDrop;
  }

  window.DragAndDrop = DragAndDrop;
})();
