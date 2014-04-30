module ActiveModel
  module Lists
    extend ActiveSupport::Concern

    module ClassMethods
      def list(name)
        attributes name
        define_method(name.to_s) do
          items = object.send name
          if items.any?
            {
              items: items.map{|i| Financial::TransactionSerializer.new(i).as_json }
            }
          end
        end
      end
    end
  end
end