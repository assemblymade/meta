class WipDecorator < ApplicationDecorator
  decorates_association :watchers

  def read?(user)
    false
    # user && !updates.for(user).unread?
  end

  def formatted_number
    "##{number}"
  end

  def formatted_comments_count
    helpers.pluralize(comments_count, 'comment')
  end

  def new_comments(user)
    return 0 if user.nil?
    wip.updates.for(user).unread_comment_count || 0
  end

  def formatted_watchers_count
    helpers.pluralize(watchings_count, 'watcher')
  end

  def votable?
    false
  end
end
