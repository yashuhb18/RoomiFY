import { PrismaClient, Role, TaskType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Activity Hub tasks and achievements...');

  const tasks = [
    // Student AUTO tasks
    { slug: 'daily-login', name: 'Daily Login', description: 'Log in to RoomiFY', credits: 5, taskType: TaskType.AUTO, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '📱' },
    { slug: 'pay-fees', name: 'Pay Hostel Fees', description: 'Complete a fee payment', credits: 50, taskType: TaskType.AUTO, cooldownHours: 720, roleTarget: Role.STUDENT, emoji: '💰' },
    { slug: 'report-maintenance', name: 'Report Maintenance', description: 'Submit a maintenance ticket', credits: 10, taskType: TaskType.AUTO, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '🔧' },
    { slug: '7-day-attendance', name: '7-Day Attendance', description: 'Maintain 7-day attendance streak', credits: 15, taskType: TaskType.AUTO, cooldownHours: 168, roleTarget: Role.STUDENT, emoji: '📅' },
    { slug: 'zero-complaints', name: 'Zero Complaints Month', description: 'No complaints for 30 days', credits: 20, taskType: TaskType.AUTO, cooldownHours: 720, roleTarget: Role.STUDENT, emoji: '✨' },
    { slug: 'submit-feedback', name: 'Submit Feedback', description: 'Provide hostel feedback', credits: 5, taskType: TaskType.AUTO, cooldownHours: 168, roleTarget: Role.STUDENT, emoji: '📝' },
    { slug: 'good-behavior-30d', name: 'Good Behavior (30 Days)', description: 'Maintain good behavior for 30 days', credits: 100, taskType: TaskType.AUTO, cooldownHours: 720, roleTarget: Role.STUDENT, emoji: '🌟' },
    { slug: 'refer-friend', name: 'Refer a Friend', description: 'Refer a friend to the hostel', credits: 100, taskType: TaskType.AUTO, cooldownHours: 0, roleTarget: Role.STUDENT, emoji: '🤝' },

    // Student VERIFIED tasks
    { slug: 'clean-room', name: 'Clean Room Inspection', description: 'Pass a room cleanliness inspection', credits: 25, taskType: TaskType.VERIFIED, cooldownHours: 168, roleTarget: Role.STUDENT, emoji: '🧹' },
    { slug: 'help-student', name: 'Help Another Student', description: 'Help a fellow student', credits: 30, taskType: TaskType.VERIFIED, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '🤗' },
    { slug: 'participate-event', name: 'Participate in Event', description: 'Participate in a hostel event', credits: 20, taskType: TaskType.VERIFIED, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '🎉' },
    { slug: 'join-committee', name: 'Join Hostel Committee', description: 'Join the hostel committee', credits: 200, taskType: TaskType.VERIFIED, cooldownHours: 8760, roleTarget: Role.STUDENT, emoji: '🏛️' },

    // Warden AUTO tasks
    { slug: 'approve-listing', name: 'Approve Listing', description: 'Approve a marketplace listing', credits: 10, taskType: TaskType.AUTO, cooldownHours: 1, roleTarget: Role.WARDEN, emoji: '✅' },
    { slug: 'verify-clean-room', name: 'Verify Clean Room', description: 'Verify a student room inspection', credits: 5, taskType: TaskType.AUTO, cooldownHours: 1, roleTarget: Role.WARDEN, emoji: '🔍' },
    { slug: 'resolve-complaint', name: 'Resolve Complaint', description: 'Resolve a student complaint', credits: 20, taskType: TaskType.AUTO, cooldownHours: 1, roleTarget: Role.WARDEN, emoji: '🛠️' },
    { slug: 'maintain-cleanliness', name: 'Maintain Cleanliness >90%', description: 'Keep hostel cleanliness above 90%', credits: 50, taskType: TaskType.AUTO, cooldownHours: 720, roleTarget: Role.WARDEN, emoji: '🏠' },
    { slug: 'student-satisfaction', name: 'Student Satisfaction >80%', description: 'Achieve >80% student satisfaction', credits: 100, taskType: TaskType.AUTO, cooldownHours: 720, roleTarget: Role.WARDEN, emoji: '😊' },
    { slug: 'organize-event', name: 'Organize Event', description: 'Organize a hostel event', credits: 100, taskType: TaskType.AUTO, cooldownHours: 168, roleTarget: Role.WARDEN, emoji: '🎪' },
    { slug: 'submit-report', name: 'Submit Report', description: 'Submit a hostel report', credits: 50, taskType: TaskType.AUTO, cooldownHours: 168, roleTarget: Role.WARDEN, emoji: '📊' },
    { slug: 'warden-daily-attendance', name: 'Daily Attendance', description: 'Mark daily attendance', credits: 5, taskType: TaskType.AUTO, cooldownHours: 24, roleTarget: Role.WARDEN, emoji: '📋' },
    { slug: 'good-performance-3m', name: 'Good Performance (3 Months)', description: 'Maintain good performance for 3 months', credits: 200, taskType: TaskType.AUTO, cooldownHours: 2160, roleTarget: Role.WARDEN, emoji: '🏅' },
  ];

  const achievements = [
    { slug: 'streak-7', name: '7-Day Streak', description: 'Log in for 7 consecutive days', emoji: '🔥', criteria: { type: 'tasks_count', threshold: 7 } },
    { slug: 'tasks-50', name: '50 Tasks Complete', description: 'Complete 50 tasks', emoji: '⭐', criteria: { type: 'tasks_count', threshold: 50 } },
    { slug: 'tasks-100', name: '100 Tasks Complete', description: 'Complete 100 tasks', emoji: '💪', criteria: { type: 'tasks_count', threshold: 100 } },
    { slug: 'credits-500', name: '500 Credits Earned', description: 'Earn a total of 500 credits', emoji: '🏆', criteria: { type: 'credits_total', threshold: 500 } },
    { slug: 'credits-1000', name: '1000 Credits Earned', description: 'Earn a total of 1000 credits', emoji: '🌟', criteria: { type: 'credits_total', threshold: 1000 } },
    { slug: 'diamond-tier', name: 'Diamond Tier', description: 'Reach Diamond tier', emoji: '👑', criteria: { type: 'tier_reached', tier: 'DIAMOND' } },
    { slug: 'top-5', name: 'Top 5 Leaderboard', description: 'Reach top 5 on the leaderboard', emoji: '🏅', criteria: { type: 'leaderboard_top', threshold: 5 } },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { slug: task.slug },
      create: task,
      update: task,
    });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      create: achievement,
      update: achievement,
    });
  }

  console.log(`Successfully seeded ${tasks.length} tasks and ${achievements.length} achievements!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
