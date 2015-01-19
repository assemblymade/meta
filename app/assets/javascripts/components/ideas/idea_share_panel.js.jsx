var CircleIcon = require('../ui/circle_icon.js.jsx');

var IdeaSharePanel = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      url: React.PropTypes.string.isRequired
    }).isRequired,

    message: React.PropTypes.string
  },

  componentDidMount() {
    var self = this
    var client = new ZeroClipboard(this.refs.copy.getDOMNode())
    client.on('ready', function(event) {
      client.on('copy', function(event) {
        event.clipboardData.setData('text/plain', self.props.idea.url)
      });

      client.on('aftercopy', function(event) {
        self.setState({
          copyIcon: 'check'
        });

        setTimeout(function() {
          self.setState({
            copyIcon: 'link'
          });
        }, 1500);
      });
    });
  },

  getDefaultProps() {
    return {
      message: 'Check out this idea on @asm:'
    };
  },

  getInitialState() {
    return {
      copyIcon: 'link'
    };
  },

  handleCopyClick(e) {
    e.preventDefault();
    // the listeners for this event get attached in componentDidMount()
  },

  handleFacebookClick(e) {
    e.preventDefault();

    FB.ui({
      method: 'share',
      display: 'popup',
      href: this.props.idea.url,
    }, function(response){});
  },

  handleGooglePlusClick(e) {
    e.preventDefault();

    window.open(
      _googlePlusUrl(this.props.idea.url),
      'googlepluswindow',
        'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    );
  },

  handleTwitterClick(e) {
    e.preventDefault();

    window.open(
      _twitterUrl(this.props.idea.url, this.props.message),
      'twitterwindow',
      'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    );
  },

  render() {
    return (
      <div className="clearfix bg-gray-6 text-center">
        <a href="javascript:void(0);" onClick={this.handleTwitterClick}>
          <CircleIcon icon="twitter" />
        </a>

        <a href="javascript:void(0);" onClick={this.handleFacebookClick}>
          <CircleIcon icon="facebook" />
        </a>

        <a href="javascript:void(0);" onClick={this.handleGooglePlusClick}>
          <CircleIcon icon="google-plus" />
        </a>

        <a href="javascript:void(0);" onClick={this.handleCopyClick} ref="copy">
          <CircleIcon icon={this.state.copyIcon} />
        </a>
      </div>
    );
  }
});

module.exports = IdeaSharePanel;

function _googlePlusUrl(url) {
  return 'https://plus.google.com/share?url=' +
    url +
    'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=450,width=550';
}

function _twitterUrl(url, message) {
  return 'http://twitter.com/share?url=' +
    url +
    '&text=' +
    message +
    '&';
}
