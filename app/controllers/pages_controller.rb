class PagesController < ApplicationController

  def sabbaticals
  end

  def core_team
  end

  def tos
  end

  def home
    @feature_products = %w(
      helpful
      family-table
      buckets
      really-good-emails
    ).map{|slug| Product.find_by!(slug: slug)}.
      map{|product| ProductContributions.new(product) }
  end

  def home2
    @feature_products = %w(
      helpful
      family-table
      buckets
      really-good-emails
    ).map{|slug| Product.find_by!(slug: slug)}.
      map{|product| ProductContributions.new(product) }
  end

end
