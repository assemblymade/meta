class FinancialsController < ProductController
  before_action :find_product!

  def index
    @reports = ProfitReport.where(product: @product).order(end_at: :desc)
    data = Finance.new.revenue_reports(@product)
    @moneystream =  data
  end

  def transactions
    @awards = Award.where(wip_id: @product.tasks.pluck(&:id)).
                    where.not(cents: nil).
                    order(created_at: :desc)

    awards_hash = Hash.new(0)

    @awards.each do |a|
      awards_hash[a.created_at.strftime('%Y-%m-%d')] += a.cents
    end

    awards = ["Awards"] + awards_hash.values
    dates = ['Dates'] + awards_hash.keys.uniq
    @data = [awards, dates]

    @awards = Kaminari.paginate_array(@awards).page(params[:page])
  end
end
