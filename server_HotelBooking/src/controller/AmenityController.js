const Amenity = require("../models/Hotel/AmenityModel");
const { logger } = require("../config/logger");

class AmenityController {
    // Lấy danh sách tất cả tiện ích
    async getAllAmenities(req, res) {
        try {
            logger.info('AmenityController.getAllAmenities - Bắt đầu lấy danh sách tiện ích');
            
            const amenities = await Amenity.find().sort({ category: 1, name: 1 });
            
            logger.info(`AmenityController.getAllAmenities - Lấy thành công ${amenities.length} tiện ích`);
            
            res.status(200).json({
                success: true,
                message: "Lấy danh sách tiện ích thành công",
                data: amenities
            });
        } catch (error) {
            logger.error('AmenityController.getAllAmenities - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi lấy danh sách tiện ích",
                error: error.message
            });
        }
    }

    // Lấy danh sách tiện ích đang hoạt động
    async getActiveAmenities(req, res) {
        try {
            logger.info('AmenityController.getActiveAmenities - Bắt đầu lấy danh sách tiện ích đang hoạt động');
            
            const amenities = await Amenity.findActive();
            
            logger.info(`AmenityController.getActiveAmenities - Lấy thành công ${amenities.length} tiện ích đang hoạt động`);
            
            res.status(200).json({
                success: true,
                message: "Lấy danh sách tiện ích đang hoạt động thành công",
                data: amenities
            });
        } catch (error) {
            logger.error('AmenityController.getActiveAmenities - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi lấy danh sách tiện ích đang hoạt động",
                error: error.message
            });
        }
    }

    // Lấy tiện ích theo danh mục
    async getAmenitiesByCategory(req, res) {
        try {
            const { category } = req.params;
            logger.info(`AmenityController.getAmenitiesByCategory - Bắt đầu lấy tiện ích theo danh mục: ${category}`);
            
            const amenities = await Amenity.findByCategory(category);
            
            logger.info(`AmenityController.getAmenitiesByCategory - Lấy thành công ${amenities.length} tiện ích cho danh mục: ${category}`);
            
            res.status(200).json({
                success: true,
                message: `Lấy tiện ích theo danh mục ${category} thành công`,
                data: amenities
            });
        } catch (error) {
            logger.error('AmenityController.getAmenitiesByCategory - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi lấy tiện ích theo danh mục",
                error: error.message
            });
        }
    }

    // Lấy tiện ích theo ID
    async getAmenityById(req, res) {
        try {
            const { id } = req.params;
            logger.info(`AmenityController.getAmenityById - Bắt đầu lấy tiện ích với ID: ${id}`);
            
            const amenity = await Amenity.findById(id);
            
            if (!amenity) {
                logger.warn(`AmenityController.getAmenityById - Không tìm thấy tiện ích với ID: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tiện ích"
                });
            }
            
            logger.info(`AmenityController.getAmenityById - Lấy thành công tiện ích: ${amenity.name}`);
            
            res.status(200).json({
                success: true,
                message: "Lấy thông tin tiện ích thành công",
                data: amenity
            });
        } catch (error) {
            logger.error('AmenityController.getAmenityById - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi lấy thông tin tiện ích",
                error: error.message
            });
        }
    }

    // Tạo tiện ích mới
    async createAmenity(req, res) {
        try {
            const amenityData = req.body;
            logger.info('AmenityController.createAmenity - Bắt đầu tạo tiện ích mới:', amenityData);
            
            // Kiểm tra tiện ích đã tồn tại
            const existingAmenity = await Amenity.findOne({ name: amenityData.name });
            if (existingAmenity) {
                logger.warn(`AmenityController.createAmenity - Tiện ích "${amenityData.name}" đã tồn tại`);
                return res.status(400).json({
                    success: false,
                    message: "Tiện ích này đã tồn tại"
                });
            }
            
            const newAmenity = new Amenity(amenityData);
            const savedAmenity = await newAmenity.save();
            
            logger.info(`AmenityController.createAmenity - Tạo thành công tiện ích: ${savedAmenity.name}`);
            
            res.status(201).json({
                success: true,
                message: "Tạo tiện ích thành công",
                data: savedAmenity
            });
        } catch (error) {
            logger.error('AmenityController.createAmenity - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi tạo tiện ích",
                error: error.message
            });
        }
    }

    // Cập nhật tiện ích
    async updateAmenity(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            logger.info(`AmenityController.updateAmenity - Bắt đầu cập nhật tiện ích với ID: ${id}`, updateData);
            
            // Kiểm tra tiện ích có tồn tại không
            const existingAmenity = await Amenity.findById(id);
            if (!existingAmenity) {
                logger.warn(`AmenityController.updateAmenity - Không tìm thấy tiện ích với ID: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tiện ích"
                });
            }
            
            // Kiểm tra tên mới có trùng với tiện ích khác không
            if (updateData.name && updateData.name !== existingAmenity.name) {
                const duplicateAmenity = await Amenity.findOne({ 
                    name: updateData.name, 
                    _id: { $ne: id } 
                });
                if (duplicateAmenity) {
                    logger.warn(`AmenityController.updateAmenity - Tên tiện ích "${updateData.name}" đã tồn tại`);
                    return res.status(400).json({
                        success: false,
                        message: "Tên tiện ích này đã tồn tại"
                    });
                }
            }
            
            const updatedAmenity = await Amenity.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            logger.info(`AmenityController.updateAmenity - Cập nhật thành công tiện ích: ${updatedAmenity.name}`);
            
            res.status(200).json({
                success: true,
                message: "Cập nhật tiện ích thành công",
                data: updatedAmenity
            });
        } catch (error) {
            logger.error('AmenityController.updateAmenity - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi cập nhật tiện ích",
                error: error.message
            });
        }
    }

    // Xóa tiện ích
    async deleteAmenity(req, res) {
        try {
            const { id } = req.params;
            logger.info(`AmenityController.deleteAmenity - Bắt đầu xóa tiện ích với ID: ${id}`);
            
            // Kiểm tra tiện ích có tồn tại không
            const existingAmenity = await Amenity.findById(id);
            if (!existingAmenity) {
                logger.warn(`AmenityController.deleteAmenity - Không tìm thấy tiện ích với ID: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tiện ích"
                });
            }
            
            // Kiểm tra xem tiện ích có đang được sử dụng không
            if (existingAmenity.usageCount > 0) {
                logger.warn(`AmenityController.deleteAmenity - Tiện ích "${existingAmenity.name}" đang được sử dụng ${existingAmenity.usageCount} lần`);
                return res.status(400).json({
                    success: false,
                    message: "Không thể xóa tiện ích đang được sử dụng"
                });
            }
            
            await Amenity.findByIdAndDelete(id);
            
            logger.info(`AmenityController.deleteAmenity - Xóa thành công tiện ích: ${existingAmenity.name}`);
            
            res.status(200).json({
                success: true,
                message: "Xóa tiện ích thành công"
            });
        } catch (error) {
            logger.error('AmenityController.deleteAmenity - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi xóa tiện ích",
                error: error.message
            });
        }
    }

    // Tìm kiếm tiện ích
    async searchAmenities(req, res) {
        try {
            const { q, category, isActive } = req.query;
            logger.info('AmenityController.searchAmenities - Bắt đầu tìm kiếm tiện ích:', { q, category, isActive });
            
            let query = {};
            
            // Tìm kiếm theo tên
            if (q) {
                query.name = { $regex: q, $options: 'i' };
            }
            
            // Lọc theo danh mục
            if (category) {
                query.category = category;
            }
            
            // Lọc theo trạng thái
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }
            
            const amenities = await Amenity.find(query).sort({ category: 1, name: 1 });
            
            logger.info(`AmenityController.searchAmenities - Tìm kiếm thành công ${amenities.length} tiện ích`);
            
            res.status(200).json({
                success: true,
                message: "Tìm kiếm tiện ích thành công",
                data: amenities
            });
        } catch (error) {
            logger.error('AmenityController.searchAmenities - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi tìm kiếm tiện ích",
                error: error.message
            });
        }
    }

    // Thống kê tiện ích
    async getAmenityStats(req, res) {
        try {
            logger.info('AmenityController.getAmenityStats - Bắt đầu lấy thống kê tiện ích');
            
            const totalAmenities = await Amenity.countDocuments();
            const activeAmenities = await Amenity.countDocuments({ isActive: true });
            const inactiveAmenities = await Amenity.countDocuments({ isActive: false });
            
            // Thống kê theo danh mục
            const categoryStats = await Amenity.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        activeCount: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]);
            
            // Top 10 tiện ích được sử dụng nhiều nhất
            const topUsedAmenities = await Amenity.find()
                .sort({ usageCount: -1 })
                .limit(10)
                .select('name usageCount category');
            
            const stats = {
                total: totalAmenities,
                active: activeAmenities,
                inactive: inactiveAmenities,
                byCategory: categoryStats,
                topUsed: topUsedAmenities
            };
            
            logger.info('AmenityController.getAmenityStats - Lấy thống kê thành công');
            
            res.status(200).json({
                success: true,
                message: "Lấy thống kê tiện ích thành công",
                data: stats
            });
        } catch (error) {
            logger.error('AmenityController.getAmenityStats - Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi lấy thống kê tiện ích",
                error: error.message
            });
        }
    }
}

module.exports = new AmenityController();
