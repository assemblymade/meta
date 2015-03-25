module ApplicationHelper

  TITLE_SEPARATOR = '•'

  def discover_controller?
    controller.controller_name == 'discover'
  end

  def staff?
    signed_in? && current_user.is_staff?
  end

  def home_controller?
    controller_name == 'home'
  end

  def client_side_route?
    bounties_index_route? ||
    bounty_show_route? ||
    metrics_routes? ||
    new_post_route? ||
    posts_index_route? ||
    post_show_route? ||
    product_activity_route? ||
    product_show_route? ||
    product_partners_route?
  end

  def bounties_index_route?
    controller_name == 'tasks' &&
      action_name == 'index'
  end

  def bounty_show_route?
    controller_name == 'tasks' &&
      action_name == 'show'
  end

  def metrics_routes?
    controller_name == 'metrics'
  end

  def new_post_route?
    controller_name == 'posts' &&
      action_name == 'new'
  end

  def posts_index_route?
    controller_name == 'posts' &&
      action_name == 'index'
  end

  def post_show_route?
    controller_name == 'posts' &&
      action_name == 'show'
  end

  def product_activity_route?
    controller_name == 'products' &&
      action_name == 'activity'
  end

  def product_partners_route?
    controller_name == 'partners' &&
      action_name == 'index'
  end

  def product_show_route?
    controller_name == 'products' &&
      action_name == 'show'
  end

  def idea_show_route?
    controller_name == 'ideas' && action_name == 'show'
  end

  def signin_page?
    controller_name == 'sessions' &&
      action_name == 'new'
  end

  def signup_page?
    controller_name == 'registrations' &&
      action_name == 'signup'
  end

  def firesize_url
    ENV['FIRESIZE_URL']
  end

  def show_event_timestamp(current_stream_event)
    if @last_stream_event == current_stream_event
      @timestamp
    elsif (first_event = @timestamp == nil) || @timestamp != current_stream_event.timestamp
      @last_stream_event  = current_stream_event
      @timestamp          = current_stream_event.timestamp
      @timestamp
    else
      false
    end
  end

  def parent_layout(layout)
    @view_flow.set(:layout,output_buffer)
    self.output_buffer = render(file: "layouts/#{layout}")
  end

end
