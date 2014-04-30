require 'spec_helper'

describe NameGenerator do
  let(:name_generator) { NameGenerator.new }

  it 'generates a codename by combining an adjective and noun' do
    adjective, noun = name_generator.generate.split
    expect(NameGenerator::ADJECTIVES).to include(adjective.downcase)
    expect(NameGenerator::NOUNS).to include(noun.downcase)
  end

  it 'generates a codename that has not yet been used' do
    name_generator.stub(:product_names).and_return("Super Happy Puppy Adventure")
    name_generator.stub(:generate).and_return("Super Happy Puppy Adventure", "Jimmy's Hot Chicken")
    expect(name_generator.generate_unique).to eq("Jimmy's Hot Chicken")
  end

end
