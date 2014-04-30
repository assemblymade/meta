class VoteSerializer < ActiveModel::Serializer
  attributes :count

  def count
    object.voteable.votes.count
  end
end
