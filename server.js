const express = require('express');
const routes = require('./routes/index');

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use('/', routes);

app.listen(port, () => {
  console.log(`Express app listening on ${port}`);
});
