// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var fs = require('fs');

export default async function handler(req, res) {

  return new Promise(resolve => {

    if (req.method === 'GET') {
      const data = []
      // let walkPath = './public/San Mariano Map 2022/Brgy Road';
      let walkPath = './public/San Mariano Map 2022';

      const walk = (dir, done) => {
        fs.readdir(dir, function (error, list) {
          if (error) {
            return done(error);
          }
          let i = 0;
          (function next() {
            var file = list[i++];

            if (!file) { return done(null); }

            file = dir + '/' + file;

            fs.stat(file, (error, stat) => {

              if (stat && stat.isDirectory()) {
                walk(file, (error) => {
                  next();
                });
              } else {

                if (file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2) === 'kml') {
                  data.push({
                    value: file.replace('./public', ''),
                    label: file.split('\\').pop().split('/').pop().replace(/\.[^/.]+$/, "")
                  })
                }
                next();

              }
            });
          })();
        });
      }

      walk(walkPath, (error) => {
        if (error) {
          res.status(200).json({ error: error });
          return resolve()

        } else {
          res.status(200).json({ files: data });
          return resolve()

        }
      })
    }
  })

}
