const jwt = require('jsonwebtoken');
const UserModel = require('../../models/People/UserModel.js');
const { StatusCodes } = require('http-status-codes');
const bcryptjs = require("bcryptjs");

const generateRefefreshToken = (userId) => {
    return jwt.sign({ userId }, "123456", { expiresIn: '1y' })
}
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, "123456", { expiresIn: '1m' })
}
const LoginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        //ktra emal đã tồn tại chưa
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({
                messages:['Email không tồn tại']
            })
        };
        //ktra xem có đúng mật chưa
        // const isMatch = await bcryptjs.compare(password, user.password);
        // if(!isMatch){
        //     return res.status(StatusCodes.BAD_REQUEST).json({
        //         messages:['Mật khẩu không chính xác']
        //     })
        // }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefefreshToken(user._id)
        return res.status(StatusCodes.OK).json({
            accessToken,
            refreshToken,
            email: user.email,
            username: user.username,
            userId: user.id,
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const RegisterUser = async (req, res) => {
    const { email, password, username, phone_number } = req.body;
    try {
        //ktra xem đã có email hay chưa
        const exitUser = await UserModel.findOne({email});
        if(exitUser){
            return res.status(StatusCodes.BAD_REQUEST).json({
                messages: ['Email đã tồn tại']
            })
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcryptjs.hash(password,10);

        const user = await UserModel.create({
            ...req.body,
            password:hashedPassword,
            username: username,
            phone_number: phone_number,
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "user register successfully",
            user: user
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const GetAllUser = async (req, res) => {
    try {
        const user = await UserModel.find();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User all successfully",
            user: user
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const GetByIdUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User by id successfully",
            user: user
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const PutUser = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User updated successfully",
            user: user
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const DeleteUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User delete successfully",
            user: user
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { LoginUser, RegisterUser, GetAllUser, GetByIdUser, PutUser, DeleteUser };