var url = require('url')
module.exports = {
  url(path) {
    return url.resolve(
      document.getElementsByName('assets-url')[0].content,
      path
    )
  }
}
