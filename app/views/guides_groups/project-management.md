# Managing Ownership

A brand new product may start out with very few contributors.  It's probable that a singlue user owners most or all of the vested coins.  In that case, the user has wide discretion in how to allocate further coins to subsequent contributors.  Several questions arise, such as:

- **How much should I allocate for new bounties?**

See our section on <a href="valuing-bounties">bounty valuations</a>

- **How should I value the product throughout its lifecycle? Early?  Middle?  Late Stage?**

  It's up to you!  But typically, a brand new product has very little value; you'll have to offer a lot of coins to incentivize new participants.  Conversely, an established, profitable company might have a lot of value.  Then new entrants may not be able to expect a huge ownership stake.  Try to gauge the amount of work that has been put into the product.  If it's a brand new product, it might be smart to be generous to new participants.  Owning 100% of zero is still zero!

- **Should I be afraid of losing majority control?**

Probably not.  Building something really awesome will involve working with others.  You should try to be fair with coworkers.  Remember that giving them ownership incentivizes them also to see the product succeed.  Being too miserly means you have no one aligned with the same incentivizes.  

Also the greatest risk any product has is obscurity.  You are far more likely to miss out on value from a product that fails, than from having given out too much ownership.  Bringing in talented people is essential and almost certainly worth the cost.

- **How many coins should I give myself in the beginning?**

When migrating an existing product onto Assembly, you can choose to allocate to yourself any number of coins out of the original 10 million.  Since the product was yours to begin with, it's totally up to you to determine how many coins should be vested (in your hands) versus unvested (available for payouts for new contributors).  

Generally speaking, leaving a large portion of unvested coins might be wise.  Unvested coins need not be spent; you are under no pressure to award them at a pace you are not comfortable with.  Having a large number of unvested coins available gives you breathing room to compensate people for work done.  It also allows you to bring in the best people.  While leaving more coins unvested increases the upper bound of dilution that you could experience, it also expands the scope of better utilizing Assembly.  After all, it's all about working with other people; having more unvested coins available facilitates that.

# When to Award Coins

A user must complete a bounty to the satisfaction of core team members.  When awarding a bounty, and for pricing one, as an owner you should ask yourself:
- Is the product gaining in value?
- Am I getting more value from this bounty than the extent of my ownership dilution?
- Was the bounty clearly worded and precise?  How can I make the product's needs more clear?

If work is incomplete, gently inform the contributor.  Chances are that with a little discussion, any gaps can be filled. Also check that the bounty is precise and clear; one of the leading causes of bounty-failure is vaguely written bounties.  

# Valuing Bounties

Bounties come with prices denominated in App Coins for the product they inhabit.  Determining the value of bounties is one of the most important parts of product management on Assembly.  

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

It's also important to <a href="marketing">market</a> your product to
maintain awareness.  If no one knows about your product, then
no one can help build it!  Here are a few things you can do
to promote a product

- Write posts describing product milestones
- Write detailed, precise bounties
- Stay active in community and product chat
- Keep the Product overview up-to-date.  Be expressive!  This is
where curious new users will chance upon your product.

# Building momentum for your product

Here are five ways to build momentum and rally the community behind your product:

**1. Build other products on Assembly**

The best part of Assembly is the community, and the best way to build relationships is to work with people. When people see that you are smart and driven, they'll be thrilled to work with you on your product.

A few more benefits of working on various products:

* It will teach you how Assembly works and how people use it
* You'll end up with a diverse portfolio of App Coin ownership

There is no question that the most effective way to generate interest in your product is to work on other products on Assembly.


**2. Get to work building your product.**

Momentum breeds momentum. The more vision and activity that people see, the more excited they'll be to dive into a product. Also, clear communication of completed and upcoming work will help someone get a great grasp of what you're doing and how they can help.


**3. Organize your work**

In addition to starting to build your product, it's also important to lay out your ideas. That means starting discussions, creating bounties and organizing them within projects, and posting updates to your product blog.

*Tip: Keep your bounties clear, and small in scope. That makes it easy for newcomers to know how to get moving.*


**4. Bring your friends**

We all have that talented friend we love working with. Or the talented friend we've always *wanted* to work with. Here's your chance. And, you can even tip your friend a few App Coins so they have a small stake in the product before they arrive.


**5. Let us know**

