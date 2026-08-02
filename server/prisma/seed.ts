import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_EMAIL = "test@example.com";

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  });

  if (existingUser) {
    const projectCount = await prisma.project.count({
      where: { ownerId: existingUser.id },
    });
    const taskCount = await prisma.task.count({
      where: { project: { ownerId: existingUser.id } },
    });

    console.log("Seed data already exists — skipping insert.");
    console.log(`  User:    ${existingUser.email} (id: ${existingUser.id})`);
    console.log(`  Projects: ${projectCount}, Tasks: ${taskCount}`);
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: SEED_EMAIL,
      passwordHash,
      role: "admin",
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "TaskPilot MVP",
      description: "Seed project for verifying the database schema",
      ownerId: user.id,
      members: {
        create: { userId: user.id },
      },
      tasks: {
        create: [
          {
            title: "Set up authentication",
            description: "Implement register and login with JWT",
            status: "todo",
            priority: "high",
            assigneeId: user.id,
            dueDate: new Date("2026-08-15"),
          },
          {
            title: "Build Kanban board",
            description: "Drag-and-drop columns for todo, in progress, and done",
            status: "in_progress",
            priority: "medium",
            assigneeId: user.id,
            dueDate: new Date("2026-08-20"),
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully.");
  console.log(`  User:    ${user.email} (id: ${user.id})`);
  console.log(`  Project: ${project.name} (id: ${project.id})`);
  console.log(`  Tasks:   2 tasks created in project`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
