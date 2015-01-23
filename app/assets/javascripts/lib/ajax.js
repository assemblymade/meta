var ajax = {
  get: function(url, data, success, error) {
    $.ajax({
      url: url,
      type: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      dataType: 'json',
      data: data,
      success: success,
      error: error
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = ajax;
}
