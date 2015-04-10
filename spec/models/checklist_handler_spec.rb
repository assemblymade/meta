require 'spec_helper'

describe ChecklistHandler do
  let(:product) { Product.make! }
  let(:idea) { Idea.make! }

  before do
    User.make!({username: "kernel"})
    Idea.create!({product_id: product.id, user_id: User.find_by(username: "kernel").id, name: "social_media_for_social_media_founders" })
  end

  it 'hearts checklist' do
    expect(ChecklistHandler.new.hearts_checklist(product)).to eq({"name"=>"Validate people want this", "editable"=>false, "complete"=>false, "subtext"=>"Get 15 more hearts"})
  end

  it 'pick name checklist item' do
    expect(ChecklistHandler.new.pick_name_checklist(product)["name"]).to eq("Pick a name")
  end

  it 'feedback checklist item' do
    expect(ChecklistHandler.new.feedback_checklist(product)).to eq({"name"=>"Get feedback", "editable"=>false, "complete"=>false, "subtext"=>"Get 5 more comments"})
  end

  it 'idea checklist assembled' do
    expect(ChecklistHandler.new.idea_checklists(product).count).to eq(3)
  end

  it 'checklist comments idea' do
    expect(ChecklistHandler.checklist_comments_idea(idea)).to eq(false)
  end


end
