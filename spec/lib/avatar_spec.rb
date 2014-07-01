require './lib/avatar'

describe Avatar do

  let(:user) { double(email: 'chris@assembly.com', avatar_url: nil) }

  it "#url" do
    expect(described_class.new(user).url(60).to_s).to eq(
      "https://gravatar.com/avatar/6352d8cac069db91ce6fcd14bc7ab342?d=https%3A%2F%2Fassembly.com%2Fassets%2Favatars%2Fdefault.png&s=60"
    )
  end

end
