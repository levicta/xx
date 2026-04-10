import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const gamesData = [
  {
    name: "Bee Swarm Simulator",
    slug: "bee-swarm-simulator",
    coverUrl: "https://cdn.roblox.com/game passes/BeeSwarmSimulator/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/BeeSwarmSimulator/icon.png",
    description: "Collect bees, make honey, and explore a massive world in this popular Roblox game.",
    categories: ["Eggs", "Honey", "Tickets", "Badges", "Boosts"],
  },
  {
    name: "Adopt Me",
    slug: "adopt-me",
    coverUrl: "https://cdn.roblox.com/game passes/AdoptMe/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/AdoptMe/icon.png",
    description: "Adopt pets, raise them, trade with other players in the ultimate virtual pet game.",
    categories: ["Pets", "Vehicles", "Toys", "Strollers", "Neons"],
  },
  {
    name: "Blox Fruits",
    slug: "blox-fruits",
    coverUrl: "https://cdn.roblox.com/game passes/BloxFruits/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/BloxFruits/icon.png",
    description: "Become a pirate, find powerful Blox Fruits, and battle your way to the top.",
    categories: ["Fruits", "Accessories", "Weapons", "Gamepasses"],
  },
  {
    name: "Pet Simulator X",
    slug: "pet-simulator-x",
    coverUrl: "https://cdn.roblox.com/game passes/PetSimulatorX/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/PetSimulatorX/icon.png",
    description: "Collect pets, unlock rare treasures, and become the ultimate pet master.",
    categories: ["Pets", "Diamonds", "Eggs", "Enchants"],
  },
  {
    name: "Murder Mystery 2",
    slug: "murder-mystery-2",
    coverUrl: "https://cdn.roblox.com/game passes/MurderMystery2/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/MurderMystery2/icon.png",
    description: "A thrilling game of murder, mystery, and deception. Who will survive?",
    categories: ["Knives", "Guns", "Godlys", "Pets"],
  },
  {
    name: "Royale High",
    slug: "royale-high",
    coverUrl: "https://cdn.roblox.com/game passes/RoyaleHigh/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/RoyaleHigh/icon.png",
    description: "Attend Royale High school, earn diamonds, and collect exclusive accessories.",
    categories: ["Diamonds", "Sets", "Accessories", "Halos"],
  },
  {
    name: "Anime Adventures",
    slug: "anime-adventures",
    coverUrl: "https://cdn.roblox.com/game passes/AnimeAdventures/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/AnimeAdventures/icon.png",
    description: "Team up with anime heroes and defend against waves of enemies in this tower defense.",
    categories: ["Units", "Gems", "Codes"],
  },
  {
    name: "King Legacy",
    slug: "king-legacy",
    coverUrl: "https://cdn.roblox.com/game passes/KingLegacy/cover.png",
    iconUrl: "https://cdn.roblox.com/game passes/KingLegacy/icon.png",
    description: "Explore a vast world, unlock powerful abilities, and become the King.",
    categories: ["Fruits", "Items", "Beli"],
  },
]

async function main() {
  console.log("Starting seed...")

  for (const gameData of gamesData) {
    const game = await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: {
        name: gameData.name,
        coverUrl: gameData.coverUrl,
        iconUrl: gameData.iconUrl,
        description: gameData.description,
      },
      create: {
        name: gameData.name,
        slug: gameData.slug,
        coverUrl: gameData.coverUrl,
        iconUrl: gameData.iconUrl,
        description: gameData.description,
      },
    })
    console.log(`Upserted game: ${game.name}`)

    for (const categoryName of gameData.categories) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, "-")
      await prisma.category.upsert({
        where: { slug_gameId: { slug, gameId: game.id } },
        update: { name: categoryName },
        create: {
          name: categoryName,
          slug,
          gameId: game.id,
        },
      })
      console.log(`  Upserted category: ${categoryName}`)
    }
  }

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
