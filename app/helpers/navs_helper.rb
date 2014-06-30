module NavsHelper

  def nav_active_class(nav)
    'active' if nav_active?(nav)
  end

  def nav_active?(nav)
    @navs && @navs.include?(nav.to_sym)
  end

  def activate_nav!(nav)
    @navs ||= []
    @navs.push(nav.to_sym)
  end

  def breadcrumb(url, text)
    @breadcrumb = {url: url, text: text}
  end

end
