import { useEffect, useState } from "react";
import { useRoom } from "../../UseRoom/useRoom";
import "react-datepicker/dist/react-datepicker.css";

const LeftRoomDetail = () => {
    const {room} = useRoom();
    const [mainImage, setMainImage] = useState(room?.imageRoom[0]);
    const handleThumbnailClick = (src: string) => {
        setMainImage(src);
    };
    useEffect(() => {
        if (room?.imageRoom[0]?.length > 0) {
            setMainImage(room?.imageRoom[0]);
        }
    }, [room]);
    return (
        <div className="rounded lg:col-span-2">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-full max-w-4xl">
                    <img
                        src={mainImage}
                        className="w-full rounded-lg"
                        alt="Main"
                    />
                </div>
                <div className="grid grid-cols-5 max-w-4xl gap-4">
                    {room?.imageRoom.map((src: string, index: number) => (
                        <img
                            key={index}
                            src={src}
                            className="thumb rounded-lg md:h-24 h-14 object-cover cursor-pointer hover:opacity-80"
                            alt={`Thumb ${index + 1}`}
                            onClick={() => handleThumbnailClick(src)}
                        />
                    ))}
                </div>
            </div>
        </div>

    )
}

export default LeftRoomDetail
