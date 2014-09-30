module ReactHelper

  def react_component(class_name, props = {})
    content_tag(:div, nil, data: {
      'react-class' => class_name,
      'react-props' => props
    })
  end

end
