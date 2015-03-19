var Accordion = require('./ui/accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var Tile = require('./ui/tile.js.jsx')
var Button = require('./ui/button.js.jsx')
var Jumbotron = require('./ui/jumbotron.js.jsx')

var StartPage = React.createClass({

  propTypes: {
    productsStarted: React.PropTypes.number,
    productsWorked: React.PropTypes.number,
    mastheadUrl: React.PropTypes.string
  },

  render: function() {
    var background = 'linear-gradient(160deg, rgba(255, 232, 80, .8), rgba(26, 88, 131, .85) 70%), url(' + this.props.mastheadUrl + ')';
    return (
      <div className="mt0 mb3">
        <div className="masthead" style={{background: background, paddingTop: 0}}>
          <div className="masthead-title p4">
            <div className="clearfix">
              <h1 className="col-8 mx-auto center white">Turn your idea into a great product with people around the world</h1>
            </div>
          </div>
        </div>

        <div className="container center">
          <ul className="list list-steps hidden-xs hidden-sm">
            <li className="overlay" />

            <li>
              <div className="step active">1</div>
              <div className="body">
                <strong>Share your idea</strong>
                <div className="gray-2">Every great product begins with an idea.</div>
              </div>
            </li>
            <li>
              <div className="step">2</div>
              <div className="body">
                <strong>Find collaborators</strong>
                <div className="gray-2">Assemble a founding team.  Own what you make.</div>
              </div>
            </li>
            <li>
              <div className="step">3</div>
              <div className="body">
                <strong>Build a product</strong>
                <div className="gray-2">Create something beautiful with the help of the community.</div>
              </div>
            </li>
            <li>
              <div className="step">4</div>
              <div className="body">
                <strong>Launch it</strong>
                <div className="gray-2">Grow a real business from what you've built.</div>
              </div>
            </li>

            <li className="overlay" />
          </ul>
          <div className="row visible-sm visible-xs">
            <div className="col-xs-8 col-xs-offset-2">
              <ul className="list-reset text-large center">
                <li className="p2">
                  <strong>Submit your idea</strong>
                  <div className="gray-2">Every great product begins with an idea</div>
                </li>
                <li className="p2">
                  <strong>Recruit a team</strong>
                  <div className="gray-2">Work with talented people and distribute ownership</div>
                </li>
                <li className="p2">
                  <strong>Lay the foundation</strong>
                  <div className="gray-2">First steps to making something amazing</div>
                </li>
                <li className="p2">
                  <strong>Build a product</strong>
                  <div className="gray-2">Create something beautiful.</div>
                </li>
                <li className="p2">
                  <strong>Grow</strong>
                  <div className="gray-2">Scale it to the moon</div>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-large center" style={{padding: '60px 30px', fontSize: 20}}>
            <div className="mb3">
              <Button type="primary" action="/ideas/new">
                Start an idea
              </Button>
            </div>
            <div className="visible-xs mt3" />
            <div className="mb3">
              Already have a product and want to migrate it to Assembly?&nbsp;
              <a href="mailto:assembly@helpful.io" data-helpful="assembly">Contact Us</a>
            </div>
          </div>
        </div>
        <hr style={{marginBottom: 0}} />
        <div className="container center">
          <div className="row">
            <div className="col-xs-6 col-sm-2" />
            <div className="col-xs-12 col-sm-4" style={{padding: '50px 40px', borderRight: '1px solid #eee'}}>
              <h1 style={{fontSize: 80, lineHeight: 1, margin: 0}}>4MM</h1>
              <h2 className="mt0">People</h2>
              <p className="gray-2">4+ million people this year have used the products being built on Assembly.</p>
            </div>
            {/* <div class="col-xs-12 col-sm-4" style="padding: 50px 40px; border-left: 1px solid #eee; border-right: 1px solid #eee">
      <h1 style="font-size: 80px; line-height: 1; margin: 0"></h1>
      <h2 style="font-weight: lighter; margin-top: 0">In Profits Paid Out</h1>
      <p class="gray-2">Over has been paid out to Assembly App Coin holders.</p>
    </div> */}
            <div className="col-xs-12 col-sm-4" style={{padding: '50px 40px'}}>
              <h1 style={{fontSize: 80, lineHeight: 1, margin: 0}}>{this.props.productsWorked}</h1>
              <h2 className="mt0">Products</h2>
              <p className="gray-2">{this.props.productsStarted} products started on Assembly. <br />{this.props.productsWorked} products currently being built.</p>
            </div>
            <div className="col-xs-6 col-sm-2" />
          </div>
        </div>
        <hr style={{marginTop: 0}} />
        <div className="container-fluid" style={{background: '#fff no-repeat center bottom'}}>
          <div className="container" style={{paddingBottom: 80}}>
            {/*Why start a product on Assembly? */}
            {/* <div class="row">
      <div class="col-xs-12 center">
        <h1 style="font-size: 48px">Think big and go far, together on Assembly</h1>
      </div>
    </div> */}
            <div className="row">
              <div className="col-xs-12 col-sm-12 center">
                {/* <hr> */}
                {/* <h2 style="font-size: 32px; font-weight: lighter">And you wondered what the community thinks?</h2> */}
                <div className="row">
                  <div className="col-xs-6 col-sm-6">
                    <div>
                      <div style={{margin: '35px 0 20px 0'}}>
                        <div className="avatar-comment" style={{background: 'url("https://gravatar.com/avatar/4f731655f6de1f6728c716448e0ba634?d=https%3A%2F%2Fassembly.com%2Fassets%2Fdefault_avatar.png&s=170")'}} />
                      </div>
                      <em className="gray-2" style={{fontSize: 18, lineHeight: '1.2'}}>Assembly has been fantastic for providing a new venue to collaborate on <a href="<%= product_path(Product.find_by(slug: 'buckets')) %>">Buckets</a>. I love the variety of contributions we receive and overall being able to share our product’s development so openly!</em>
                      <br />
                      <div style={{marginTop: 10}}>
                        <strong>David Kaneda - UX Designer</strong>
                        <br />
                        <span className="gray-2">@davidkaneda</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-6 col-sm-6">
                    <div>
                      <div style={{margin: '35px 0 20px 0'}}>
                        <div className="avatar-comment" style={{background: 'url("https://gravatar.com/avatar/0231c6b98cf90defe76bdad0c3c66acf?d=https%3A%2F%2Fassembly.com%2Fassets%2Fdefault_avatar.png&s=170")'}} />
                      </div>
                      <em className="gray-2" style={{fontSize: 18, lineHeight: '1.2'}}>I choose what to work on and when I work on it. For each product, the idea, direction, and vision are all driven by the people who make it. That’s a really powerful idea.</em>
                      <br />
                      <div style={{marginTop: 10}}>
                        <strong>Chelsea Otakan - Interface Designer</strong>
                        <br />
                        <span className="gray-2">@chexee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="mt0" />
        <div className="container-fluid" style={{background: '#fff url(<%= image_url "section-gradient.png" %>) no-repeat center bottom'}}>
          <div className="container">
            <div className="center">
              <h1 style={{fontSize: 48}}>An entirely new way to create the next great software product</h1>
            </div>
            <div className="row">
              <div className="col-xs-2 col-xs-offset-5">
                <hr />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-8 col-sm-offset-2 center">
                <h2 style={{fontSize: 32}}>Smart Questions Answered</h2>
                <p className="lead gray-2">An outside-the-box platform for launching your product deserves some thoughtful questions ‐ these are our thoughtful answers.</p>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                <div className="panel-group">
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#why-not-just-do-open-source" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Why not just do open source?
                        </a>
                      </p>
                    </div>
                    <div id="why-not-just-do-open-source" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>Open source is great. Assembly products are built with OSS. What’s unique about Assembly is that it allows you to collaborate on real products your colleagues (and mom) can use with people all around the world and then monetize them. Thanks internets!</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#what-is-assemblys-fee" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          How does Assembly make money?
                        </a>
                      </p>
                    </div>
                    <div id="what-is-assemblys-fee" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>
                          Assembly collects a 10% platform fee of the revenue after expenses. This is initially used to cover basic operating costs until a product’s revenue exceeds costs. Any proceeds after expenses are distributed to coin holders based on their app coins percentages. You can see <a href="https://assembly.com/coderwall/financials">Coderwall</a> as an example of a mature product paying out in this model.
                        </p>
                        <p>
                          We care deeply that we’re creating more value for the community than the 10% collected as a platform fee. Building on Assembly not only connects you with others around the world, but you also can build products with the freedom of not having to hand initial capital to run the product, managing the finances, paying accounting and legal costs and all the other burdens of operating a traditional company. We’re also investing in continuing to find ways to create new value for the community as well as exploring ways to reduce fees if feasible.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#who-pays-for-hosting-the-product" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Who pays for hosting the product?
                        </a>
                      </p>
                    </div>
                    <div id="who-pays-for-hosting-the-product" className="panel-collapse collapse collapse">
                      <div className="panel-body">
                        <p>Assembly will cover these basic costs before a product launches. At times members of the community will pay for them too. In any case, these expenditures will be tracked and reimbursed when the product earns profits.</p>
                        <p>Once a product is live and earning revenue, monthly costs are paid before community earnings are distributed.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#who-owns-the-intellectual-property" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Who owns the intellectual property?
                        </a>
                      </p>
                    </div>
                    <div id="who-owns-the-intellectual-property" className="panel-collapse collapse collapse">
                      <div className="panel-body">
                        <p>You do. However, all products on Assembly are licensed under AGPL, and by agreeing to our terms of service you also are granting non-exclusive rights to Assembly to monetize this IP on behalf of the community (and you).</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#can-an-existing-product-be-moved-to-assembly" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Can an existing product be moved to Assembly?
                        </a>
                      </p>
                    </div>
                    <div id="can-an-existing-product-be-moved-to-assembly" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>Yes. Usually in this case, we’ll work with you to "pre-allocate" a fair number of app coins representing  your ownership (and anyone else who built the product with you). Like all products, you’ll start with 100% ownership but additional development you accept by the community will dilute ownership. If you have more questions about this, reach out to <a href="mailto:support@assembly.com">support@assembly.com</a></p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#can-a-product-leave-assembly" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Can a product leave Assembly?
                        </a>
                      </p>
                    </div>
                    <div id="can-a-product-leave-assembly" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>Generally no. Assembly is not an incubator. We’re focused on enabling the distributed Assembly community to both build and continue to grow successful products. An important part of this is that anyone can come help build any product, with full trust that their work (if accepted) will be rewarded with an ownership stake in that product that will translate to a portion of any future revenue.</p>
                        <p>In order for Assembly to ensure that the community’s work is rewarded in perpetuity, products being built on Assembly need to stay on Assembly. An exception to this is if the partners agreed to sell the product to an acquiring company.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xs-12 col-sm-6">
                <div className="panel-group">
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#no-interest-generated" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          What if I start an idea here and no one is interested?
                        </a>
                      </p>
                    </div>
                    <div id="no-interest-generated" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>You are always free to keep building and keep trying on Assembly – so there’s no point at which you could no longer keep trying. If nobody earns App Coins in your product, you are free to take it elsewhere, but once people have earned ownership in your product, it has to live on in the Assembly community.</p>
                        <p>In some cases, products sat for months with little interest before suddenly picking up momentum in the community. Your product could follow that trajectory.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#can-a-product-be-sold" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Can a product be sold?
                        </a>
                      </p>
                    </div>
                    <div id="can-a-product-be-sold" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>Yes. If a third-party offers to acquire an Assembly product and the partners (everyone with ownership stake) decide it is the right decision for the community, the customers and the product, then a product can be sold.</p>
                        <p>When a product is sold, earnings are treated like any other revenue and are paid out to the community.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#will-product-make-money" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          In what ways can a product make money?
                        </a>
                      </p>
                    </div>
                    {/* TODO: (pletcher) This response doesn't address the question */}
                    <div id="will-product-make-money" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>We deliberately leave the roadmap up to each product’s Core Team. We urge and help products to outline clear ways to monetizing the product. You’ll find most products have these roadmaps in their discussions or plainly stated on their product pages.
                        </p>
                        <p>
                          Sometimes a product solves a problem but it is unclear how it would make revenue today. These products can also be built on Assembly.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#hiring-employees" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          How do I hire employees down the road?
                        </a>
                      </p>
                    </div>
                    <div id="hiring-employees" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>In lots of cases, people are using bounties on Assembly for things that you might think you need to hire an employee for. For example, someone might put in 4 hours per week responding to support emails, and earn a flat number of App Coins for that work.</p>
                        <p>Additionally, once your product is earning money you can spend it as you please – which might mean hiring contract employees.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel panel-subtle">
                    <div className="panel-heading">
                      <p className="panel-title">
                        <a href="#how-much-of-my-product-do-I-own" data-toggle="collapse" style={{display: 'block'}}>
                          <span className="glyphicon glyphicon-chevron-down small pull-right" style={{marginTop: 5}} />
                          Why do I only start with 5% of the App Coins of my product?
                        </a>
                      </p>
                    </div>
                    <div id="how-much-of-my-product-do-I-own" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>You actually get 100% at the start. The 500,000 App Coins we start you off with are 100% of the allocated coins at that point, but 5% of the available coins. As new ones are awarded, each coin will be worth a smaller percentage of the product.</p>
                        <p>But, typically the person who submits the idea is highly active in planning and building it, so you will continue to earn App Coins throughout the process.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-large" style={{padding: '60px 30px', fontSize: 20}}>
              <Button type="primary" action="/ideas/new">
                Start an idea
              </Button>
              <div className="visible-xs mt3" />
              <div className="pull-right mb3">
                Already have a product and want to migrate it to Assembly?&nbsp;
                <a href="mailto:assembly@helpful.io" data-helpful="assembly">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
        <hr style={{marginTop: 0, marginBottom: 0}} />
      </div>
    );
  }
});

module.exports = StartPage;
