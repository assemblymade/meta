/** @jsx React.DOM */

var Popover = require('./popover.js.jsx');

(function() {
  var Share = React.createClass({
    getInitialState: function() {
      return { modal: false };
    },

    render: function() {
      return (
        <div>
          <a href="#" className="btn btn-primary btn-sm" style={{'vertical-align': 'bottom'}} onClick={this.toggleModal}>
            <i className="icon icon-share-alt" style={{"margin-right": 2}}></i>
            Share
          </a>
          {this.state.modal ? this.popover() : null}
        </div>
      )
    },

    toggleModal: function() {
      this.setState({modal: !this.state.modal})
    },

    popover: function() {
      return (
        <Popover placement="bottom" positionLeft={440} positionTop={30} title={this.props.title}>
          <ul className='list list-unstyled'>
            <li style={{"margin-bottom": 10}}>
              <div className='row'>
                <div className='col-md-6'>
                  <a className='btn btn-twitter btn-block' onClick={this.handleTwitterClick}>
                    <i className='icon icon-twitter' style={{'margin-right': 2}}></i>
                    Twitter
                  </a>
                </div>
                <div className='col-md-6'>
                  <a className='btn btn-facebook btn-block' href='#' onClick={this.handleFacebookClick}>
                    <i className='icon icon-facebook' style={{'margin-right': 2}}></i>
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
      )
    },

    handleTwitterClick: function() {
      window.open('http://twitter.com/share?url=' + this.props.url + '&text=' + this.props.shareText + '&', 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
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
          <input ref='text' type='text' className='form-control' id='share-url' value={this.props.url} />
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
      })
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Share;
  }

  window.Share = Share;
})();