The Assembly team gets inbounds all the time from great people who would love to find a great team to work with. Hop into [Assembly Meta chat](http://assembly.com/meta/chat) and tell us what skills and backgrounds you're looking for – we'll try our best to send people your way.

As always, the best thing to do is to do what you best: make stuff.


#Writing Bounties Well

Good bounties should assume that the reader as little context to the product as convenient (i.e. well known projects can assume readers know a little more).

      1.	Link to relevant Github repos
      2.	Describe the problem
      3.	List the goals
      4.	List any blockers or subtasks
      5.	Offer people to help out with it
      6.	Preferably include images or supporting assets
      7.	Mega bonus points for  quick video/screencast

Depending on the problem, go into more or less detail about the solution. (i.e. if it's an easy but time consuming solution, spec it out clearly. If it requires more creativity stress the goals rather than the solution)


# Roadmap

As a leader of your product, it’s important to talk about your roadmap and post regular updates to it. Here are a few pertinent things to include:

- People: Who’s involved? Who do you need?
- Work: What’s happened so far? What’s coming up next?
- Tech: What are you using? What might you use?
- Vision: Where is this product going? Has that changed?
- Monetization: How will you make money?


# Marketing
wip
# Monetizing
wip
# Etiquette

If you want to work on a bounty, first see if it looks like anyone else has been working on it. If not, it’s probably fair game for you to jump in.

If someone has indicated they are working on it but you get the sense they may have moved on, the best thing to do is ask. Sometimes things come up and people can’t finish something they wanted to finish – that’s ok, but it’s always best to communicate.

# Community values

**Creating community, products, and fun.**

That's pretty much the point of Assembly. These are not rules, they're simply a reflection of the values and characteristics we've seen help the community thrive so far. Let us know what you think.

**Friendliness**

Enabling a diversity of opinion is a huge part of why we are building Assembly. But, we believe in positive, constructive debate. Please try not to be a jerk. We'll try too.

**Inclusion**

This is not a developer community or a designer community or a Silicon Valley community. The more welcoming we are to everyone, the better off we'll all be.


**Education**
We all have a lot to teach, but even more to learn. Let's seek to always keep learning, and never skip an opportunity to teach someone something new.

**Fairness**

Fair distribution of ownership is baked into Assembly in many ways, but it's not always perfect. Showing respect for people's time and work in a fair way can help make Assembly a better place to build products.

**Excellence**

This doesn't mean denouncing anyone who falls short of perfection. It just means striving for excellence and helping those around you do the same.

**Transparency**

Openness is in the DNA of Assembly as a platform, and has also emerged as a core value of the community. It helps catalyze serendipity, civilize disputes, and improve progress.

**Fun**

Some of us are here to learn. Others to build large businesses that we can retire on. Others to build products that solve our own problems. No matter why you're here, we hope you have fun.

**Collaboration**

Collaboration is what makes Assembly special. Not all of us are accustomed to working in such a collaborative environment, but when we open up to it, magic can happen.



# Ideas

At its inception, a great product idea can often look like anything but a great product idea. Except in rare cases, your idea is only as strong as your execution of it. That said, there are some tactics that might help you come up with ideas, test them, and decide if they are worth pursuing.

Even the most seasoned entrepreneurs and investors know that it’s hard to predict the success of a new product. A great way to improve your chances of success is to talk about what you’re building and launch a version of it as soon as you can.

As a direct result of building Helpful in public, the team got early feedback and validation from potential customers – including ]someone who worked in customer support at Airbnb](https://assembly.com/helpful/discussions/457) for three years.

*Coming up with ideas*

Most great products are a solution to a problem. The easiest problems to solve tend to be the ones you have yourself, but you might also be able to solve other people’s problems.

It turns out that looking for problems can be much easier than looking for ideas. Anytime you notice something clunky, slow, inefficient or expensive — think about whether you could make it better with software.

[Helpful](http://assembly.com/helpful), a product on Assembly, started this way. [@RBG](http://twitter.com/ilikevests) had chosen Gmail over any of the existing support tools while building [Wufoo](http://wufoo.com), because everything else on the market was slow and bloated. He just wanted a simple support tool that worked like an inbox. So, the community built Helpful to solve Kevin’s problem.

Looking at behemoth software products can also be a great source of ideas. Sometimes, you might be able to compete with their full offering – but more often, you can pick off a small segment of their solution and do it better and cheaper than they do. This is a great way to break into a market.

In 2011, when Facebook and Twitter were both at-scale networks with photo-sharing capabilities, it might not have made much sense to launch a photo sharing service. But by focusing on sharing photos on mobile and nothing else, Instagram was able to break off a big enough piece of the social networking space that Facebook paid a billion dollars to own it.

Once you have an idea, you’ll need to be able to pitch it well.


# Names

Your product will learn to own its name even if it's a made up word. However, here are a few quick rules and questions to guide you through the process. However, all good names probably break at least one of these rules.

* Keep it short (probably 3 or fewer syllables)
* Is the .com available?
* Does it have any negative connotations/alternate meanings?
* Is the a product with a similar name in a similar industry?
* Is it easy to spell?
* Is it memorable?
* Does it represent something relevant to your product?
* Are you prepared to stick with it in the long term? (changing names is hard)

Relevant article: [New rules of naming](http://sethgodin.typepad.com/seths_blog/2005/10/the_new_rules_o.html) by Seth Godin

# Pitch

Your pitch is not just for customers — you also need to a convincing case for talented people to join in and build with you.

What are the keys to this?

*Show that you’re solving a real problem*

Demonstrating that you are solving a real problem is a great way to refine both your idea and your pitch. This could be a personal anecdote, a blog post rant that complains about the problem you solve, or a list of early customers already signed up and eager to use your service.

If your plan is to compete with an existing product by staying lean and efficient, then explain just how your idea will cost so much less than the competitors that you’ll be able to differentiate on price in a meaningful way.

*Talk about your plan*

Are you going to build for the web? Or will you be mobile-first? Why have you chosen that path? Have you chosen the platform that will make the most sense for your users given the problem you’re solving?

When do you hope to ship the beta? How will you reach your early customers?

*Challenges*

Every product faces big challenges. The best thing you can do is try to be aware of them so you can address them.

Is there a competitor who might move into the space you’re hoping to fill? Is there a complex technical challenge that you aren’t sure you’ll be able to tackle? Is your idea so new that a good amount of user education will be required?

*Clarity*

A good pitch is concise and clear. Say what you want to say in plain English, and in as few words as you can.

# Team communication

Communication is key to collaborative development.

**1. Chat**

Your product’s chat room is a perpetual forum for any discussion around the product. This is a great place to share small updates with the team, to coordinate schedules and roadmaps, to share relevant articles, or to get to know one another.

If you’re on the Core Team, it’s your responsibility to be somewhat responsive in chat. This is where newcomers will be introducing themselves, and you have the opportunity to welcome them and help find interesting work to dive into.

**2. Posts**

When a topic needs a bit more input from the community, you can write a post.

It could be about the risks/benefits of using a specific framework or technology, it could be a brainstorm around a tagline or feature name, or it could be a discussion about locking in a launch date.

**3. Meetings**

Several teams on Assembly have recently been using Hangouts on Air for a weekly planning meeting — and this has been really effective and created a noticeable increase in development speed.

Holding a meeting  can benefit your team in many ways:

* Clarification of ideas and vision
* Opportunities for differing opinions and ideas to emerge
* A chance to celebrate recent wins
* Motivating people around upcoming work
* Getting to know each other on a more personal level

Hangouts on Air is a great product for these meetings because it’s fast and easy, and the meeting is automatically recorded and uploaded to YouTube for anyone who missed the meeting. But, there are lots of other great tools out there.

**4. Blogging**

Your product’s blog is the best place to keep people in the loop on progress and planning.

Here are some ways to put great content onto the blog:

* Introduce new team members
* Acknowledge recent accomplishments
* Discuss progress
* Show your roadmap
* Talk about challenges you’ve encountered
* Embed video from team planning meetings

**5. Voting**

[need to talk about voting/governance]

# Tools

Assembly is a robust tool, offering features for collaboration, communication and growth of your business. However, there are lots of great tools available on the web that compliment Assembly well. Here are a few favorites:

[**Screenhero**](http://screenhero.com/)

Screenhero is fantastic for collaboration and pairing. It's the easiest screen-sharing product we've ever used. Rather than scheduling meetings or coordinating over email, Screenhero works like a messaging app. Just click someone's username, and they'll receive a prompt to enter screen-sharing.

We've seen the Assembly community leverage Screenhero to help ramp new people up on a product, to iterate on designs and to code side-by-side.

[**Hangouts on Air**](http://www.google.com/+/learnmore/hangouts/onair.html)

Hangouts on Air works just like Google Hangouts, with two key differences: the Hangout is broadcast live, and it is recorded and uploaded to YouTube.

The teams working on [Helpful](http://assembly.com/helpful) and [Coderwall](http://assembly.com/coderwall) have been using Hangouts on Air for weekly planning/update meetings, and it's highly effective because people who can't make the meeting can catch up via YouTube later on.

[**QuickCast**](http://quickcast.io/)

QuickCast is the easiest way to create short (3 minute) screencasts. Once you've installed their Mac app, all you have to do is open it up and press record.

Short screencasts are a really great way to dig through code, demonstrate features and UX flows, and kick off a discussion.

[**LiceCap**](http://www.cockos.com/licecap/)

We've all noticed the comeback of animated GIFs across the web, especially in the world of memes. However, GIFs are also a lean, fast way to share information. LiceCap is an easy way to make short screencasts into animated GIFs.

Whether you need to explain something in a bounty, demo features for a journal entry, or demonstrate a UI implementation, GIFs can be a fast, easy way to make screenshots more informative.
