module Rack
  class CrossOriginAssets

    def initialize(app)
      @app = app
    end

    def call(env)
      res = @app.call(env)

      if font_request?(env)
        res[1]['Access-Control-Allow-Origin'] = '*'
      end

      res
    end

  # private

    def font_request?(env)
      (env['REQUEST_PATH'] || '').match(/^\/assets/)
    end

  end
end
