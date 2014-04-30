module LayoutHelper

  def _page_layouts
    @page_layouts ||=[]
  end

  def page_layout(*layouts)
    _page_layouts.push(*layouts)
  end

  def page_layouts_for_body
    _page_layouts.map do |layout|
      cssified_layout_name = layout.to_s.gsub(/[^[:alnum:]]+/, '-').downcase
      "l-#{cssified_layout_name}"
    end.join(' ')
  end

end
