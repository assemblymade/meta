module AdminHelper

  def controller_active?(name)
    controller_name == name.to_s
  end

  %w(profit_reports staff_picks newsletters users withdrawals).each do |controller|
    define_method "#{controller}_controller?" do
      controller_name == controller
    end
  end

end
