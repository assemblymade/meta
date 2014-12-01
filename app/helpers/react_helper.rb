module ReactHelper

  def react_component(class_name, props = {})
    content_tag(:div, nil, data: {
      'react-class' => class_name,
      'react-props' => props
    })
  end

  def inline_react_component(class_name, props = {})
    content_tag(:span, nil, data: {
      'react-class' => class_name,
      'react-props' => props
    })
  end

  def initial_store_data(class_name, data)
    content_tag(:script, data.to_json.html_safe, id: class_name, type: 'application/json')
  end

end
