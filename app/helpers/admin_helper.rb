module AdminHelper

  %w(staff_picks newsletters users).each do |controller|
    define_method "#{controller}_controller?" do
      controller_name == controller
    end
  end

end
