var DraggingMixin = {
  componentDidMount() {
    // based on Ben Alpert's (@spicyj) work at
    // https://github.com/Khan/react-components/blob/master/js/window-drag.jsx

    // `this._dragCollection` looks weird, but there's a bug in React that
    // causes 'dragenter' to fire twice. By keeping track of elements where the
    // event has fired (instead of the event itself -- see l. 60), we can
    // correctly determine drag behavior.
    this._dragCollection = [];

    window.addEventListener("dragenter", this.onDragEnter);
    window.addEventListener("dragleave", this.onDragLeave);
    window.addEventListener("drop",      this.onDragLeave);

    var domNode = this.getDOMNode();

    domNode.addEventListener('dragenter', this.onDragEnter, false);
    domNode.addEventListener('dragleave', this.onDragLeave, false);
    domNode.addEventListener('drop', this.onDragLeave, false);
  },

  componentWillUnmount() {
    window.removeEventListener("dragenter", this.onDragEnter);
    window.removeEventListener("dragleave", this.onDragLeave);
    window.removeEventListener("drop",      this.onDragLeave);

    var domNode = this.getDOMNode();

    domNode.removeEventListener('dragenter', this.onDragEnter, false);
    domNode.removeEventListener('dragleave', this.onDragLeave, false);
    domNode.removeEventListener('drop', this.onDragLeave, false);
  },

  onDragEnter(e) {
    if (this._dragCollection.length === 0) {
      this.setState({
        dragging: true
      });
    }

    this._dragCollection = _(this._dragCollection).union([e.target]);
  },

  onDragLeave(e) {
    this._dragCollection = _(this._dragCollection).without(e.target);

    if (this._dragCollection.length === 0) {
      this.setState({
        dragging: false
      });
    }
  }
};

module.exports = DraggingMixin;
