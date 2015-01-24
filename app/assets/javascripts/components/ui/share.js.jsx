var Popover = require('../popover.js.jsx');
var SvgIcon = require('./svg_icon.js.jsx');

var Share = React.createClass({
  propTypes: {
    shareText: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      modal: false
    };
  },

  render: function() {
    return (
      <div>
        <a href="javascript:void(0);" onClick={this.toggleModal}>
          <SvgIcon type="share" />
        </a>
        {this.state.modal ? this.popover() : null}
      </div>
    )
  },

  toggleModal: function() {
    this.setState({
      modal: !this.state.modal
    })
  },

  popover: function() {
    return (
      <Popover placement="top" positionTop={60} title={this.props.title} onClick={this.toggleModal}>
        <ul className='list list-reset'>
          <li style={{ marginBottom: 10 }}>
            <div className='row'>
              <div className='col-md-6'>
                <a className='btn btn-twitter btn-block' onClick={this.handleTwitterClick}>
                  <i className='icon icon-twitter' style={{ marginRight: 2 }}></i>
                  Twitter
                </a>
              </div>
              <div className='col-md-6'>
                <a className='btn btn-facebook btn-block' href='#' onClick={this.handleFacebookClick}>
                  <i className='icon icon-facebook' style={{ marginRight: 2 }}></i>
                  Facebook
                </a>
              </div>
            </div>
          </li>
          <li>
            <CopyLink url={this.props.url} />
          </li>
        </ul>
      </Popover>
    );
  },

  handleTwitterClick: function() {
    window.open(
      'http://twitter.com/share?url=' +
        this.props.url +
        '&text=' +
        this.props.shareText +
        '&',
      'twitterwindow',
      'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    );
  },

  handleFacebookClick: function() {
    FB.ui({
      method: 'share',
      href: this.props.url,
    }, function(response){});
  }
});

var CopyLink = React.createClass({
  getInitialState: function() {
    return { label: 'Copy' }
  },

  render: function() {
    return (
      <div className='input-group'>
        <input ref='text'
            type='text'
            className='form-control'
            id='share-url'
            value={this.props.url}
            onChange={function() {/** noop **/}} />
        <span className='input-group-btn'>
          <button ref="copy" className='btn btn-default' type='button'>{this.state.label}</button>
        </span>
      </div>
    )
  },

  componentDidMount: function() {
    var self = this
    var client = new ZeroClipboard(this.refs.copy.getDOMNode())
    client.on('ready', function(event) {
      client.on('copy', function(event) {
        event.clipboardData.setData('text/plain', self.props.url)
      });

      client.on('aftercopy', function(event) {
        self.setState({label: 'Copied!'})
        setTimeout(function() {
          self.setState({label: 'Copy'})
        }, 1000)
      });
    });
  }
});

module.exports = window.Share = Share;
