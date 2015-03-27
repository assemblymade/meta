// This is a generated file, to regen run:
// rake js:routes

var exports = module.exports = {};
exports.start_idea_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/start?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/start'
  } else {
    var params = options;
    return '/start'
  }
}

exports.discover_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/discover?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/discover'
  } else {
    var params = options;
    return '/discover'
  }
}

exports.idea_mark_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/ideas/' + params.idea_id + '/mark?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/ideas/' + params.idea_id + '/mark'
  } else {
    var params = options;
    return '/ideas/' + params.idea_id + '/mark'
  }
}

exports.ideas_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/ideas?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/ideas'
  } else {
    var params = options;
    return '/ideas'
  }
}

exports.new_idea_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/ideas/new?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/ideas/new'
  } else {
    var params = options;
    return '/ideas/new'
  }
}

exports.idea_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/ideas/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/ideas/' + params.id + ''
  } else {
    var params = options;
    return '/ideas/' + params.id + ''
  }
}

exports.new_user_session_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/login?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/login'
  } else {
    var params = options;
    return '/login'
  }
}

exports.awarded_bounties_user_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/users/' + params.id + '/awarded_bounties?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/users/' + params.id + '/awarded_bounties'
  } else {
    var params = options;
    return '/users/' + params.id + '/awarded_bounties'
  }
}

exports.heart_stories_user_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/users/' + params.id + '/heart_stories?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/users/' + params.id + '/heart_stories'
  } else {
    var params = options;
    return '/users/' + params.id + '/heart_stories'
  }
}

exports.user_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/users/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/users/' + params.id + ''
  } else {
    var params = options;
    return '/users/' + params.id + ''
  }
}

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

exports.heartables_lovers_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/heartables/' + params.heartable_id + '/lovers?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/heartables/' + params.heartable_id + '/lovers'
  } else {
    var params = options;
    return '/heartables/' + params.heartable_id + '/lovers'
  }
}

exports.news_feed_item_update_task_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/news_feed_items/' + params.news_feed_item_id + '/update_task?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/news_feed_items/' + params.news_feed_item_id + '/update_task'
  } else {
    var params = options;
    return '/news_feed_items/' + params.news_feed_item_id + '/update_task'
  }
}

exports.discussion_comments_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/discussions/' + params.discussion_id + '/comments?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/discussions/' + params.discussion_id + '/comments'
  } else {
    var params = options;
    return '/discussions/' + params.discussion_id + '/comments'
  }
}

exports.discussion_comment_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/discussions/' + params.discussion_id + '/comments/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/discussions/' + params.discussion_id + '/comments/' + params.id + ''
  } else {
    var params = options;
    return '/discussions/' + params.discussion_id + '/comments/' + params.id + ''
  }
}

exports.product_activity_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/activity?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/activity'
  } else {
    var params = options;
    return '/' + params.product_id + '/activity'
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

exports.product_people_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/people?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/people'
  } else {
    var params = options;
    return '/' + params.product_id + '/people'
  }
}

exports.product_assets_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/assets?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/assets'
  } else {
    var params = options;
    return '/' + params.product_id + '/assets'
  }
}

exports.new_product_asset_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/assets/new?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/assets/new'
  } else {
    var params = options;
    return '/' + params.product_id + '/assets/new'
  }
}

exports.product_screenshots_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/screenshots?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/screenshots'
  } else {
    var params = options;
    return '/' + params.product_id + '/screenshots'
  }
}

exports.product_person_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/people/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/people/' + params.id + ''
  } else {
    var params = options;
    return '/' + params.product_id + '/people/' + params.id + ''
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

exports.product_update_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/updates/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/updates/' + params.id + ''
  } else {
    var params = options;
    return '/' + params.product_id + '/updates/' + params.id + ''
  }
}

exports.product_repos_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/repositories?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/repositories'
  } else {
    var params = options;
    return '/' + params.product_id + '/repositories'
  }
}

exports.product_wip_assign_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/assign?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/assign'
  } else {
    var params = options;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/assign'
  }
}

exports.award_product_wip_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.id + '/award?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.id + '/award'
  } else {
    var params = options;
    return '/' + params.product_id + '/bounties/' + params.id + '/award'
  }
}

exports.product_wip_close_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/close?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/close'
  } else {
    var params = options;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/close'
  }
}

exports.product_wip_reopen_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/reopen?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/reopen'
  } else {
    var params = options;
    return '/' + params.product_id + '/bounties/' + params.wip_id + '/reopen'
  }
}

exports.product_wips_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/bounties?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/bounties'
  } else {
    var params = options;
    return '/' + params.product_id + '/bounties'
  }
}

exports.new_product_wip_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/bounties/new?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/bounties/new'
  } else {
    var params = options;
    return '/' + params.product_id + '/bounties/new'
  }
}

exports.product_tips_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/tips?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/tips'
  } else {
    var params = options;
    return '/' + params.product_id + '/tips'
  }
}

exports.daily_product_metrics_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/metrics/daily?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/metrics/daily'
  } else {
    var params = options;
    return '/' + params.product_id + '/metrics/daily'
  }
}

exports.weekly_product_metrics_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/metrics/weekly?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/metrics/weekly'
  } else {
    var params = options;
    return '/' + params.product_id + '/metrics/weekly'
  }
}

exports.snippet_product_metrics_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/metrics/snippet?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/metrics/snippet'
  } else {
    var params = options;
    return '/' + params.product_id + '/metrics/snippet'
  }
}

exports.product_metrics_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/metrics?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/metrics'
  } else {
    var params = options;
    return '/' + params.product_id + '/metrics'
  }
}

exports.product_posts_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/posts?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/posts'
  } else {
    var params = options;
    return '/' + params.product_id + '/posts'
  }
}

exports.new_product_post_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/posts/new?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/posts/new'
  } else {
    var params = options;
    return '/' + params.product_id + '/posts/new'
  }
}

exports.product_post_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/posts/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/posts/' + params.id + ''
  } else {
    var params = options;
    return '/' + params.product_id + '/posts/' + params.id + ''
  }
}

exports.product_financials_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/financials?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/financials'
  } else {
    var params = options;
    return '/' + params.product_id + '/financials'
  }
}

exports.product_chat_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.product_id + '/chat?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.product_id + '/chat'
  } else {
    var params = options;
    return '/' + params.product_id + '/chat'
  }
}

exports.edit_product_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.id + '/edit?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.id + '/edit'
  } else {
    var params = options;
    return '/' + params.id + '/edit'
  }
}

exports.product_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '/' + params.id + '?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '/' + params.id + ''
  } else {
    var params = options;
    return '/' + params.id + ''
  }
}

