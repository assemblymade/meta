RSpec::Matchers.define :have_attributes do |expected|
  match do |actual|
    expect(actual).not_to be_nil

    expect(HaveAttributesMatcher.extract_attrs(expected, actual)).to RSpec::Matchers::BuiltIn::Include.new(expected)
  end

  failure_message do |actual|
    "expected \n#{actual.inspect}\n  to have attributes\n#{expected.inspect}\n  actually had\n#{HaveAttributesMatcher.extract_attrs(expected, actual).inspect}"
  end
end

class HaveAttributesMatcher
  def self.extract_attrs(expected, actual)
    actual_attrs = expected.inject({}) do |h, (k, v)|
      h[k] = actual.send(k)
      h
    end
  end
end
