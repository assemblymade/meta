class ProductSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :url, :wips_url, :people_url, :is_member, :subsections
  attributes :name, :pitch, :slug, :quality, :average_bounty, :logo_url, :total_visitors
  attributes :can_update, :try_url, :wips_count, :partners_count, :lead
  attributes :top_marks, :homepage_url, :screenshots, :description, :description_html, :labels

  has_many :most_active_contributors, serializer: UserSerializer

  has_many :core_team, serializer: AvatarSerializer

  def description_html
    product_markdown(object, description)
  end

  def lead
    product_markdown(object, object.lead)
  end

  def logo_url
    object.full_logo_url
  end

  def wips_url
    product_wips_path(object)
  end

  def people_url
    product_people_path(object)
  end

  def url
    product_path(object)
  end

  def full_url
    product_url(object)
  end

  def wips_count
    object.wips.count
  end

  def partners_count
    object.partners.count
  end

  def can_update
    Ability.new(current_user).can?(:update, object)
  end

  def is_member
    object.team_memberships.where(user_id: current_user.try(:id)).any?
  end

  def current_user
    scope
  end

  def top_marks
    object.marks.limit(4).map(&:name)
  end

  def labels
    l = Set.new(object.tags)
    l.merge(object.marks.limit(4).map(&:name))
    l
  end
end
