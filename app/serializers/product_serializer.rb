class ProductSerializer < ApplicationSerializer

  attributes :url, :wips_url, :people_url
  attributes :name, :pitch, :slug, :quality, :average_bounty, :logo_url, :can_update, :try_url, :wips_count, :partners_count

  def wips_url
    product_wips_path(object)
  end

  def people_url
    product_people_path(object)
  end

  def url
    product_path(object)
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

  def current_user
    scope
  end
end
