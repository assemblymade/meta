var Button = require('../ui/button.js.jsx')

var TextInput = React.createClass({
  getInitialState: function() {
    return {value: null};
  },
  handleChange: function(e){
    // use e.target.value if doing something with value
    // this.setState({value: e.target.value});
    this.props.updateProductName(e.target.value);
  },
  render: function() {
    return (
      <div className="form-group">
        <label htmlFor="productName">1. Enter the name of your product</label>
        <input type="text" className="form-control" placeholder="Product name" onChange={this.handleChange} />
      </div>
    )
  }
});

var SwagType = React.createClass({
  getInitialState: function() {
    return {
      active: false,
      item: this.props.item,
      colwidth: this.props.colwidth};
    },
    componentWillReceiveProps: function(newProps) {
      this.setState({
        active: newProps.active
      });
    },
    handleClick: function() {
      this.props.respondToClick(this);
    },
    render: function() {
      var defaultImage = "https://treasure.assembly.com/assets/flag-36b9a010cd4cc717cc842a5add1a5f65.svg"
      var classes = (this.state.active ? "active " : '') + "thumbnail flair"

      return (
        <div className={this.state.colwidth ? ("col-md-" + this.state.colwidth) : null} onClick={this.handleClick}>
          <div className={classes}>
            <h5 className="gray-2 m1 center">{this.state.item.name}</h5>
            <hr className="mt0" />
            <div style={{ margin: this.state.item.margin || "15px 5px 0px",
              textAlign: "center",
              minHeight: this.state.item.minHeight}}>
              <img width={this.state.item.width || "40px"} src={this.state.item.imageURL || defaultImage} />
            </div>
          <div className="caption">
            <p className="h6">{this.state.item.desc}</p>
          </div>
        </div>
      </div>
    )

  }
});

var SwagTypeSelector = React.createClass({
  getInitialState: function() {
    return {
      itemRows: this.props.badges
    }
  },
  updateSelectedSwag: function(item) {
    this.setState({activeItem: item});
    this.props.updateSelectedSwag(item);
  },
  renderRow: function(itemRow) {
    var colwidth = 12/itemRow.length;
    var defaultImage = "https://treasure.assembly.com/assets/flag-36b9a010cd4cc717cc842a5add1a5f65.svg"

    var itemNodes = itemRow.map(function(item, i) {
      return (
        <SwagType item={item} colwidth={colwidth} key={i} active={item==this.state.activeItem} respondToClick={this.updateSelectedSwag.bind(this, item)}/>
      );
    }, this);

    return (
      <div>
        {itemNodes}
      </div>
    )
  },
  render: function() {
    var rows = this.state.itemRows.map(function(itemRow, i) {
      return (
        <div className="row" key={i}>
          {this.renderRow.bind(this, itemRow)()}
        </div>
      );
    }, this)

    return (
      <div>
        <div className="form-group">
          <label forHtml="swagTypes">2. Select a badge type</label>
        </div>
        {rows}
        <div className="row">
          <div className="col-sm-12">
            <div className="checkbox" style={{margin: "0px 10px 25px"}} onChange={this.props.toggleTransparency}>
              <label>
                <input type="checkbox"> Transparent background</input>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var CodeBox = React.createClass({
  getInitialState: function() {
    return {
      productName: "productName",
      productSlug: "product_slug",
      swag: {type: 'swag_type', imageURL: 'imageURL'},
      imageString: "YOUR_CONTENT_HERE",
      copyButtonText: "Copy Code"
    }
  },
  handleFocus: function(e) {
    e.target.select();
  },
  handleMouseUp: function(e) {
    e.preventDefault();
  },
  componentWillReceiveProps: function(newProps) {

    if (newProps.productName){
      this.setState({
        productName: newProps.productName,
        productSlug: this.slugifiedName(newProps.productName)
      });
    }

    if (newProps.swag) {
      this.setState({swag: newProps.swag, imageString: null})
    }

    this.setState({transparency: !!newProps.transparency})
  },
  componentDidMount() {
    var self = this;
    var client = new ZeroClipboard(this.refs.copyButton.getDOMNode());

    client.on('ready', function(event) {
      client.on('copy', function(event) {
        event.clipboardData.setData('text/plain', self.codeString());
      });

      client.on('aftercopy', function(event) {
        self.setState({
          copyButtonText: "Copied!"
        })

        setTimeout(function() {
          self.setState({
            copyButtonText: "Copy Code"
          })
        }, 1500);
      });
    });
  },
  slugifiedName: function(nameString) {
    return nameString.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
  },
  codeString: function() {
    var imageURL = this.state.transparency ? (this.state.swag.transparentImageURL || this.state.swag.imageURL) : this.state.swag.imageURL
    var imageString = this.state.imageString || "<img src='" +
    imageURL + "' width=" + this.state.swag.defaultWidth + " height=" + this.state.swag.defaultHeight + " />"
    var codeString = "<a href='https://assembly.com/" + this.state.productSlug + "?utm_campaign=assemblage&utm_source=" + this.state.productSlug + "&utm_medium=flair_widget&utm_content=" + this.state.swag.type + "'>" + imageString + "</a>"
    return codeString
  },
  render: function() {
    var codeString = this.codeString()
    return (
      <div>
        <div className="form-group">
          <label htmlFor="codeBox">3. Copy and paste your code snippet into your project</label>
          <textarea type="textarea" className="form-control flair" onFocusCapture={this.handleFocus} onMouseUpCapture={this.handleMouseUp} readOnly value={codeString} rows="4"></textarea>
        </div>
        <hr />
        <div className="right">
          <Button action={function(){}} type="primary" ref="copyButton">{this.state.copyButtonText}</Button>
        </div>
      </div>
    )
  }
});

var BadgePage = React.createClass({
  getInitialState: function() {
    return {productName: null};
  },
  handleInputTextUpdate: function(value) {
    this.setState({productName: value});
  },
  handleSwagSelection: function(swag) {
    this.setState({swag: swag})
  },
  toggleTransparency: function() {
    this.setState({transparency: !this.state.transparency})
  },
  render: function() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="panel panel-default">
              <div className="flair panel-header">
                <h4>Assembly Badges</h4>
              </div>
              <hr className="mt2" />
              <div className="flair panel-body">
                <TextInput updateProductName={this.handleInputTextUpdate} />
                <SwagTypeSelector badges={this.props.badges} updateSelectedSwag={this.handleSwagSelection} toggleTransparency={this.toggleTransparency}/>
                <hr className="mt0" />
                <CodeBox productName={this.state.productName} swag={this.state.swag} transparency={this.state.transparency} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

window.BadgePage = module.exports = BadgePage
