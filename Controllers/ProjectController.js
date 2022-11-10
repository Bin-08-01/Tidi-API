const ProjectModel = require("../Models/Project");
const ManagerModel = require("../Models/Manager");
const jwt = require("jsonwebtoken");

const ProjectController = {
    addProject: async (req, res) => {
        try{
            const userID = jwt.decode(req.headers.token.split(" ")[1]).id ?? false;
            if(userID){
                let project = await ProjectModel({
                    title: req.body.title,
                    description: req.body.description,
                });
                project = await project.save();
                const idProject = project._id;
                const manager = await ManagerModel({
                    idUser: userID,
                    idProject: idProject,
                    role: 0
                })
                await manager.save();
                res.status(200).json({message: "Tạo project thành công"});
            }else{
                res.status(403).json({message: "Yêu cầu không hợp lệ"});
            }
        }catch(err){
            res.status(500).json(err);
        }
    },

    deleteProject: async (req, res) => {
        try{
            const userID = jwt.decode(req.headers.token.split(" ")[1]).id ?? false;
            const idProject = req.params.idProject;
            const idManager = await ManagerModel.findOne({idUser: userID, idProject: idProject});
            if(idManager?.role === 0){
                await ManagerModel.findByIdAndDelete(idManager);
                await ProjectModel.findByIdAndDelete(idProject);
                res.status(200).json({message: "Xoá project thành công"});
            }
            else{
                res.status(403).json({message: "Bạn không có quyền xoá"});
            }
        }catch(err){
            console.log(err);
            res.status(500).json("Lỗi");
        }
    },

    editProject: async (req, res) => {
        try{
            const userID = jwt.decode(req.headers.token.split(" ")[1]).id ?? false;
            const idProject = req.params.idProject;
            const project = await ProjectModel.findOne({id: idProject});
            const idManager = await ManagerModel.findOne({idUser: userID, idProject: idProject});
            if(idManager?.role === 0 && project){
                project.title = req.body.title;
                project.description = req.body.description;
                await project.save();
                res.status(200).json({message: "Thay đổi thông tin Project thành công"});
            }
            else{
                res.status(403).json({message: "Yêu cầu không hợp lệ"});
            }
        }catch(err){
            console.log(err);
            res.status(500).json("Lỗi");
        }
    }
}

module.exports = ProjectController;
