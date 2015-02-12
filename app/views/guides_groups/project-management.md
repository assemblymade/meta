# Managing Ownership

A brand new product may start out with very few contributors.  It's probable that a singlue user owners most or all of the vested coins.  In that case, the user has wide discretion in how to allocate further coins to subsequent contributors.  Several questions arise, such as:

- **How much should I allocate for new bounties?**

See our section on <a href="">bounty valuations</a>

- **How should I value the product throughout its lifecycle? Early?  Middle?  Late Stage?**

  It's up to you!  But typically, a brand new product has very little value; you'll have to offer a lot of coins to incentivize new participants.  Conversely, an established, profitable company might have a lot of value.  Then new entrants may not be able to expect a huge ownership stake.  Try to gauge the amount of work that has been put into the product.  If it's a brand new product, it might be smart to be generous to new participants.  Owning 100% of zero is still zero!

- **Should I be afraid of losing majority control?**

Probably not.  Building something really awesome will involve working with others.  You should try to be fair with coworkers.  Remember that giving them ownership incentivizes them also to see the product succeed.  Being too miserly means you have no one aligned with the same incentivizes.  

Also the greatest risk any product has is obscurity.  You are far more likely to miss out on value from a product that fails, than from having given out too much ownership.  Bringing in talented people is essential and almost certainly worth the cost.

- **How many coins should I give myself in the beginning?**

When migrating an existing product onto Assembly, you can choose to allocate to yourself any number of coins out of the original 10 million.  Since the product was yours to begin with, it's totally up to you to determine how many coins should be vested (in your hands) versus unvested (available for payouts for new contributors).  

Generally speaking, leaving a large portion of unvested coins might be wise.  Unvested coins need not be spent; you are under no pressure to award them at a pace you are not comfortable with.  Having a large number of unvested coins available gives you breathing room to compensate people for work done.  It also allows you to bring in the best people.  While leaving more coins unvested increases the upper bound of dilution that you could experience, it also expands the scope of better utilizing Assembly.  After all, it's all about working with other people; having more unvested coins available facilitates that.

# When to Award Coins

Of course not!  A user must complete a bounty to the satisfaction of core team members.  When awarding a bounty, and for pricing one, as an owner you should ask yourself:
- Is the product gaining in value?
- Am I getting more value from this bounty than the extent of my ownership dilution?
- Was the bounty clearly worded and precise?  How can I make the product's needs more clear?

If work is incomplete, gently inform the contributor.  Chances are that with a little discussion, any gaps can be filled. Also check that the bounty is precise and clear; one of the leading causes of bounty-failure is vaguely written bounties.  

# Valuing Bounties

Bounties come with prices denominated in App Coins for the product they inhabit.  Determining the value of bounties is one of the most important parts of <a href="">Product Management</a> on Assembly.  

Assembly aims to provide product owners tools, and rights, for managing their product.  One of these rights is the ability to vote on a bounty price.  

Product owners can each vote on the value of a bounty, in App Coins.  Each owner's vote varies in weight based on his ownership in that product.  The bounty value is thus a weighted-average of all owners' votes.  This average is normalized against the fraction of owners who voted.  This scheme has the following properties.  

- Owners get a say proportional to their contributions to the product; those with the most at stake have the most say.
- Owners may disagree with one another; a compromise solution is still reached
- Not all owners need vote.  If 80% of owners do not vote on a particular bounty, only the votes of the 20% who did vote count.  Within these 20%, a weighted average is conducted.
- Users who have no ownership whatsoever get minimal voting weight.  Thus they may voice their opinion, without significantly influencing the final result.
- All votes are public.  Abusive behavior becomes plainly visible.


# Suggesting Bounty Values

Assembly has an internal algorithm for suggesting the values of bounties.  A lot of users were unsure how to value bounties, so we provided a simple way of selecting reasonable values.  In no way are users forced to select from the calculated, suggested values; they may always vote a custom amount.  

The suggestion algorithm works in the following way:
- If a product is profitable:
  - The algorithm takes the product's earnings over the past few months and extrapolates earnings for the entire year.  This is, of course, only a very rough estimate.
  - A Price/Earnings multiple (a fixed number used across the site) is used to assign a overall net value to the Product.
  - The suggestion system uses a slider bar with 5 increments.  The median increment is set to correspond to some fixed dollar amount.  Each increment above and below the middle value is a geometric multiple of the preceding value.  Thus prices range exponentially.  We found that this matched user preferences in aggregate.
  - For each slider position, a value in dollars is determined.  This dollar value is then mapped to a coin value, using the product valuation scheme described above.  This is the number of coins suggested.
  - We found that this scheme made the most sense, anchoring coin values in real-world prices.  While the system is only highly approximate, it at least makes sense; it's a good starting point.

- If a product is NOT profitable:
  - The algorithm looks at the number of unvested coins available for that product.  It seeks to determine a percentage of those coins to allocate in this bounty.
  - That percentage corresponds to a sigmoidal function, in which the X-axis input is the number of bounties done for that product.  This means that as a product matures, more bounties are completed; the percentage of coins allocated with each bounty will steadily decline.  This is supposed to represent the growing maturity, and value, of the product.
  - Another input determining the percentage is the increment on the suggestion slider.  Once again, these values scale exponentially.  The value determined on the sigmoidal curve is multiplied by this exponential factor to determine the final percentage.
  - This system has several advantages.  Users still get an exponential range of options, as they are accustomed to.  As more work is done on products, subsequent bounties award less ownership.  Finally, the amount awarded scales with the number of available unvested coins.  The number of vested coins cannot surpass the coin total this way.  Eventually, as the number of unvested coins diminishes, prices will be forced down too low, to the point where more unvested coins may need to be issued.  This suggestion mechanism is even more approximate than that for profitable products.  But it is a devilishly hard problem to value something with no profits; we've done what makes the most sense.

The suggestion system is just that, merely a suggestion.  By all means, whenever possible use a custom coin value that makes sense to you.

# Promoting a Product

One of the biggest challenges to managing a product is keeping
the community up-to-date on latest happenings.  This comes in
several forms.

On a technical level, it is always best to have
an onboarding process to educate new users about the workings
of the product.  Whatever has been built already, how does it work?
What is the technical structure of the app that has been built
(or will be built)?  A technical onboarding guide, if even a
short one, can dramatically simplify the process of bringing new
potential contributors up to speed.

It's also important to <a href="">market</a> your product to
maintain awareness.  If no one knows about your product, then
no one can help build it!  Here are a few things you can do
to promote a product

- Write posts describing product milestones
- Write detailed, precise bounties
- Stay active in community and product chat
- Keep the Product overview up-to-date.  Be expressive!  This is
where curious new users will chance upon your product.
