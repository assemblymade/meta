class DiscoverController < ApplicationController

  def staff_picks
    @week = Date.today
    slugs = (ENV['STAFF_PICKS'] || '').split(',')
    staff_picks = Product.where(slug: slugs).sort_by{|p| slugs.index(p.slug)}
    @products = (staff_picks + Showcase.this_weeks_products).uniq.take(10)
  end

  def trending
    @products = Product.public_products
                       .joins(:product_trend)
                       .where('watchings_count >= ?', 10)
                       .order('product_trends.score desc')
                       .page(params[:page])
  end

  def no_commits
    @products = Product.public_products
                       .repos_gt(0)
                       .where(commit_count: 0)
                       .order(watchings_count: :desc)
                       .page(params[:page])
  end

  def recently_launched
    @products = Product.public_products
                       .launched
                       .order(launched_at: :desc)
                       .page(params[:page])
  end

  def tech
    @tech = Search::TechFilter.find(params[:tech])
    if signed_in?
      @saved_search = current_user.saved_searches.find_by(query: "tag:#{params[:tech]}")
    end
    @products = Product.public_products
                       .where('watchings_count >= ?', 5)
                       .tagged_with_any(@tech.tags)
                       .order(watchings_count: :desc)
                       .page(params[:page])

    @needing_commit = Product.public_products
                       .repos_gt(0)
                       .where('watchings_count >= ?', 3)
                       .where(commit_count: 0)
                       .order("Random()")
                       .limit(2)
  end
end
