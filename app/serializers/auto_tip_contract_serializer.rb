class AutoTipContractSerializer < ApplicationSerializer
    attributes :amount, :active?, :username, :created_on, :username_link

    def username
      object.user.username
    end

    def username_link
      user_url(object.user)
    end

    def created_on
      object.created_at.strftime("%m/%d/%y")
    end

end
