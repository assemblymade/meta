'use strict';

// TODO For webpack, requires font-awesome

const CustomIcons = [
  'app-coin',
  'chevron-up',
  'chevron-down',
  'document',
  'settings',
  'wallet',
  'logout',
  'field-guide'
];

const Icon = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    fw:   React.PropTypes.bool.isRequired
  },

  getDefaultProps: function() {
    return {
      verticalAlign: 0,
      fw: false
    }
  },

  render: function() {
    let cs
    const icon = this.props.icon

    if (CustomIcons.indexOf(icon) > -1) {
      cs = React.addons.classSet('icon', 'icon-' + icon)
    } else {
      cs = React.addons.classSet('fa', `fa-${icon}`,
         React.addons.classSet({
          'fa-fw': this.props.fw
        })
      )
    }

    return <span className={cs} style={{verticalAlign: this.props.verticalAlign}} />;
  }
});

module.exports = window.Icon = Icon;
