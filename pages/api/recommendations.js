export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { category, limit = 4 } = req.query;
    const aiServiceRecommendations = [
      { id: 1, name: "AI Chatbot Development", slug: "ai-chatbot-development", price: 2999, category_name: "AI Development", description: "Custom AI chatbot solutions for customer service automation", features: ["24/7 Customer Support", "Natural Language Processing", "Multi-platform Integration"], rating: 4.9, review_count: 45, duration: "2-4 weeks" },
      { id: 2, name: "Process Automation Suite", slug: "process-automation-suite", price: 4999, category_name: "Automation", description: "End-to-end business process automation using AI", features: ["Workflow Optimization", "Data Processing", "Integration APIs"], rating: 4.8, review_count: 32, duration: "3-6 weeks" }
    ];
    let filteredRecommendations = aiServiceRecommendations;
    if (category) {
      filteredRecommendations = aiServiceRecommendations.filter(service => service.category_name.toLowerCase().includes(category.toLowerCase()));
    }
    const limitedRecommendations = filteredRecommendations.slice(0, parseInt(limit));
    return res.status(200).json(limitedRecommendations);
  } catch (error) {
    console.error("Error fetching AI service recommendations:", error);
    return res.status(200).json([]);
  }
}
