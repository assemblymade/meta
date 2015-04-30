var AdminWithholding = React.createClass({
  render() {
    return (
      <a className="btn btn-warning" onClick={this.handleClick}>
        Adjust withholding
      </a>
    )
  },

  handleClick() {
    var amount = prompt('New withholding amount', this.props.amount_withheld / 100)
    if (amount) {
      $.ajax({
        type: "PATCH",
        url: `/admin/withdrawals/${this.props.id}`,
        dataType: 'json',
        data: {
          amount_withheld: amount
        },
        success: this.amountUpdated
      })
    }
  },

  amountUpdated() {
    window.location.reload()
    return true
  }
})

module.exports = window.AdminWithholding = AdminWithholding
