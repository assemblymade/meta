require 'spec_helper'

describe Attachment do
  describe '#url' do
    it 'encodes the url, escaping whitespace etc.' do
      attachment = Attachment.create!(name: 'this name has spaces')

      expect(attachment.url).to include('this%20name%20has%20spaces')
    end
  end
end
