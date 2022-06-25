const mysqlConn = require('../database/connection');
const RedisClient = require('../database/redis_connection');
const User = require('../database/models/User');

async function getAllUsers() {
  const users = RedisClient.SMEMBERS('users:').then((ids) => {
    const persons = ids.map(async (id) => {
        return RedisClient.hGetAll('user:'+id).then((user) => {
        return user;
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
      const cacheUsers = await RedisClient.sMembers("users:");
      const t1 = new Date().getTime();

      if (cacheUsers.length)  {
          const users = await getAllUsers();
        return res.status(200).json({ message: "Successfull", users, responseTime: `${t1 - t0} ms`, source: 'redis' });
      } else {
          const t0 = new Date().getTime();
          const users = await mysqlConn('users').select().table('users');
          await users.forEach(async (user) => {
            await RedisClient.hSet(`user:${user.id}`, user);
            await RedisClient.SADD('users:', user.id.toString());
          });
          const t2 = new Date().getTime();
          res.status(200).json({ message: "Successfull", users, responseTime: `${t2 - t0}ms`, source: 'mysql' });
      }
    } catch(e) {
      return next(e);
    }
  },
};

