// This is a generated file, to regen run:
// rake js:routes

var exports = module.exports = {};
exports.notifications_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/notifications?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/notifications'
  } else {
    var params = options;
    return '/notifications'
  }
}

exports.readraptor_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/user/tracking/' + params.article_id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/user/tracking/' + params.article_id + ''
  } else {
    var params = options;
    return '/user/tracking/' + params.article_id + ''
  }
}

exports.product_follow_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/follow?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/follow'
  } else {
    var params = options;
    return '/' + params.product_id + '/follow'
  }
}

exports.product_unfollow_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/unfollow?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/unfollow'
  } else {
    var params = options;
    return '/' + params.product_id + '/unfollow'
  }
}

exports.product_update_subscribe_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/updates/' + params.update_id + '/subscribe?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/updates/' + params.update_id + '/subscribe'
  } else {
    var params = options;
    return '/' + params.product_id + '/updates/' + params.update_id + '/subscribe'
  }
}

exports.product_update_unsubscribe_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/updates/' + params.update_id + '/unsubscribe?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/updates/' + params.update_id + '/unsubscribe'
  } else {
    var params = options;
    return '/' + params.product_id + '/updates/' + params.update_id + '/unsubscribe'
  }
}

