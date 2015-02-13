var Lightbox = React.createClass({
  propTypes: {
    footer: React.PropTypes.oneOf([
      React.PropTypes.string,
      React.PropTypes.element
    ]),
    id: React.PropTypes.string,
    onHidden: React.PropTypes.func,
    showControlledOuside: React.PropTypes.bool,
    size: React.PropTypes.string,
    title: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ])
  },

  getDefaultProps: function() {
    return {
      id: 'modal',
      onHidden: function() {
        console.warn("No `onHidden()` property supplied to Lightbox");
      },
      showControlledOuside: false,
      size: ''
    }
  },

  componentDidMount: function() {
    if (this.props.showControlledOuside) {
      var modal = $(this.getDOMNode()).modal({ show: true })
      modal.on('hidden.bs.modal', this.props.onHidden)
    }
  },

  componentWillUnmount: function() {
    var modal = $(this.getDOMNode()).modal({ show: false });
    modal.off('hidden.bs.modal', this.props.onHidden);
  },

  render: function() {
    return (
      <div className="modal fade" id={this.props.id} role="dialog" tabIndex="-1" aria-labelledby={this.props.title || "lightbox"} aria-hidden="true">
        <div className={"modal-dialog " + this.props.size}>
          <div className="modal-content" style={{ overflow: 'visible' }}>
            {this.header()}
            {this.props.children}
          </div>
          {this.footer()}
        </div>
      </div>
    );
  },

  header: function() {
    if (this.props.title) {
      return <div className="px3 py2 clearfix">
        <a className="close" data-dismiss="modal">
          <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
        </a>
        <h4 className="mt0 mb0" id={this.props.title}>{this.props.title}</h4>
      </div>
    }
  },

  footer: function() {
    if (this.props.footer) {
      return <div className="p3 border-top">
        {this.props.footer}
      </div>
    }
  }
})

module.exports = window.Lightbox = Lightbox;
