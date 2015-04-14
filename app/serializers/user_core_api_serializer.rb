class UserCoreApiSerializer < ActiveModel::Serializer
  attributes :core_team_memberships

  def core_team_memberships
    p = object.core_on.map{|a| ProductShallowSerializer.new(a) }
  end

end
