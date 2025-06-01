/**
 * Team Members API Endpoint
 * Provides team member data for the About page
 */

// Sample team data - in production, this would come from a database
const teamMembers = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "AI Research Director",
    bio: "Leading expert in machine learning and neural networks with 15+ years of experience in AI research and development. Dr. Chen holds a PhD in Computer Science from MIT and has published over 50 papers in top-tier AI conferences.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/sarah-chen-ai",
    email: "sarah.chen@digiclick.ai",
    specialties: ["Machine Learning", "Neural Networks", "Computer Vision", "NLP"],
    education: "PhD Computer Science, MIT",
    experience: "15+ years"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Automation Architect",
    bio: "Specializes in creating intelligent automation systems that transform business operations and increase efficiency. Marcus has led automation projects for Fortune 500 companies, resulting in 40% average efficiency improvements.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/marcus-rodriguez-automation",
    email: "marcus.rodriguez@digiclick.ai",
    specialties: ["Process Automation", "RPA", "Workflow Optimization", "System Integration"],
    education: "MS Industrial Engineering, Stanford",
    experience: "12+ years"
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "UX/AI Designer",
    bio: "Combines human-centered design principles with AI capabilities to create intuitive and engaging user experiences. Emily's designs have won multiple UX awards and have been featured in leading design publications.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/emily-watson-ux",
    email: "emily.watson@digiclick.ai",
    specialties: ["UX Design", "AI Interface Design", "User Research", "Prototyping"],
    education: "MFA Design, RISD",
    experience: "10+ years"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Full-Stack Developer",
    bio: "Expert in modern web technologies and AI integration, building scalable applications that leverage cutting-edge AI. David has architected systems serving millions of users and has contributed to several open-source AI projects.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/david-kim-fullstack",
    email: "david.kim@digiclick.ai",
    specialties: ["Full-Stack Development", "AI Integration", "Cloud Architecture", "DevOps"],
    education: "BS Computer Science, UC Berkeley",
    experience: "8+ years"
  },
  {
    id: 5,
    name: "Dr. Aisha Patel",
    role: "Data Science Lead",
    bio: "Transforms complex data into actionable insights using advanced analytics and machine learning. Dr. Patel has helped organizations unlock millions in value through data-driven decision making and predictive modeling.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/aisha-patel-datascience",
    email: "aisha.patel@digiclick.ai",
    specialties: ["Data Science", "Predictive Analytics", "Statistical Modeling", "Big Data"],
    education: "PhD Statistics, Harvard",
    experience: "12+ years"
  },
  {
    id: 6,
    name: "James Thompson",
    role: "DevOps Engineer",
    bio: "Ensures reliable, scalable, and secure deployment of AI applications. James has built CI/CD pipelines that have reduced deployment time by 80% and improved system reliability to 99.9% uptime.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/james-thompson-devops",
    email: "james.thompson@digiclick.ai",
    specialties: ["DevOps", "Cloud Infrastructure", "Kubernetes", "Security"],
    education: "BS Information Systems, Georgia Tech",
    experience: "9+ years"
  }
];

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetTeam(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Team API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET request for team members
 */
function handleGetTeam(req, res) {
  const { 
    page = 1, 
    limit = 10, 
    role, 
    search,
    detailed = false 
  } = req.query;

  try {
    let filteredTeam = [...teamMembers];

    // Filter by role if specified
    if (role) {
      filteredTeam = filteredTeam.filter(member => 
        member.role.toLowerCase().includes(role.toLowerCase())
      );
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTeam = filteredTeam.filter(member =>
        member.name.toLowerCase().includes(searchTerm) ||
        member.role.toLowerCase().includes(searchTerm) ||
        member.bio.toLowerCase().includes(searchTerm) ||
        member.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedTeam = filteredTeam.slice(startIndex, endIndex);

    // Remove sensitive data if not detailed request
    const responseTeam = paginatedTeam.map(member => {
      if (detailed === 'true') {
        return member;
      } else {
        // Return basic info only
        const { email, ...publicInfo } = member;
        return publicInfo;
      }
    });

    // Response metadata
    const totalMembers = filteredTeam.length;
    const totalPages = Math.ceil(totalMembers / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      data: {
        items: responseTeam,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalMembers,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          role: role || null,
          search: search || null
        }
      },
      message: `Retrieved ${responseTeam.length} team members`
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch team members',
      message: error.message
    });
  }
}

/**
 * Get team member by ID
 */
export function getTeamMemberById(id) {
  return teamMembers.find(member => member.id === parseInt(id));
}

/**
 * Get team members by role
 */
export function getTeamMembersByRole(role) {
  return teamMembers.filter(member => 
    member.role.toLowerCase().includes(role.toLowerCase())
  );
}

/**
 * Get team statistics
 */
export function getTeamStats() {
  const roles = [...new Set(teamMembers.map(member => member.role))];
  const avgExperience = teamMembers.reduce((acc, member) => {
    const years = parseInt(member.experience.match(/\d+/)[0]);
    return acc + years;
  }, 0) / teamMembers.length;

  return {
    totalMembers: teamMembers.length,
    roles: roles.length,
    avgExperience: Math.round(avgExperience),
    specialties: [...new Set(teamMembers.flatMap(member => member.specialties))].length
  };
}
