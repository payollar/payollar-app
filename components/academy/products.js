export const products = [
  {
    id: "clipping",
    name: "The Clipping System",
    price: 49,
    image: "/clipping.jpg",
    alt: "Edit bay with a timeline on the monitor",
    ai: "AI Clipping Copilot",
    summary:
      "A complete system for turning long-form content into short-form clips and building a clipping business.",
    checks: ["Business roadmap", "Hooks and clip ideas", "Tools and workflow", "Outreach templates"],
    features: [
      "Clipping business setup and a step-by-step roadmap.",
      "AI content selection, hook generation, and clip ideas.",
      "Recommended clipping tools and editing workflows.",
      "Creator discovery and outreach templates.",
      "Platform-specific publishing and distribution.",
      "Monetization, client acquisition, and campaign tracking.",
      "An AI assistant that sets up the clipping workflow.",
    ],
    opener: "I have long videos. I want to start a clipping business.",
    reply:
      "Start with the roadmap. I'll pick the first long video, write three hooks, and list the tools plus the outreach you send this week.",
    replies: {
      tool: "You need the source file, an editor, captions, and a board where cuts wait for approval. I'll name the folder and the workflow for this machine.",
      sell: "The business is the week of clips you deliver. I'll draft the offer, the outreach, and a simple way to track each campaign.",
      default:
        "Tell me the length of the recording and who it is for. I'll mark the clips, write the hooks, and map where each one posts.",
    },
  },
  {
    id: "faceless",
    name: "The Faceless Content System",
    price: 59,
    image: "/design.jpg",
    alt: "Design work laid out for a content channel",
    ai: "AI Faceless Creator",
    summary: "A practical system for building and growing content channels without showing your face.",
    checks: ["Niche and positioning", "Scripts and hooks", "Voice and visuals", "Batch workflow"],
    features: [
      "Profitable niche discovery and channel positioning.",
      "AI video ideas, scripts, and hooks.",
      "Voice-over, AI visuals, and video production tools.",
      "Content repurposing and batch-production workflows.",
      "Posting schedules and audience-growth strategies.",
      "Monetization through ads, affiliates, sponsorships, and digital products.",
      "An AI assistant from idea through publication.",
    ],
    opener: "I want a channel, and I don't want to be on camera.",
    reply:
      "We'll pick a niche you can post in without your face. Then I'll write the first script, the voice-over plan, and a batch you can record in one sitting.",
    replies: {
      tool: "You need a voice, a visual style, and one editor. I'll list the voice-over and AI visual tools, then the batch workflow around them.",
      sell: "Once the channel has a rhythm, the money is ads, affiliates, sponsors, or a small digital product. I'll map which one fits this niche first.",
      default:
        "Tell me the topic and how often you can post. I'll write the next script, the hook, and where that video gets repurposed.",
    },
  },
  {
    id: "automation",
    name: "The AI Automation Blueprint",
    price: 79,
    image: "/techproduct.jpg",
    alt: "Product hardware photographed for a launch",
    ai: "AI Automation Architect",
    summary:
      "Learn how to use AI and automation to remove repetitive work and build workflows the business can run.",
    checks: ["Tasks to automate", "Workflow guides", "Make, Zapier, n8n", "Templates and prompts"],
    features: [
      "Find the repetitive tasks worth automating.",
      "Step-by-step guides for building each workflow.",
      "Tool recommendations for Make, Zapier, and n8n.",
      "AI agents, chatbots, and automated email.",
      "Ready-to-use automation templates and prompts.",
      "Use cases for sales, marketing, operations, and support.",
      "An AI assistant to design, troubleshoot, and improve workflows.",
    ],
    opener: "I keep doing the same tasks by hand. What should I automate first?",
    reply:
      "Name the task you repeat every week. I'll map the steps, pick Make, Zapier, or n8n, and draft the first workflow you can turn on.",
    replies: {
      tool: "Start with the apps you already use. I'll recommend Make, Zapier, or n8n for that stack, then the agent or email step that belongs in the flow.",
      sell: "The useful automations are the ones tied to sales, marketing, operations, or support. Tell me which desk hurts and I'll design that workflow.",
      default:
        "Describe the task in the order you do it now. I'll turn that into a workflow, a prompt, and the first place it can break.",
    },
  },
  {
    id: "product",
    name: "Build Your First Digital Product",
    price: 69,
    image: "/design2.jpg",
    alt: "Layout work for a product page",
    ai: "AI Product Builder",
    summary: "A guided system for turning a skill or an idea into a digital product people can buy.",
    checks: ["Idea validation", "Product structure", "Pricing and offer", "Sales page"],
    features: [
      "Idea validation and audience research.",
      "Product selection across templates, guides, toolkits, and courses.",
      "Structure, content planning, and creation help.",
      "AI worksheets, templates, and supporting resources.",
      "Pricing, positioning, and offer development.",
      "Sales page and checkout setup.",
      "Launch strategy and promotional content.",
      "An AI assistant from the idea to a launch-ready product.",
    ],
    opener: "People ask me about this skill. I don't have a product yet.",
    reply:
      "We'll check the idea against the people who already ask. Then I'll pick the format, outline the product, and draft the price and the sales page.",
    replies: {
      tool: "You need the outline, the worksheets, and a page with a price. I'll draft the structure and the templates buyers use on day one.",
      sell: "Price it for the result, not the page count. I'll write the offer, the checkout notes, and the posts for launch week.",
      default:
        "Tell me the skill and who keeps asking for it. I'll choose the format, outline the modules, and write the first page of the offer.",
    },
  },
  {
    id: "monetization",
    name: "The Creator Monetization Playbook",
    price: 89,
    image: "/content.jpeg",
    alt: "Creator photographed for a brand kit",
    ai: "AI Monetization Strategist",
    summary: "A system for turning content, an audience, and skills into more than one way to get paid.",
    checks: ["Revenue map", "Outreach templates", "Media kit and rates", "Funnels and tracking"],
    features: [
      "A monetization strategy based on audience and niche.",
      "Sponsorships, affiliates, services, and digital products.",
      "Brand partnership and outreach templates.",
      "Media kit and rate-card guidance.",
      "Digital product and offer recommendations.",
      "Sales funnels, email, and conversion.",
      "Revenue planning and performance tracking.",
      "An AI assistant for the opportunities and the roadmap.",
    ],
    opener: "I post, and I only have one way to get paid.",
    reply:
      "Tell me your niche and what people already ask you for. I'll map sponsors, affiliates, services, and a product, then write the first outreach.",
    replies: {
      tool: "You need a media kit, a rate for one post and one for a week, and a list of brands that fit. I'll draft the kit and the rate card from the work you already posted.",
      sell: "We'll stack sponsorships, affiliates, a service, and a product instead of betting on one of them. I'll write the funnel and a simple way to track what closes.",
      default:
        "Send the niche and the size of the audience. I'll mark the revenue streams that fit, the outreach to send, and the number to watch this month.",
    },
  },
];

export function replyFor(product, text) {
  const value = text.toLowerCase();
  if (value.includes("tool") || value.includes("need") || value.includes("setup") || value.includes("workflow")) {
    return product.replies.tool;
  }
  if (
    value.includes("sell") ||
    value.includes("price") ||
    value.includes("money") ||
    value.includes("monet") ||
    value.includes("client") ||
    value.includes("sponsor")
  ) {
    return product.replies.sell;
  }
  return product.replies.default;
}
