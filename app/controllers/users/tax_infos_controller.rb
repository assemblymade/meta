class Users::TaxInfosController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user.decorate
    @tax_info = @user.tax_info || @user.build_tax_info
  end

  def create
    @user = current_user.decorate
    @tax_info = current_user.build_tax_info(tax_info_params)
    if @tax_info.save
      flash[:success] = "Great! Your Tax Information has been submitted"
      redirect_to users_tax_info_path
    else
      render action: :show
    end
  end

  def update
    @user = current_user.decorate
    @tax_info = current_user.tax_info
    if @tax_info.update_attributes(tax_info_params)
      flash[:success] = "Great! Your Tax Information has been submitted"
      redirect_to users_tax_info_path
    else
      render action: :show
    end
  end

  # private

  def tax_info_params
    params.require(:user_tax_info).permit(
      :address,
      :business_name,
      :city,
      :classification,
      :full_name,
      :taxpayer_id,
      :taxpayer_type,
      :signature,
      :state,
      :zip,
      'date_of_birth(1i)', 'date_of_birth(2i)', 'date_of_birth(3i)'
    )
  end
end