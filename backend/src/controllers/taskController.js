const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkProjectMember = async (projectId, userId) => {
  return await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });
};

const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { status, assigneeId, priority } = req.query;

  try {
    const membership = await checkProjectMember(projectId, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    const where = { projectId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assigneeId, dueDate, priority, status } = req.body;

  try {
    const membership = await checkProjectMember(projectId, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    if (assigneeId) {
      const assigneeMembership = await checkProjectMember(projectId, assigneeId);
      if (!assigneeMembership) {
        return res.status(400).json({ error: 'Assignee is not a member of this project' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        projectId,
        creatorId: req.user.id
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const membership = await checkProjectMember(task.projectId, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const membership = await checkProjectMember(task.projectId, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    let dataToUpdate = {};

    if (membership.role === 'ADMIN') {
      dataToUpdate = { title, description, status, priority, dueDate: dueDate ? new Date(dueDate) : undefined, assigneeId };
      if (assigneeId) {
        const assigneeMembership = await checkProjectMember(task.projectId, assigneeId);
        if (!assigneeMembership) {
          return res.status(400).json({ error: 'Assignee is not a member of this project' });
        }
      }
      
      // Clean undefined keys
      Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);
      
    } else {
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this task' });
      }
      
      // Member can ONLY update status
      const allowedKey = 'status';
      const requestKeys = Object.keys(req.body);
      const isOnlyStatus = requestKeys.every(k => k === allowedKey);
      
      if (!isOnlyStatus && requestKeys.length > 0) {
          return res.status(403).json({ error: 'Members can only update task status' });
      }
      if (status !== undefined) {
          dataToUpdate = { status };
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const membership = await checkProjectMember(task.projectId, req.user.id);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Requires project admin role' });
    }

    await prisma.task.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask
};
