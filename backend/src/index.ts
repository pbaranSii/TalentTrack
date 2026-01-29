import express from 'express';
import cors from 'cors';
import dictionariesRouter from './routes/dictionaries';
import clubsRouter from './routes/clubs';
import teamsRouter from './routes/teams';
import personsRouter from './routes/persons';
import playersRouter from './routes/players';
import matchesRouter from './routes/matches';
import observationsRouter from './routes/observations';
import decisionsRouter from './routes/decisions';
import invitationsRouter from './routes/invitations';
import playerParentsRouter from './routes/playerParents';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'scouting-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/dictionaries', dictionariesRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/persons', personsRouter);
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/observations', observationsRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/player-parents', playerParentsRouter);

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
