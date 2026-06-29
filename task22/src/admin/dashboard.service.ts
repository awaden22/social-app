import redisServices from "../DB/Models/Redis/redis.services.js"
import commentRepo from "../DB/Repo/comment.repo.js"
import postRepo from "../DB/Repo/post.repo.js"
import userRepo from "../DB/Repo/user.repo.js"

class DashboardService {

  private _userRepo = userRepo
  private _postRepo = postRepo
  private _commentRepo = commentRepo
  private _redisService = redisServices



  async getStatistics() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const users = await this._userRepo.allCount();
    const posts = await this._postRepo.allCount();
    const comments = await this._commentRepo.allCount();

    const usersToday = await this._userRepo.allCount({
      createdAt: { $gte: startOfDay }
    })
    const postsToday = await this._postRepo.allCount({
      createdAt: { $gte: startOfDay }
    })
    const commentsToday = await this._commentRepo.allCount({
      createdAt: { $gte: startOfDay }
    })

    const activeUsers = await redisServices.countSet("active:users");


    return {
      users: {
        total: users,
        today: usersToday
      },
      posts: {
        total: posts,
        today: postsToday
      },
      comments: {
        total: comments,
        today: commentsToday
      },
      activeUsers
    };

  }




}

export default new DashboardService()