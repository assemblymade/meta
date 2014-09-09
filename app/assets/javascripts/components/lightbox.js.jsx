/** @jsx React.DOM */

(function() {
  var Lightbox = React.createClass({
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

              <div className="modal-header">
                <a className="close" data-dismiss="modal">
                  <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
                </a>
                {this.title()}
              </div>

              {this.props.children}
            </div>
          </div>
        </div>
      );
    },

    title: function() {
      if (this.props.title) {
        return <h4 className="modal-title" id={this.props.title}>{this.props.title}</h4>
      }

      return null;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Lightbox;
  }

  window.Lightbox = Lightbox;
})();
