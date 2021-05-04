require('dotenv').config();
require('./helpers/init_mongodb');
const path = require('path');
const express = require('express');
const createHttpError = require('http-errors');
const Document = require('./models/Document');

const app = express();
const assetRoutes = require('./routes/asset.route');
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', assetRoutes);
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});
app.use((err, req, res, next) => {
  console.log('!!!!!!!!!!!!!!!!!!!!!');
  console.log('Error: ' + err.message);
  console.log('!!!!!!!!!!!!!!!!!!!!!');
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`Server running on: ${PORT}`)
);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => {
  console.log('connected');
  socket.on('get-document', async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document.data);
    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });
    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  // console.log(id);
  if (id === null) return;
  const document = await Document.findById(id);
  // console.log(id);
  if (document) return document;
  return await Document.create({ _id: id, data: '' });
}
