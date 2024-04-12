import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Ganti dengan URL aplikasi Next.js Anda
        method: ['GET', 'POST']// beberapa browser lama memerlukan ini
      }
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});


app.use(cors());


io.on('connection', (socket) => {
    // Mendengarkan pesan dari klien
    socket.on('pesanDariKlien', (body) => {
        // Mengirim pesan kembali hanya ke pengirim
        const data = { count: body.count + 1, chapter: body.chapter }
        io.to(socket.id).emit('pesanDariServer', data);
    });

    
    socket.on('joinRoom', (data) => {
      socket.join(data.currentVideo);
    });

    socket.on('message', (data) => {
      socket.join(data.currentVideo);
      if(data.message) {
        return io.to(data.currentVideo).emit('chat', data);
      }

      const isLike = data.actionSocket.like.includes(data.user)
      const isDislike = data.actionSocket.dislike.includes(data.user)
      const { like, dislike, id } = data.actionSocket
     
      if(isLike && data.like) {
        const newdata = data.actionSocket.like.filter(likeValue => likeValue !== data.user);
        return io.to(data.currentVideo).emit('action', { id, like: newdata, dislike});
      }

      if(isDislike && data.dislike) {
        const newdata = data.actionSocket.dislike.filter(likeValue => likeValue !== data.user);
        return io.to(data.currentVideo).emit('action', { id, like, dislike: newdata});
      }

      if(!isLike && data.like) {
        const newdata = [...data.actionSocket.like, data.user]
        console.log();
        return io.to(data.currentVideo).emit('action', { id, like:newdata, dislike});
      }

      if(!isDislike && data.dislike) {
        const newdata = [...data.actionSocket.dislike, data.user]
        return io.to(data.currentVideo).emit('action', { id, like, dislike:newdata});
      }

    });
    // socket.offAny()
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
