export interface Bounty {
  id: number;
  name: string;
  totalBounty: number;
  ratePer1kViews: number;
  description: string;
  claimedBounty: number; // Amount of bounty claimed so far (calculated from submissions)
  logoUrl?: string;
  companyName?: string;
  progressPercentage?: number; // Calculated progress percentage
  totalSubmissionViews?: number; // Total views from approved submissions
  isCompleted?: boolean; // Whether the bounty is completed (views exceed total)
  submittedBy?: {
    userId: string;
    username?: string;
    email?: string;
  };
  createdAt?: string;
}

export const bounties: Bounty[] = [
  {
    id: 1,
    name: "Sushi Hat Challenge",
    totalBounty: 5000,
    ratePer1kViews: 8,
    description: "Make videos with our green sushi baseball hat on your head and get views",
    claimedBounty: 3200,
    submittedBy: {
      userId: "user_1",
      username: "sushilover",
      email: "sushi@example.com",
    },
    createdAt: "2025-10-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Gaming Setup Review",
    totalBounty: 3500,
    ratePer1kViews: 5,
    description: "Review our new gaming chair and show it in action during gameplay",
    claimedBounty: 1800,
  },
  {
    id: 3,
    name: "Fitness Tracker Unboxing",
    totalBounty: 2000,
    ratePer1kViews: 10,
    description: "Unbox and demonstrate our latest fitness tracker features",
    claimedBounty: 450,
    submittedBy: {
      userId: "user_2",
      username: "fitnessguru",
    },
    createdAt: "2025-10-18T14:20:00Z",
  },
  {
    id: 4,
    name: "Coffee Maker Morning Routine",
    totalBounty: 4200,
    ratePer1kViews: 6,
    description: "Show off our coffee maker in your morning routine videos",
    claimedBounty: 2900,
  },
  {
    id: 5,
    name: "Tech Gadget Comparison",
    totalBounty: 6000,
    ratePer1kViews: 12,
    description: "Compare our wireless earbuds with competitors in various scenarios",
    claimedBounty: 5100,
  },
  {
    id: 6,
    name: "Travel Backpack Adventure",
    totalBounty: 3800,
    ratePer1kViews: 7,
    description: "Take our travel backpack on your adventures and showcase its features",
    claimedBounty: 800,
  },
];

