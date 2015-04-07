class MakeBountiesValueNotNull < ActiveRecord::Migration
  def change
    Task.where(value: nil).order(created_at: :desc).each do |t|
      coins = calculate_current_value(t)
      offers = Offer.where(bounty: t)
      puts [t.created_at.iso8601,
        Rails.application.routes.url_helpers.product_task_path(*t.url_params).ljust(60),
        t.title.truncate(40).ljust(50), coins.to_s.rjust(6), offers.count].join(' ')
      t.update! value: coins
    end
  end

  def calculate_current_value(bounty)
    offers = Offer.where(bounty: bounty)

    # 1. reject invalid (old) offers

    latest_offers = {}
    offers.each do |offer|
      last_offer = latest_offers[offer.user]
      if last_offer.nil? || last_offer.created_at < offer.created_at
        latest_offers[offer.user] = offer
      end
    end

    offers = latest_offers.values

    # 2. figure out people's current ownership

    partners = offers.map {|o| Partner.new(o.product, o.user) }
    ownership = partners.each_with_object({}) do |partner, o|
      o[partner.wallet] = [0.0001, partner.ownership].max
    end

    # 3. figure out weighted average

    return 0 if offers.empty?

    sum = 0
    weight_sum = 0

    offers.each do |offer|
      sum += offer.amount * ownership[offer.user]
      weight_sum += ownership[offer.user]
    end

    if weight_sum > 0
      (sum / weight_sum).round
    else
      0
    end
  end
end
