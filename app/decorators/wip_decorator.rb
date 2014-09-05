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
end
