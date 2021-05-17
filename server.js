const io = require('socket.io')(process.env.PORT || 3000, {
   cors: {
      origin: process.env.FRONT_URI || "http://localhost:4200",
      methods: ['GET', 'POST']
   }
});

const defaultValue = "";
let vereadoresLogados = [];
let pediramPalavra = [];
let jaFalaram = [];
let sessaoAtual = {
   id: 1,
   titulo: "SESSÃO ORDINÁRIA 0051/2021",
   evento: "",
   status: "",
   espaco: "ORDEM DO DIA",
   projeto: ""
};

io.on('connection', socket => {
   
   socket.on('get-vereador-status', (vereador) => {
      let presente = (vereadoresLogados.indexOf(vereador+'') >= 0);
      let pediuPalavra = (pediramPalavra.indexOf(vereador+'') >= 0);
      let jaFalou = (jaFalaram.indexOf(vereador+'') >= 0);

      socket.emit('status-vereador', {id: vereador, presente, voto: '', impedido: false, pediuPalavra, jaFalou});
   });

   socket.on('get-sessao-status', () => {
      socket.emit('status-sessao', sessaoAtual);
   });

   socket.on('init-resultado-votacao', () => {
      socket.broadcast.emit('resultado-votacao', {action: 'START', status: 'APROVADO', favoraveis: 9, contrarios: 5, impedidos: 1, ausentes: 6, abstidos: 0, projeto: "Projeto de lei 0001/2021"});
   });

   socket.on('init-discussao', () => {
      sessaoAtual.status = 'DISCUSSAO';
      socket.broadcast.emit('inicia-discussao', {status: "DISCUSSAO"});
   });

   socket.on('pedido-palavra', (vereador) => {
      
      if (pediramPalavra.indexOf(vereador+'') < 0) {
         pediramPalavra.push(vereador);
      } 

      socket.broadcast.emit('pediu-palavra', {id: vereador, pediuPalavra: true});
   });

   socket.on('concessao-palavra', (vereador) => {
      
      pediramPalavra.splice(pediramPalavra.indexOf(vereador+''), 1)
      jaFalaram.push(vereador);

      socket.broadcast.emit('conceder-palavra', {id: vereador, projeto: "SESSÃO ORDINÁRIA 0051/2021"});
   });


   socket.on('finish-resultado-votacao', () => {
      socket.broadcast.emit('resultado-votacao', {action: 'FINISH'});
   });
   
   socket.on('init-leitura', () => {
      sessaoAtual.status = "LEITURA";
      sessaoAtual.projeto = "Projeto de lei 0001/2021";
      let retorno = {
         status: sessaoAtual.status,
         projeto: sessaoAtual.projeto
      }

      socket.broadcast.emit('inicia-leitura', retorno);
   });

   socket.on('set-presenca', (vereador, presente) => {
      if (!!presente && vereadoresLogados.indexOf(vereador+'') < 0) {
         vereadoresLogados.push(vereador);
      } 

      if (!presente && vereadoresLogados.indexOf(vereador) >= 0) {
         vereadoresLogados.splice(vereadoresLogados.indexOf(vereador+''), 1)
      }

      socket.broadcast.emit('presenca', {id: vereador, presente});
   });

   socket.on('init-timer', () => {
      socket.broadcast.emit('inicia-timer', {date: new Date().getTime(), duracao: '5:00'});
   });

   socket.on('ping', function() {
      setTimeout(() => {
         socket.emit('pong');
      }, 2000)
   });

});
