class DiscoverController < ApplicationController

  def staff_picks
    @week = Date.today
    @products = Showcase.this_weeks_products
  end

  def trending
    @products = Product.public_products
                       .where('votes_count >= ?', 10)
                       .order(updated_at: :desc)
                       .order(votes_count: :desc)
                       .limit(10)
  end

  def most_wanted
    @products = Product.public_products
                       .where('votes_count >= ?', 5)
                       .order(votes_count: :desc)
                       .page(params[:page])
  end

  def tech
    @tech = TechFilter.find(params[:tech])
    if signed_in?
      @saved_search = current_user.saved_searches.find_by(query: "tag:#{params[:tech]}")
    end
    @products = Product.public_products
                       .where('votes_count >= ?', 10)
                       .tagged_with_any(@tech.tags)
                       .order(votes_count: :desc)
                       .page(params[:page])
  end

  protected

  def upgrade_stylesheet?
    true
  end

end
