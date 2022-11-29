const UserModel = require("../Models/User");
const jwt = require('jsonwebtoken');
const BlogModel = require("../Models/Blog");
const ProjectModel = require("../Models/Project");
const ManagerModel = require("../Models/Manager");
const bcrypt = require("bcrypt");
const { use } = require("../Routes/user");



const UserController = {
    // getInfo: async (req, res) => {
    //     try {
    //         // const userID = jwt.decode(req.headers.token.split(" ")[1]).id ?? req.params.idUser;
    //         const accessToken = await req.headers.cookie.split(";")[0].trim().split("=")[1];
    //         const userID = jwt.decode(accessToken);
    //         if (userID) {
    //             const user = await UserModel.findOne({ id: userID });
    //             res.status(200).json({ user: user });
    //         } else {
    //             res.status(403).json({ message: "Yêu cầu không hợp lệ" });
    //         }
    //     } catch (err) {
    //         // console.log(err);
    //         res.status(500).json("Error");
    //     }
    // },

    editInfo: async (req, res) => {
        try {
            const userID = jwt.decode(req.headers.token.split(" ")[1]).id;
            if (userID) {
                const user = await UserModel.findOne({ id: userID });
                if (user) {
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.email = req.body.email;
                    user.gender = req.body.gender;
                    await user.save();
                    res.status(200).json({ message: "Cập nhập thông tin thành công" });
                }
                else {
                    res.status(200).json({ message: "Không thể cập nhập" });
                }
            } else {
                res.status(403).json({ message: "Yêu cầu không hợp lệ" });
            }
        } catch (err) {
            res.status(500).json("Lỗi");
        }
    },

    changePassword: async (req, res) => {
        try {
            const userID = jwt.decode(req.headers.token.split(" ")[1]).id;
            if (userID) {
                const user = await UserModel.findById(userID);
                const salt = await bcrypt.genSalt(10);
                const oldPassword = req.body.oldPassword;
                if (user) {
                    const checkPassword = await bcrypt.compare(oldPassword, user.password);
                    if (checkPassword) {
                        const hashedPass = await bcrypt.hash(req.body.password, salt);
                        user.password = hashedPass;
                        await user.save();
                        return res.status(200).json("Cập nhập thông tin thành công");
                    }
                    else {
                        return res.status(400).json("Wrong password");
                    }
                }
            }
            return res.status(403).json("User is not empty")
        } catch (error) {
            res.status(500).json("Error");
        }
    },

    getInfo: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.idUser).select("_id firstName lastName email gender avatar");
            const blog = await BlogModel.find({ idUser: req.params.idUser, status: true });
            const projects = await ManagerModel.find({ idUser: req.params.idUser }).populate({
                path: 'idProject',
                match: { status: true }
            });
            res.status(200).json({ user, blog, projects });
        }
        catch (err) {
            console.log(err);
            res.status(200).json("Error");
        }
    },

    changeAvatar: async (req, res) => {
        try {
            const userID = jwt.decode(req.headers.token.split(" ")[1]).id;
            if (userID) {
                const user = await UserModel.findById(userID);
                user.avatar = req.body.avatar;
                const newUser = await user.save();
                const { password, ...others } = newUser._doc;
                return res.status(200).json(others);
            }

        } catch (error) {
            console.log(error);
            res.status(500).json("Error");
        }
    }
}

module.exports = UserController;
