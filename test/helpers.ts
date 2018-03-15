import temp from "temp";

temp.track();

export function createTempDir(): Promise<string> {
  return new Promise((resolve, reject) => {
    temp.mkdir({prefix: "squeegpg-"}, (err, dirPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}
