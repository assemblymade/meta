module WipHelper
  COLOR_RULES = {
    'bug' => 'F40',
    'yc'  => 'ff6600'
  }

  def style_for_label(text)
    "background-color: ##{color_signature(text)} !important;"
  end

  def color_signature(text)
    text = text.downcase
    COLOR_RULES[text] || Digest::MD5.hexdigest("a#{text}").to_s[0..5].upcase
  end

  # TODO remove these when we've removed WIPs
  def product_task_checkin_url(product, wip, options={})
    product_wip_checkin_url(product, wip, options)
  end
  
  def product_task_path(product, wip, options={})
    product_wip_url(product, wip, options)
  end
  alias :product_task_url :product_task_path

  def product_tasks_path(product, options={})
    product_wips_url(product, options)
  end
  alias :product_tasks_url :product_tasks_path
end