namespace :awards do
  task add_cent_data: :environment do
    Award.find_each do |a|
      tles = TransactionLogEntry.where(wallet_id: a.id)
      cents = tles.map(&:cents)
      a.update_column(:cents, cents.min.abs) unless cents.empty?
    end
  end
end

# some awards don't have corresponding TransactionLogEntries
# eg Award
# #<Award:0x007fd1038c3d50
#  id: "51eca7f0-62a2-41aa-8843-25516fcf4fef",
#  awarder_id: "a034e2aa-8c61-4336-a151-3ee674347ff1",
#  event_id: "0087a21a-dd5e-4ad1-8bed-7b0a8dacb9b7",
#  wip_id: "a8ace2f4-8e08-4bac-9d7b-dc16ca8453c4",
#  winner_id: "1e729ad7-24ad-4f4c-a230-e136e265798e",
#  cents: nil,
#  created_at: Thu, 03 Jul 2014 16:33:34 UTC +00:00,
#  updated_at: Thu, 03 Jul 2014 16:33:34 UTC +00:00>

# => #<Task:0x007fd102a9a468
#  id: "a8ace2f4-8e08-4bac-9d7b-dc16ca8453c4",
#  user_id: "97a76092-42b9-48ec-bbd7-868809ee135f",
#  product_id: "99774a98-3059-4290-921a-2f25f48e093b",
#  title: "BUG: The widget should be using Open Sans not Lato",
#  created_at: Fri, 20 Jun 2014 17:56:19 UTC +00:00,
#  updated_at: Sun, 07 Sep 2014 00:30:54 UTC +00:00,
#  number: 683,

