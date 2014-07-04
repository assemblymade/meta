/** @jsx React.DOM */

//= require dispatcher
//= require dropzone

var DragAndDrop = React.createClass({
  getInitialState: function() {
    return { display: 'none', opacity: 1 };
  },

  componentDidMount: function() {
    this.dropzone = new Dropzone('#logo-upload', { url: this.props.assetsPath });
  },

  render: function() {
    return (
      <span id='logo-upload'
            className='img-shadow'
            style={{'margin-bottom': '36px;'}}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}>
        <form action={this.props.uploadUrl} enctype='multipart/form-data' className='assets-drop-form' method='post'>
          <input name='authenticity_token' value={this.props.csrfToken} type='hidden' />
          <input id='asset_attachment_id' name='asset[attachment_id]' type='hidden' />
          <input id='asset_name' name='asset[name]' type='hidden' />
        </form>

        <img src={this.props.url}
             alt={this.props.alt}
             style={{opacity: this.state.opacity}}
             className='img-rounded' width='100%' />

        <span style={{
            display: this.state.display,
            position: 'absolute',
            'text-align': 'center',
            width: '100%',
            'z-index': 1000,
            top: '40%',
            'font-size': '12px'
        }}>
          Drag and drop your logo here
        </span>

        <form action={this.props.uploadUrl} method='post'>
          <input name='authenticity_token' value={this.props.csrfToken} type='hidden' />
          <input type='file'
                  name='asset[name]'
                  className='input-sm btn-block'
                  style={{
                    display: this.state.display,
                    'z-index': 1000,
                    position: 'absolute',
                    bottom: '0'
                  }}
                  onChange={this.onInputChange} />
        </form>
      </span>
    );
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
  },

  onInputChange: function(e) {
    e.currentTarget.form.submit();
  }
});
