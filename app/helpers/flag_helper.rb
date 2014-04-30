module FlagHelper

  def enable(name)
    define_method("#{name}?") { true }
  end

end
