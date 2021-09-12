const Profile = require("../models/profile");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/customError");
const Post = require("../models/post");
const User = require("../models/user");
const Follower = require("../models/follower");
const Following = require("../models/following");

const getProfile = async (req, res, next) => {
  let userId = req.params.id;
  try {
    let profile = await Profile.findOne({ userId });
    let posts = await Post.find({ createdBy: userId });
    if (!profile) {
      return next(new CustomError("profile not found", StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.OK).json({ profile, posts });
  } catch (error) {
    next(new CustomError(error.message, StatusCodes.BAD_REQUEST));
  }
};
const updateProfile = async (req, res, next) => {
  const { name, bio, photourl, location } = req.body;

  try {
    let user = await User.findOne({ _id: req.user.id });
    let profile = await Profile.findOne({ userId: req.user.id });
    if (profile) {
      profile.name = name;
      profile.bio = bio;
      profile.photurl = photourl;
      profile.locaiton = location;
      user.photourl = photourl;
      await user.save();
      await profile.save();
      return res.status(StatusCodes.OK);
    }
    return res.status(StatusCodes.BAD_REQUEST);
  } catch (error) {
    next(new CustomError(error.message, StatusCodes.BAD_REQUEST));
  }
};

const follow = async (req, res, next) => {
  const id = req.params.id;
  try {
    await Following.create({
      _id: req.user.id,
      following_id: id,
    });
    await Follower.create({
      _id: id,
      follower_id: req.user.id,
    });
    return res.status(StatusCodes.OK).send("");
  } catch (error) {
    next(new CustomError(error.message, StatusCodes.BAD_REQUEST));
  }
};

const unFollow = async (req, res, next) => {
  let id = req.params.id;
  let userId = req.user.id;
  try {
    await Following.findOneAndDelete({ _: userId, following_id: id });
    await Follower.findOneAndDelete({ _id: id, follower_id: userId });
    res.status(StatusCodes.OK).send("");
  } catch (error) {
    next(new CustomError(error.message, StatusCodes.BAD_REQUEST));
  }
};

const getFollowers = async (req, res, next) => {
  let userId = req.params.id;
  try {
    let followers = await Follower.find({ _id: userId }).populate(
      "follower_id",
      (select = ["username", "photourl", "_id"])
    );
    if (!followers) {
      res.status(new StatusCodes.NOT_FOUND()).send("followers not found");
    }
    return res.status(StatusCodes.OK).json({ followers });
  } catch (error) {
    next(new CustomError(error.message, StatusCodes.BAD_REQUEST));
  }
};
const getFollowing = async (req, res, next) => {
  let userId = req.params.id;
  try {
    let following = await Following.find({ _id: userId }).populate(
      "following_id",
      (select = ["username", "photourl", "_id"])
    );
    if (!following) {
      res.status(new StatusCodes.NOT_FOUND()).send("followers not found");
    }
    return res.status(StatusCodes.OK).json({ following });
  } catch (error) {
    next(new CustomError(error.message, StatusCodes.BAD_REQUEST));
  }
};

module.exports = {
  getProfile,
  updateProfile,
  follow,
  unFollow,
  getFollowers,
  getFollowing,
};
