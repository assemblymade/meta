module Missions
  module DSL
    extend ActiveSupport::Concern

    module ClassMethods
      attr_accessor :missions

      def first
        missions.first
      end

      def find(id)
        missions.find{|m| m.id == id }
      end

      def mission(id, &blk)
        @missions ||= []

        mission = Missions::Definition.new(id)
        mission.instance_eval(&blk)

        @missions << mission
      end
    end
  end
end
