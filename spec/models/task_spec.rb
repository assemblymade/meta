require 'spec_helper'

describe Task do
  describe 'deliverable' do
    it 'is required' do
      expect { Task.make!(deliverable: nil) }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end
end
