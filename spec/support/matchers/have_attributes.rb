RSpec::Matchers.define :have_attributes do |expected|
  match do |actual|
    expect(actual).not_to be_nil

    actual_attrs = expected.inject({}) do |h, (k, v)|
      h[k] = actual.send(k)
      h
    end

    expect(actual_attrs).to RSpec::Matchers::BuiltIn::Include.new(expected)
  end
end
