module AdminHelper

  def controller_active?(name)
    controller_name == name.to_s
  end

  %w(profit_reports product_rankings staff_picks newsletters users withdrawals bounties leaderboard).each do |controller|
    define_method "#{controller}_controller?" do
      controller_name == controller
    end
  end

end
