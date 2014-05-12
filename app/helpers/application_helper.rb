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

  def product_show_route?
    controller_name == 'products' &&
      action_name == 'show'
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
    ENV.fetch('FIRESIZE_URL')
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
end
