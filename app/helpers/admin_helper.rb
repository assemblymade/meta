module AdminHelper

  %w(profit_reports staff_picks newsletters users withdrawals).each do |controller|
    define_method "#{controller}_controller?" do
      controller_name == controller
    end
  end

end
