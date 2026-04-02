import type { Tour } from "../type"
import TourItem from "./TourItem"
import { Empty } from "antd"

type Props = {
    tours: Tour[]
    loading?: boolean
}

const TourList = ({ tours, loading = false }: Props) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!tours || tours.length === 0) {
        return (
            <div className="flex justify-center items-center py-16">
                <Empty 
                    description="Không tìm thấy tour nào phù hợp"
                    className="text-gray-500"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
            {tours.map((tour: Tour) => (
                <div key={tour._id} className="flex">
                    <TourItem tour={tour} />
                </div>
            ))}
        </div>
    );
};

export default TourList