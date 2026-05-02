const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to check if user is project member
const checkProjectMember = async (projectId, userId) => {
  return await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });
};

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        _count: {
          select: { members: true, tasks: true }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const membership = await checkProjectMember(id, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const membership = await checkProjectMember(id, req.user.id);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Requires project admin role' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: { name, description }
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const membership = await checkProjectMember(id, req.user.id);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Requires project admin role' });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  
  try {
    const membership = await checkProjectMember(id, req.user.id);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Requires project admin role' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingMembership = await checkProjectMember(id, userToAdd.id);
    if (existingMembership) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: role || 'MEMBER'
      }
    });

    res.status(201).json(newMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const membership = await checkProjectMember(id, req.user.id);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Requires project admin role' });
    }

    const targetMembership = await checkProjectMember(id, userId);
    if (!targetMembership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    // Check if removing the only admin
    if (targetMembership.role === 'ADMIN') {
      const adminCount = await prisma.projectMember.count({
        where: { projectId: id, role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the only project admin' });
      }
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: id, userId }
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
