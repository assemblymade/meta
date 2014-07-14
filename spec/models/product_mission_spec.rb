require 'spec_helper'

describe ProductMission do
  # let(:submitter) { User.make! github_login: 'whatupdave' }
  # let(:product) { Product.make! user: submitter }
  # let(:staffer) { User.make! username: 'chrislloyd' }
  # let(:mission_completor) { User.make! }
  #
  # subject { product.current_mission }
  #
  # its(:progress) { should == 0.0 }
  #
  # context 'when the last step is completed' do
  #   before do
  #     Discussion.make! product: product
  #     Discussion.make! product: product
  #     product.reload
  #   end
  #
  #   describe '#complete!' do
  #     before do
  #       subject.complete!(mission_completor)
  #       product.reload
  #     end
  #
  #     it 'records completor' do
  #       expect(product.completed_missions.first.completor).to eq(mission_completor)
  #     end
  #
  #     it 'creates completed mission' do
  #       expect(product).to have(1).completed_missions
  #     end
  #   end
  # end
  #
  # context 'tasks mission', sidekiq: :fake do
  #   subject { ProductMission.find(:tasks, product) }
  #
  #   it 'queues up repo creation' do
  #     subject.complete!(mission_completor)
  #
  #     expect(Github::CreateProductRepoWorker.jobs.size).to eq(1)
  #   end
  #
  #   it 'queues up adding a collaborator' do
  #     subject.complete!(mission_completor)
  #
  #     expect(Github::AddCollaboratorToProductRepoWorker.jobs.size).to eq(1)
  #   end
  #
  #   it 'adds repo to product' do
  #     ENV['GITHUB_PRODUCTS_ORG'] ||= 'asm-products'
  #     subject.complete!(mission_completor)
  #
  #     expect(product.repos.map(&:url)).to include("https://github.com/asm-products/#{product.slug}")
  #   end
  # end
  #
  # context 'contributors mission' do
  #   subject { ProductMission.find(:contributors, product) }
  #
  #   it 'sets can advertise flag on product' do
  #     subject.complete!(mission_completor)
  #
  #     expect(product.can_advertise?).to be_true
  #   end
  # end

  # context 'events mission' do
  #   subject { ProductMission.find(:events, product) }
  #
  #   it 'counts events' do
  #     task = Task.make!(product: product)
  #     Event::Comment.make!(wip: task)
  #
  #     expect(subject.progress).to eq(1)
  #   end
  #
  #   it 'gets staffer on core team on completed' do
  #     staffer.save
  #     subject.complete!(mission_completor)
  #
  #     expect(product.core_team.size).to eq(1)
  #   end
  # end
  #
  # context 'signups mission' do
  #   subject { ProductMission.find(:signups, product) }
  #
  #   it 'counts pre-signups' do
  #     product.presignup!(staffer, '0.0.0.0')
  #
  #     expect(subject.progress).to eq(1)
  #   end
  #
  #   it 'gets featured on completed' do
  #     subject.complete!(mission_completor)
  #
  #     expect(product.featured_on.to_s).to eq(Time.current.to_s)
  #   end
  # end
end
