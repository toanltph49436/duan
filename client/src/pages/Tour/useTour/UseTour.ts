import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import instanceClient from '../../../../configs/instance';

export const useTour = () => {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['tour', id],
        queryFn: () => instanceClient.get(`/tour/${id}`),
        enabled: !!id, // chỉ gọi khi có id
    });

    const tour = data?.data?.tour;

    return { tour, isLoading, error };
};
