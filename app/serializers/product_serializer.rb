class ProductSerializer < ApplicationSerializer
  include MarkdownHelper

  # FIXME: (pletcher) The ProductSerializer has too many attributes;
  # it'd be great (I think) to serialize only the base attributes
  # here and to use other serializers for lazily fetching the attributes
  # that specific pages need (we'd cache the results).
  attributes :url, :wips_url, :people_url, :is_member, :subsections
  attributes :name, :pitch, :slug, :quality, :average_bounty, :logo_url, :total_visitors
  attributes :can_update, :try_url, :wips_count, :partners_count, :lead
  attributes :top_marks, :homepage_url, :screenshots, :description, :description_html, :labels
  attributes :bounty_valuation_steps, :coins_minted, :profit_last_month, :state, :greenlit_at
  attributes :trust, :video_id

  has_many :most_active_contributors, serializer: UserSerializer

  has_many :core_team, serializer: AvatarSerializer

  def bounty_valuation_steps
    BountyGuidance::Valuations.suggestions(object)
  end

  def description_html
    product_markdown(object, description)
  end

  def lead
    product_markdown(object, object.lead)
  end

  def logo_url
    object.full_logo_url
  end

  def video_id
    return "" unless url = object.you_tube_video_url
    if url[/youtu\.be\/([^\?]*)/]
      $1
    elsif url[/vimeo.com\/(\d+)/]
      $1
    else
      # From
      # http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url/4811367#4811367
      url[/^.*((v\/)|(embed\/)|(watch\?))\??v?=?([^\&\?]*).*/]
      $5
    end
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

  def trust
    fields = [:domain, :ip, :hosting, :finances, :mobile]
    fields.each_with_object({}) do |field, obj|
      obj[field] = object.send("trust_#{field}_at").present?
    end
  end

end
