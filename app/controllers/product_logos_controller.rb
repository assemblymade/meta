class ProductLogosController < ProductController
  before_action :find_product!
  before_action :authenticate_user!

  def create
    attachment = Attachment.create!(attachment_params.merge(user: current_user))
    @logo = @product.product_logos.create!(attachment: attachment, user: current_user, product: @product)
    @product.current_product_logo = @logo

    policy = ::S3Policy.new(attachment.key, attachment.content_type)
    render json: AttachmentSerializer.new(attachment).as_json.merge(
      form: policy.form
    )
  end

  def show
  end

  def update
  end

  def destroy
  end

  def attachment_params
    params.permit(:name, :size, :content_type)
  end

end
