class EsProxy < Rack::Proxy
  def initialize(app)
    @app = app
    @es_url = URI.parse(ENV['ELASTICSEARCH_URL'])
  end

  def call(env)
    request = Rack::Request.new(env)
    if request.path.start_with?('/_es')
      new_path = URI.parse(request.path.sub(/^\/_es/, ''))
      env['PATH_INFO'] = new_path.path
      env['HTTP_HOST'] = @es_url.host
      env['SERVER_PORT'] = 80
      # env['SERVER_PROTOCOL'] = @es_url.scheme
      perform_request(env)
    else
      @app.call(env)
    end
  end
end
