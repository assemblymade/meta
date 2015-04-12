var Dispatcher = require('../dispatcher');

var DragAndDrop = React.createClass({
  getInitialState: function() {
    return { display: 'none', opacity: 1 };
  },

  render: function() {
    return (
      <span id='logo-upload'
            className='border js-dropzone-select'
            style={{cursor: 'pointer'}}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}>

        <img src={this.props.url}
            alt={this.props.alt}
            style={{opacity: this.state.opacity}}
            className='rounded'
            width='100%' />

        <span style={{
            display: this.state.display,
            position: 'absolute',
            textAlign: 'center',
            marginTop: '-80px',
            width: '100%',
            zIndex: -1,
            fontSize: '12px',
            fontWeight: 'bold'
        }}>
          Drag and drop or click here
          <br />
          to change the logo
        </span>

        <div className="progress" style={{
          display: 'none',
          width: '200px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-12px',
          marginLeft: '-100px'
        }}>
          <div className="progress-bar" role="progressbar" style={{ width: '0%' }}>
          </div>
        </div>

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

module.exports = window.DragAndDrop = DragAndDrop;
