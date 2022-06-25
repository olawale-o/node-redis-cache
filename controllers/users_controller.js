const mysqlConn = require('../database/connection');
const RedisClient = require('../database/redis_connection');
const User = require('../database/models/User');

async function getAllUsers(conn, obj = {}) {
  const { key = '', group = '' } = obj;
  const users = conn.SMEMBERS(group).then((ids) => {
    const persons = ids.map(async (id) => {
      return RedisClient.hGetAll(key+id).then((user) => {
        return new User(user);
      });
    });
    return Promise.all(persons);
  });
  return users;
}

module.exports = {
  getUsers:  async(req, res, next) => {
    try {
      const t0 = new Date().getTime();
      const cacheUsers = await RedisClient.SMEMBERS("users:");
      const t1 = new Date().getTime();

      if (cacheUsers.length)  {
          const users = await getAllUsers(RedisClient, { group: 'users:', key: 'user:' });
        return res.status(200).json({ message: "Successfull", users, responseTime: `${t1 - t0} ms`, source: 'redis' });
      } else {
          const t0 = new Date().getTime();
          const users = await mysqlConn('users').select().table('users');
          await users.forEach(async (user) => {
            await RedisClient.HSET(`user:${user.id}`, user);
            await RedisClient.EXPIRE(`user:${user.id}`, 3600);
            await RedisClient.SADD('users:', user.id.toString());
            await RedisClient.EXPIRE('users:', 3600);
          });
          const t2 = new Date().getTime();
          res.status(200).json({ message: "Successfull", users, responseTime: `${t2 - t0}ms`, source: 'mysql' });
      }
    } catch(e) {
      return next(e);
    }
  },
};
