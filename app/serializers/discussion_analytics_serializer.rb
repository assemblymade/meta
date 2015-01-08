class DiscussionAnalyticsSerializer < ProductAnalyticsSerializer
  attributes :discussion_type

  def discussion_type
    object.target.class.name.underscore
  end

  # private

  def product
    @product ||= object.product
  end
end
