import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { getEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { academicRouter } from './modules/academic/academic.routes.js';
import { attendanceRouter } from './modules/attendance/attendance.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { classRouter } from './modules/classes/class.routes.js';
import { notificationRouter } from './modules/notifications/notification.routes.js';
import { reportCardRouter } from './modules/report-cards/report-card.routes.js';
import { resultRouter } from './modules/results/result.routes.js';
import { schoolRouter } from './modules/schools/school.routes.js';
import { studentRouter } from './modules/students/student.routes.js';
import { subjectRouter } from './modules/subjects/subject.routes.js';
import { teacherPortalRouter } from './modules/teacher-portal/teacher-portal.routes.js';
import { teacherSubjectRouter } from './modules/teacher-subjects/teacher-subject.routes.js';
import { setupSwagger } from './swagger.js';

export function createApp() {
  const app = express();
  const { CORS_ORIGIN } = getEnv();

  app.use(helmet());
  app.use(
    cors({
      origin: CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'taim-api' });
  });

  setupSwagger(app);

  const v1 = express.Router();
  v1.use('/auth', authRouter);
  v1.use('/schools', schoolRouter);
  v1.use('/students', studentRouter);
  v1.use('/academic', academicRouter);
  v1.use('/classes', classRouter);
  v1.use('/subjects', subjectRouter);
  v1.use('/teacher-subjects', teacherSubjectRouter);
  v1.use('/teacher', teacherPortalRouter);
  v1.use('/attendance', attendanceRouter);
  v1.use('/results', resultRouter);
  v1.use('/report-cards', reportCardRouter);
  v1.use('/notifications', notificationRouter);

  app.use('/api/v1', v1);

  app.use(errorHandler);
  return app;
}
