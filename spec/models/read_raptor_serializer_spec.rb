require 'spec_helper'

describe ReadRaptorSerializer do
  let(:entities) { [Task.make!, Discussion.make!] }
  let(:serialized) { ["Wip_#{entities[0].id}", "Wip_#{entities[1].id}"] }

  it 'serializes entities to article keys' do
    expect(
      ReadRaptorSerializer.serialize_entities(entities)
    ).to match_array(serialized)
  end

  it 'deserializes and loads arrays of entities' do
    expect(
      ReadRaptorSerializer.deserialize_articles(serialized)
    ).to match_array(entities)
  end
end