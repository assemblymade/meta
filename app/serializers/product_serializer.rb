class ProductSerializer < ApplicationSerializer

  attributes :url, :wips_url, :people_url
  attributes :name, :pitch, :slug, :quality, :average_bounty, :logo_url, :can_update

  def wips_url
    product_wips_path(object)
  end

  def people_url
    product_people_path(object)
  end

  def url
    product_path(object)
  end

  def can_update
    Ability.new(current_user).can?(:update, object)
  end

  def current_user
    scope
  end
end
