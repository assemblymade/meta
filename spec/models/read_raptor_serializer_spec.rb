require 'spec_helper'

describe ReadRaptorSerializer do
  let(:entities) { [Task.make!, Discussion.make!] }
  let(:serialized) { ["#{entities[0].class}_#{entities[0].id}", "#{entities[1].class}_#{entities[1].id}"] }

  it 'serializes entities to article keys' do
    expect(
      ReadRaptorSerializer.serialize_entities(entities)
    ).to eq(serialized)
  end

  it 'deserializes and loads arrays of entities' do
    expect(
      ReadRaptorSerializer.deserialize_articles(serialized)
    ).to eq(entities)
  end
end