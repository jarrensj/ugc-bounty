export interface Bounty {
  id: number;
  name: string;
  totalBounty: number;
  ratePer1kViews: number;
  description: string;
}

export const bounties: Bounty[] = [
  {
    id: 1,
    name: "Sushi Hat Challenge",
    totalBounty: 5000,
    ratePer1kViews: 8,
    description: "Make videos with this sushi hat and get views",
  },
  {
    id: 2,
    name: "Gaming Setup Review",
    totalBounty: 3500,
    ratePer1kViews: 5,
    description: "Review our new gaming chair and show it in action during gameplay",
  },
  {
    id: 3,
    name: "Fitness Tracker Unboxing",
    totalBounty: 2000,
    ratePer1kViews: 10,
    description: "Unbox and demonstrate our latest fitness tracker features",
  },
  {
    id: 4,
    name: "Coffee Maker Morning Routine",
    totalBounty: 4200,
    ratePer1kViews: 6,
    description: "Show off our coffee maker in your morning routine videos",
  },
  {
    id: 5,
    name: "Tech Gadget Comparison",
    totalBounty: 6000,
    ratePer1kViews: 12,
    description: "Compare our wireless earbuds with competitors in various scenarios",
  },
  {
    id: 6,
    name: "Travel Backpack Adventure",
    totalBounty: 3800,
    ratePer1kViews: 7,
    description: "Take our travel backpack on your adventures and showcase its features",
  },
];

