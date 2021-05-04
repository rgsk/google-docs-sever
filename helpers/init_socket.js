const Document = require('../models/Document');
module.exports = (server) => {
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
};

async function findOrCreateDocument(id) {
  // console.log(id);
  if (id === null) return;
  const document = await Document.findById(id);
  // console.log(id);
  if (document) return document;
  return await Document.create({ _id: id, data: '' });
}
