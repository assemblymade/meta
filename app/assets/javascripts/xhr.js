window.xhr = function(method, path, data) {
  var request = new XMLHttpRequest();

  request.open(method, path, true);
  request.setRequestHeader('X-CSRF-Token', document.getElementsByName('csrf-token')[0].content);
  request.send(data);
};
