require 'spec_helper'

describe ProductsController do
  render_views

  let(:creator) { User.make!({username: "kernel"}) }
  let(:collaborator) { User.make! }
  let(:product) { Product.make!(user: creator) }

  describe '#new' do
    it "redirects on signed out" do
      get :new
      expect(response).to redirect_to(new_user_session_path)
    end

    it "is successful when signed in" do
      sign_in creator
      get :new
      expect(response).to be_success
    end
  end

  describe '#show' do
    context 'product is launched' do
      let!(:nfi) { NewsFeedItem.make!(product: product) }
      let!(:archived_nfi) { NewsFeedItem.make!(product:product, archived_at: Time.now) }

      it "is successful" do
        get :show, id: product.slug
        expect(response).to be_success
      end
    end

    context 'product in stealth' do
      let(:product) { Product.make! }

      it "is successful" do
        get :show, id: product
        expect(response).to be_success
      end
    end
  end

  describe '#edit' do
    it "is successful" do
      product.team_memberships.create(user: product.user, is_core: true)
      sign_in product.user
      get :edit, id: product.slug
      expect(response).to be_success
    end
  end

  describe '#create' do
    before do
      sign_in creator
      creator.update! current_sign_in_ip: IPAddr.new('127.0.0.1/24')
    end

    context 'with good params' do
      before { post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' } }

      it "creates product" do
        expect(assigns(:product)).to be_a(Product)
        expect(assigns(:product)).to be_persisted
      end

      it 'adds user to core team' do
        expect(assigns(:product).core_team).to include(creator)
      end

      it 'has slug based on name' do
        expect(assigns(:product).slug).to eq('kjdb')
      end

      it 'adds creator to the core team' do
        expect(assigns(:product).core_team).to match_array([creator])
      end

      it 'creates a main discussion thread' do
        expect(Discussion.count).to eq(1)
        expect(assigns(:product).main_thread).to be_persisted
      end

      it 'follows product' do
        expect(assigns(:product).followers.count).to eq(1)
      end

      it 'creates a chat room' do
        expect(assigns(:product).chat_rooms.count).to eq(1)
      end
    end

    it 'creates a product with core team' do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }, core_team: [collaborator.id]
      expect(assigns(:product).core_team).to include(collaborator)
    end


    context 'from an idea' do
      let!(:idea) { Idea.make!(user: creator) }

      before do
        NewsFeedItem.create_with_target(idea)
      end

      it 'creates a product associated with the correct idea' do
        post :create, product: { name: 'KJDB',
                                 pitch: 'Manage your karaoke life',
                                 idea_id: idea.id},
                      core_team: [collaborator.id]

        expect(assigns(:product).id).to eql(assigns(:idea).product_id)
      end

      it 'awards coins to supporters if created from an idea' do

        partner_ids = [creator, collaborator].map(&:id).join(',')
        post :create, product: { name: 'KJDB',
                                 pitch: 'Manage your karaoke life',
                                 idea_id: idea.id,
                                 partner_ids: partner_ids},
                      core_team: [collaborator.id]
        expect(assigns(:product).partners_count).to eq(2)
      end
    end
  end

  describe '#update' do
    before do
      sign_in creator
    end

    it 'updates all fields' do
      info_fields = Product::INFO_FIELDS.each_with_object({}) do |field, h|
        h[field.to_sym] = field
      end

      attrs = {
        name: 'KJDB',
        pitch: 'Manage your karaoke life',
        description: 'it is good.'
      }.merge(info_fields)

      patch :update, id: product, product: attrs
      expect(product.reload).to have_attributes(attrs)
    end
  end

  describe '#launch' do
    let(:product) { Product.make!(user: creator) }

    before do
      sign_in creator
    end

    it "redirects to product slug" do
      patch :launch, product_id: product
      expect(response).to redirect_to(product_path(product.reload.slug))
    end

    it 'queues job' do
      expect {
        patch :launch, product_id: product
      }.to change(ApplyForPitchWeek.jobs, :size).by(1)
    end
  end

  describe '#follow' do
    let(:product) { Product.make!(user: creator) }

    before do
      sign_in collaborator
    end

    it 'publishes activity' do
      expect {
        patch :follow, product_id: product
      }.to change(Activity, :count).by(1)
    end
  end
end
