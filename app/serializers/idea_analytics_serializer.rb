# should use the DiscussionAnalyticsSerializer once Ideas have a NFI

class IdeaAnalyticsSerializer < ApplicationSerializer
  attributes :discussion_type

  def discussion_type
    'idea'
  end

end
