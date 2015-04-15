class ProductShallowSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :url, :wips_count, :partners_count, :total_visitors
  attributes :homepage_url, :coinprism_url, :flagged

  def flagged
    !object.flagged_at.nil?
  end

  def logo_url
    object.full_logo_url
  end

  def coinprism_url
    if object.coin_info
      object.coin_info.coinprism_url
    else
      "-1"
    end
  end

  def url
    product_path(object) rescue nil
  end

  cached

  def cache_key
    ['v2', object]
  end
end
