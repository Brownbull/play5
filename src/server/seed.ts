import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default activities
  const defaultActivities = [
    {
      name: "Grocery Shopping",
      description: "Shopping for food and household items",
      icon: "🛒",
      isDefault: true,
    },
    {
      name: "Meal Planning",
      description: "Planning meals and cooking activities",
      icon: "🍽️",
      isDefault: true,
    },
    {
      name: "Weekend Planning",
      description: "Planning leisure and weekend activities",
      icon: "🌟",
      isDefault: true,
    },
    {
      name: "Work Projects",
      description: "Professional tasks and project management",
      icon: "💼",
      isDefault: true,
    },
    {
      name: "Personal Development",
      description: "Learning, skills, and self-improvement",
      icon: "📚",
      isDefault: true,
    },
    {
      name: "Travel Planning",
      description: "Planning trips and travel activities",
      icon: "✈️",
      isDefault: true,
    },
  ]

  // Create default tags
  const defaultTags = [
    // Shopping category
    { name: "groceries", category: "shopping", color: "#10B981" },
    { name: "to-buy", category: "shopping", color: "#10B981" },
    { name: "ingredients", category: "shopping", color: "#10B981" },
    
    // Travel category
    { name: "bucket-list", category: "travel", color: "#3B82F6" },
    { name: "to-visit", category: "travel", color: "#3B82F6" },
    { name: "restaurants", category: "travel", color: "#3B82F6" },
    
    // Cooking category
    { name: "cooking", category: "cooking", color: "#F59E0B" },
    { name: "recipes", category: "cooking", color: "#F59E0B" },
    { name: "italian", category: "cooking", color: "#F59E0B" },
    { name: "meal-prep", category: "cooking", color: "#F59E0B" },
    
    // Work category
    { name: "projects", category: "work", color: "#8B5CF6" },
    { name: "goals", category: "work", color: "#8B5CF6" },
    { name: "deadlines", category: "work", color: "#EF4444" },
    { name: "meetings", category: "work", color: "#8B5CF6" },
    
    // Learning category
    { name: "skills", category: "learning", color: "#06B6D4" },
    { name: "books", category: "learning", color: "#06B6D4" },
    { name: "courses", category: "learning", color: "#06B6D4" },
    
    // Personal category
    { name: "health", category: "personal", color: "#EC4899" },
    { name: "fitness", category: "personal", color: "#EC4899" },
    { name: "hobbies", category: "personal", color: "#EC4899" },
  ]

  console.log('🌱 Starting database seed...')

  // Seed activities
  for (const activity of defaultActivities) {
    await prisma.activity.upsert({
      where: { name: activity.name },
      update: {},
      create: activity,
    })
  }
  console.log(`✅ Created ${defaultActivities.length} default activities`)

  // Seed tags
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }
  console.log(`✅ Created ${defaultTags.length} default tags`)

  console.log('🎉 Database seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })