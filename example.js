const MutliMutex = require('.');

const multimutex = new MutliMutex();
multimutex.lock('lol')
  .then(unlock => {
    console.log('got first lock');

    setTimeout(unlock);
  });

multimutex.lock('lol')
  .then(unlock => {
    console.log('got second lock');

    multimutex.lock('lol')
      .then(unlock => {
        console.log('got third lock');

        unlock();
      });

    unlock();
  });
