import express from 'express';
import ENVIRONMENT from './config/environment';

const PORT = +(ENVIRONMENT.PORT ?? 3001);

const app = express();

app.listen(PORT, () => {
  console.log(`Sever are running @ ${PORT}`);
});
