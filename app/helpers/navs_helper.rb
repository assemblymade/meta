module NavsHelper

  def nav_active?(nav)
    (@navs || []).include?(nav.to_sym)
  end

  def activate_nav!(nav)
    @navs ||= []
    @navs.push(nav.to_sym)
  end

end
