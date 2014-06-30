class CampfireNotifier
  include Rails.application.routes.url_helpers
  include ActionView::Helpers::TextHelper

  attr_reader :stream_event

  def self.send_activity(stream_event_id)
    new(StreamEvent.find(stream_event_id)).send_activity
  end

  def initialize(stream_event)
    @stream_event = stream_event
  end

  def send_activity
    post_to_campfire if configured?
  end

  def post_to_campfire
    campfire_post "/room/#{room}/speak.json", message: { body: message }
  end

  def campfire_post(url, body)
    conn = Faraday.new(url: "https://#{campfire_account}.campfirenow.com")
    conn.basic_auth(campfire_token, 'x')

    res = conn.post do |req|
      req.url url
      req.headers['User-Agent'] = "Assembly (https://assembly.com)"
      req.body = body
    end
  end

  def message
    doc          = Nokogiri::HTML(stream_event.title_html)
    raw_text     = doc.text.squish
    first_link   = doc.at('a')[:href]
    first_link   = "http://asm.co#{first_link}" unless first_link.starts_with?('http')
    "#{stream_event.chat_message(raw_text)} (#{first_link})"
  end

  def username
    stream_event.actor.username
  end

  def configured?
    room && campfire_token
  end

  def product_slug
    stream_event.product.slug
  end

  def room
    rooms[product_slug] || ENV['NOTIFY_CAMPFIRE_FIREHOSE_ROOM']
  end

  def rooms
    @rooms ||= Hash[campfire_rooms_env_var.split(',').map { |r| r.split(':') }]
  end

  def campfire_account
    ENV['NOTIFY_CAMPFIRE_ACCOUNT']
  end

  def campfire_rooms_env_var
    ENV['NOTIFY_CAMPFIRE_ROOMS'] || ''
  end

  def campfire_token
    ENV['NOTIFY_CAMPFIRE_TOKEN']
  end

  def short_url_host
    ENV['SHORT_HOST']
  end

  alias_method :product_task_url, :product_wip_url
end
