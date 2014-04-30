class AttachmentsController < ApplicationController
  before_action :authenticate_user!

  def create
    @attachment = Attachment.create!(attachment_params.merge(user: current_user))

    policy = ::S3Policy.new(@attachment.key, @attachment.content_type)
    render json: AttachmentSerializer.new(@attachment).as_json.merge(
      form: policy.form
    )
  end

  # private

  def attachment_params
    params.permit(:name, :size, :content_type)
  end
end