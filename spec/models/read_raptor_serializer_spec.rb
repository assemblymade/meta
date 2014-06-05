require 'spec_helper'

describe ReadRaptorSerializer do
  let(:entities) { [Task.make!, Discussion.make!] }
  let(:keys) { ["Wip_#{entities[0].id}", "Wip_#{entities[1].id}"] }
  let(:articles) { [{type: 'Wip', id: entities[0].id},{type: 'Wip', id: entities[1].id}] }

  it 'serializes entities to article keys' do
    expect(
      ReadRaptorSerializer.serialize_entities(entities)
    ).to match_array(["Wip_#{entities[0].id}", "Wip_#{entities[1].id}"])
  end

  it 'serializes entities to article keys with tag' do
    expect(
      ReadRaptorSerializer.serialize_entities(entities, :email)
    ).to match_array(["Wip_#{entities[0].id}_email", "Wip_#{entities[1].id}_email"])
  end

  it 'deserializes and loads arrays of entities' do
    expect(
      ReadRaptorSerializer.deserialize(articles)
    ).to match_array(entities)
  end
end
