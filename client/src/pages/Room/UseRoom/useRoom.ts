import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import instanceClient from "../../../../configs/instance";

export const useRoom = () => {
    const { id } = useParams();

    const { data } = useQuery({
        queryKey: ['room', id],
        queryFn: () => instanceClient.get(`/room/${id}`)
    })
    const room = data?.data?.rooms

    return { room };
}

