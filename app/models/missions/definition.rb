module Missions
  class Definition
    attr_reader :id

    def initialize(id)
      @id = id
      @attributes = {}
    end

    def method_missing(attribute, *args, &block)
      attribute = attribute.to_sym

      if block_given?
        @attributes[attribute] = block
      elsif args.length > 0
        @attributes[attribute] = args.first
      else
        if @attributes.has_key? attribute
          @attributes[attribute]
        else
          super
        end
      end
    end
  end
end
