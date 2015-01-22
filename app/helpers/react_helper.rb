module ReactHelper
  # https://github.com/reactjs/react-rails/blob/master/lib/react/rails/view_helper.rb
  # Render a UJS-type HTML tag annotated with data attributes, which
  # are used by react_ujs to actually instantiate the React component
  # on the client.
  # FIXME (pletcher): This method should be included through react_ujs
  def react_component(name, args = {}, options = {}, &block)
    options = {:tag => options} if options.is_a?(Symbol)
    block = Proc.new{concat React::Renderer.render(name, args)} if options[:prerender]

    html_options = options.reverse_merge(:data => {})
    html_options[:data].tap do |data|
      data[:react_class] = name
      data[:react_props] = React::Renderer.react_props(args) unless args.empty?
    end
    html_tag = html_options[:tag] || :div

    # remove internally used properties so they aren't rendered to DOM
    html_options.except!(:tag, :prerender)

    content_tag(html_tag, '', html_options, &block)
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
