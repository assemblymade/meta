require 'spec_helper'

describe MilestonesController do
  let(:product) { Product.make! }
  let(:creator) { User.make! }
  let(:existing_task) { Task.make! product: product }

  describe '#create' do
    before do
      sign_in creator
      post :create,  product_id: product.slug, wip: {
        title: 'Bugs',
        milestone_attributes: {
          description: 'squash em'
        },
        milestone_tasks_attributes: [{
            title: 'cat gifs are broken'
          }, {
            title: 'too many doges'
          }, {
            id: existing_task.id
          }, {
            id: existing_task.id
          }
        ]
      }
    end

    it "redirects" do
      expect(response).to redirect_to(product_milestone_path(product, assigns(:milestone)))
    end

    it 'creates tasks from titles and adds existing tasks' do
      expect(assigns(:milestone).tasks.size).to eq(3)
    end
  end

  describe '#images' do
    let(:attachment) { Attachment.make! }
    let!(:wip) { Wip.make!(product: product, user: creator) }
    let!(:milestone) { Milestone.make!(product: product, wip: wip, number: wip.number) }

    before do
      sign_in creator
      patch :images, product_id: product.slug, milestone_id: milestone.wip.number, wip: {
        milestone_images_attributes: [{
          attachment_id: attachment.id
        }]
      }
    end

    it 'creates a milestone image' do
      milestone.reload
      expect(milestone.milestone_images.size).to eq(1)
    end
  end
end
