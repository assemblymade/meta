class Hash
  def to_struct
    Struct.new(*keys).new(*values)
  end
end