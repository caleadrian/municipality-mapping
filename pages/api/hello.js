// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var fs = require('fs');
import path from 'path'
import { absoluteUrl } from '../../utils/helper';

export default async function handler(req, res) {

  return new Promise(resolve => {

    if (req.method === 'GET') {

      const { host } = absoluteUrl(req)
      const data = []
      let walkPath = ''
      if (host === 'localhost:3000') {
        walkPath = './public/SanMariano';
      } else {
        walkPath = path.resolve('./public', 'SanMariano')
      }


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
                    label: file.split('\\').pop().split('/').pop().replace(/\.[^/.]+$/, ""),
                    category: file.split('/')[3]
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
