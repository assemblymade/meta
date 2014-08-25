module AdminHelper

  %w(profit_reports product_rankings newsletters users withdrawals).each do |controller|
    define_method "#{controller}_controller?" do
      controller_name == controller
    end
  end

end
