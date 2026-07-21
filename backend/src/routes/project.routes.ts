import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, updateProjectStatus, deleteProject, updateProjectProgress } from '../controllers/project.controller';
import { updatePaymentTermin, createPaymentTermin, deletePaymentTermin, saveConceptPage, createScriptSegment, addScriptRow } from '../controllers/project-phase.controller';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { getUploadLinks, createUploadLink, deleteUploadLink, oembedProxy } from '../controllers/uploadLink.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// oEmbed proxy (server-side fetch untuk TikTok/YouTube/Instagram)
// Harus ditaruh di atas rute dengan parameter :id agar tidak terbaca sebagai ID
router.get('/oembed-proxy', oembedProxy);

// Phases endpoints nested under project
router.patch('/payments/:terminId', updatePaymentTermin);
router.delete('/payments/:terminId', deletePaymentTermin);
router.post('/:projectId/payments', createPaymentTermin);
router.post('/:projectId/concept', saveConceptPage);
router.post('/:projectId/scripts/segments', createScriptSegment);
router.post('/scripts/segments/:segmentId/rows', addScriptRow);

// Production Tasks
router.get('/:projectId/tasks', getTasks);
router.post('/:projectId/tasks', createTask);
router.patch('/:projectId/tasks/:taskId', updateTask);
router.delete('/:projectId/tasks/:taskId', deleteTask);

// Upload Links
router.get('/:projectId/uploads', getUploadLinks);
router.post('/:projectId/uploads', createUploadLink);
router.delete('/:projectId/uploads/:linkId', deleteUploadLink);

// Core Project CRUD (ini menggunakan :id, jadi harus paling bawah)
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.patch('/:id/status', updateProjectStatus);
router.patch('/:id/progress', updateProjectProgress);
router.delete('/:id', deleteProject);

export default router;
