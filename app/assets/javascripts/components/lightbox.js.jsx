/** @jsx React.DOM */

(function() {
  var Lightbox = React.createClass({
    propTypes: {
      title: React.PropTypes.any
    },

    getDefaultProps: function() {
      return {
        size: ''
      }
    },

    render: function() {
      return (
        <div className="modal fade" id={this.props.id} role="dialog" tabIndex="-1" aria-labelledby={this.props.title || "lightbox"} aria-hidden="true">
          <div className={"modal-dialog " + this.props.size}>
            <div className="modal-content">

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
      return null
    },

    footer: function() {
      if (this.props.footer) {
        return <div className="p3 border-top">
          {this.props.footer}
        </div>
      }
      return null
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Lightbox;
  }

  window.Lightbox = Lightbox;
})();
