class ActionController::Parameters
  # def param_merge(hash)
  #   puts "-"*100
  #
  #   h = {}
  #   puts "#{self.inspect} << #{hash.inspect}"
  #   self.each do |k, v|
  #     val = hash[k.to_s] || hash[k.to_sym]
  #     puts "  k:#{k} v:#{v} val:#{val}"
  #
  #     if val.nil?
  #       h[k] = v
  #     else
  #       case v
  #       # when Array
  #       #   v.each{|p| h[k] = ActionController::Parameters.new(p).param_merge(val) }
  #       when Hash
  #         h[k] = ActionController::Parameters.new(v).param_merge(val)
  #       end
  #     end
  #   end
  #   h.tap{ puts "    << #{h}"}

    # self.merge(hash) do |k, param, val|
    #   puts "k:#{k} #{param} (#{param.class}) >> #{val}"
    #   case param
    #   when Array
    #     param.map{|p|       puts "  #{p} >> #{val}"; p.deep_merge(val) }
    #   when ActionController::Parameters
    #     param.param_merge(val)
    #   end
    # end
  # end
end
