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
      redirect_to users_balance_path
    else
      render action: :show, form_type: params[:form_type]
    end
  end

  def update
    @user = current_user.decorate
    @tax_info = current_user.tax_info
    if @tax_info.update_attributes(tax_info_params)
      flash[:success] = "Great! Your Tax Information has been submitted"
      redirect_to users_balance_path
    else
      render action: :show, form_type: params[:form_type]
    end
  end

  # private

  def tax_info_params
    params.require(:tax_info).permit(
      :address,
      :business_name,
      :citizenship,
      :city,
      :classification,
      :country,
      'date_of_birth(1i)', 'date_of_birth(2i)', 'date_of_birth(3i)',
      :mailing_address,
      :mailing_city,
      :mailing_state,
      :mailing_zip,
      :mailing_country,
      :type,
      :foreign_tax_id,
      :full_name,
      :reference_number,
      :signature,
      :signature_capacity,
      :state,
      :taxpayer_id,
      :taxpayer_type,
      :treaty_article,
      :treaty_withholding,
      :treaty_income_type,
      :treaty_reasons,
      :zip,
      :type
    )
  end
end
