// TODO For webpack, requires font-awesome

var CustomIcons = [
  'app-coin',
  'chevron-up',
  'chevron-down',
  'document',
  'settings',
  'wallet',
  'logout',
  'field-guide'
]

var Icon = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired,
  },

  getDefaultProps: function() {
    return {
      verticalAlign: 0
    }
  },

  render: function() {
    var icon = this.props.icon;
    var cs = CustomIcons.indexOf(icon) > -1 ?
      React.addons.classSet('icon', 'icon-' + icon) :
      React.addons.classSet('fa', 'fa-' + icon);

    return <span className={cs} style={{verticalAlign: this.props.verticalAlign}} />;
  }
});

module.exports = window.Icon = Icon;
