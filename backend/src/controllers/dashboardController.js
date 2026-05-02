const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true }
    });
    
    const projectIds = memberships.map(m => m.projectId);

    if (projectIds.length === 0) {
      return res.json({
        totalTasks: 0,
        byStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
        overdueTasks: [],
        myAssignedTasks: [],
        projectSummaries: []
      });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    });

    const totalTasks = tasks.length;
    
    const byStatus = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };

    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');

    const myAssignedTasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      orderBy: { dueDate: 'asc' }
    });

    const projectSummariesData = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          where: { status: 'DONE' },
          select: { id: true }
        }
      }
    });

    const projectSummaries = projectSummariesData.map(p => ({
      projectId: p.id,
      name: p.name,
      taskCount: p._count.tasks,
      doneCount: p.tasks.length
    }));

    res.json({
      totalTasks,
      byStatus,
      overdueTasks,
      myAssignedTasks,
      projectSummaries
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboard
};
