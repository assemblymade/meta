module Missions
  class Base
    attr_reader :mission_definition
    delegate :id, :steps, :steps_completed, :on_completed, to: :mission_definition

    def initialize(mission_definition)
      @mission_definition = mission_definition
    end

    def current_step
      instance_eval(&mission_definition.steps_completed)
    end

    def completed
      instance_eval(&mission_definition.on_completed)
    end

    def progress
      current_step
    end

    def complete?
      progress >= steps
    end
  end
end
