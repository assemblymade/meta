const UserStore = require('../../stores/user_store')

module.exports = React.createClass({
  displayName: 'ApiSettings',

  render() {
    let user = UserStore.getUser()
    return <div>
      <h4>Getting started</h4>
      <p>Your token to access the Assembly API: <code>{this.props.authentication_token}</code></p>
      <p>An example using curl:</p>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: this.exampleCode() }}></code>
      </pre>
      <p>API docs coming soon</p>
    </div>
  },

  exampleCode() {
    return [
      `curl -i -H &quot;Authorization: Token token=${this.props.authentication_token}&quot; \\`,
      "           http://api.assembly.com/user"
    ].join("\n")
  }
})
