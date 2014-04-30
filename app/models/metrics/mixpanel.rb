module Metrics
  class Mixpanel
    def funnel_conversion(funnel_id, from, to)
      response = funnel funnel_id,
        from_date: from.to_s,
          to_date: to.to_s,
         interval: (to - from).to_i + 1

       if response['data']
         date = response['meta']['dates'].first
         steps = response['data'][date]['steps']
         steps.last['overall_conv_ratio']
       end
    end

    def funnel(funnel_id, options={})
      request("funnels", options.merge(funnel_id: funnel_id))
    end

    def list_funnels
      request('funnels/list')
    end

    def request(url, options={})
      query = build_request_query(options)

      resp = connection.get do |req|
        req.url "/api/2.0/#{url}?#{query}"
      end

      JSON.load(resp.body)
    end

    def connection
      Faraday.new(url: 'http://mixpanel.com') do |faraday|
        faraday.adapter  :net_http
      end
    end

    def build_request_query(options = {})
      options.merge!(api_key: ENV['MIXPANEL_API_KEY'], expire: expire)
      options = options.keys.sort.map {|k| "#{k}=#{options[k]}" }
      sig = Digest::MD5.hexdigest(options.join + ENV['MIXPANEL_API_SECRET'])
      options << "sig=#{sig}"
      options.join("&")
    end

    def expire
      (10.minutes.from_now).to_i
    end
  end
end
