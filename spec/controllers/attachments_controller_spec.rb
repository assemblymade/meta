require 'spec_helper'

describe AttachmentsController do
  let(:current_user) { User.make! }

  describe '#create' do
    before {
      sign_in current_user

      post :create, name: 'grumpycat.png', size: 13124, content_type: 'image/png'
    }
    subject { response }

    its(:response_code) { should == 200 }

    it 'has attachment with form' do
      h = JSON.parse(response.body)
      attachment = assigns(:attachment)

      policy = ::S3Policy.new(attachment.key, attachment.content_type)

      # ignore these fields
      h.delete 'gallery_thumb_url'
      h.delete 'created_at'
      h.delete 'user'
      h.delete 'firesize_url'

      h.should == {
        'id' => attachment.id,
        'name' => 'grumpycat.png',
        'size' => 13124,
        'content_type' => 'image/png',
        'href' => "/#{attachment.key}",
        'form' => {
          'key' => attachment.key,
          'acl' => 'public-read',
          'AWSAccessKeyId' => 'access-key',
          'Cache-Control' => "max-age=31557600",
          'Content-Type' => "image/png",
          'policy' => policy.policy,
          'signature' => policy.signature,
        }
      }
    end
  end
end
