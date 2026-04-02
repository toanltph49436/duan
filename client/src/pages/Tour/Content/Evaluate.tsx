/* eslint-disable @typescript-eslint/no-explicit-any */
import Rating from '@mui/material/Rating';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instanceClient from '../../../../configs/instance';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Evaluate = () => {
  const { id: tourId } = useParams();
  const userId = localStorage.getItem('userId')!;

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  // States cho reply
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // States cho edit
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cmt', tourId],
    enabled: !!tourId,
    queryFn: async () => {
      const res = await instanceClient.get(`/cmt/tour/${tourId}`);
      return res.data.cmt;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async () =>
      instanceClient.post(`/cmt/${userId}/${tourId}`, { rating, reviewText }),
    onSuccess: () => {
      setReviewText('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['cmt', tourId] });
    },
  });

  // Mutation cho reply
  const { mutate: replyMutation } = useMutation({
    mutationFn: async (commentId: string) =>
      instanceClient.post(`/cmt/${commentId}/reply`, { 
        replierId: userId, 
        replierType: 'User',
        replyText 
      }),
    onSuccess: () => {
      setReplyText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['cmt', tourId] });
    },
  });

  // Mutation cho edit
  const { mutate: editMutation } = useMutation({
    mutationFn: async () =>
      instanceClient.put(`/cmt/${userId}/${tourId}`, { 
        rating: editRating, 
        reviewText: editText 
      }),
    onSuccess: () => {
      setEditText('');
      setEditRating(5);
      setEditingComment(null);
      queryClient.invalidateQueries({ queryKey: ['cmt', tourId] });
    },
  });

  // Mutation cho delete
  const { mutate: deleteMutation } = useMutation({
    mutationFn: async () =>
      instanceClient.delete(`/cmt/${userId}/${tourId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmt', tourId] });
    },
  });

  const handleSubmit = () => {
    if (!reviewText.trim()) return;
    mutate();
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    replyMutation(commentId);
  };

  const handleEdit = () => {
    if (!editText.trim()) return;
    editMutation();
  };

  const handleDelete = () => {
    MySwal.fire({
      title: 'Bạn chắc chắn muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation();
      }
    });
  };

  const startEdit = (comment: any) => {
    setEditingComment(comment._id);
    setEditText(comment.reviewText);
    setEditRating(comment.rating);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
    setEditRating(5);
  };

  return (
    <section className="py-10 px-2 md:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl max-w-3xl mx-auto my-10 border border-blue-100">
      <h2 className="mb-4 text-2xl font-bold my-7 text-blue-700 drop-shadow">Đánh giá</h2>
      {/* Form đánh giá */}
      <div className="my-8 p-6 bg-white/80 rounded-xl shadow-md border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-blue-700">Chọn số sao:</span>
          <Rating value={rating} onChange={(_, v) => setRating(v || 5)} />
        </div>
        <textarea
          className="w-full border border-blue-200 rounded p-2 mb-2 bg-blue-50 focus:bg-white focus:border-blue-400 transition"
          rows={2}
          name='reviewText'
          placeholder="Chia sẻ cảm nhận của bạn..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-green-500 transition font-semibold"
          onClick={handleSubmit}
        >
          Gửi đánh giá
        </button>
      </div>

      {/* Danh sách bình luận */}
      {isLoading ? (
        <p>Đang tải bình luận…</p>
      ) : (
        <div className="space-y-6">
          {data?.map((c: any) => (
            <div
              key={c._id}
              className="bg-white rounded-xl shadow p-5 border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-blue-700">{c.userId?.username || 'Ẩn danh'}</span>
                <Rating value={c.rating} readOnly size="small" />
              </div>
              
              {/* Hiển thị nội dung comment hoặc form edit */}
              {editingComment === c._id ? (
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-blue-700">Chọn số sao:</span>
                    <Rating value={editRating} onChange={(_, v) => setEditRating(v || 5)} />
                  </div>
                  <textarea
                    className="w-full border border-blue-200 rounded p-2 mb-2 bg-blue-50 focus:bg-white focus:border-blue-400 transition"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600 transition"
                      onClick={handleEdit}
                    >
                      Lưu
                    </button>
                    <button
                      className="bg-gray-500 text-white px-4 py-1 rounded text-sm hover:bg-gray-600 transition"
                      onClick={cancelEdit}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800">{c.reviewText}</p>
              )}

              {/* Nút hành động cho comment */}
              <div className="flex gap-2 mt-3">
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                  onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                >
                  Trả lời
                </button>
                
                {/* Chỉ hiển thị nút edit/delete cho user sở hữu comment */}
                {c.userId?._id === userId && (
                  <>
                    <button
                      className="text-green-600 hover:text-green-800 text-sm font-medium transition"
                      onClick={() => startEdit(c)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                      onClick={handleDelete}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>

              {/* Form trả lời */}
              {replyingTo === c._id && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <textarea
                    className="w-full border border-blue-200 rounded p-2 mb-2 bg-white focus:border-blue-400 transition"
                    rows={2}
                    placeholder="Viết trả lời của bạn..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600 transition"
                      onClick={() => handleReply(c._id)}
                    >
                      Gửi trả lời
                    </button>
                    <button
                      className="bg-gray-500 text-white px-4 py-1 rounded text-sm hover:bg-gray-600 transition"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* replies */}
              {c.replies?.length > 0 && (
                <div className="mt-3 ml-4 space-y-2">
                  {c.replies.map((r: any) => (
                    <div
                      key={r._id}
                      className="text-sm bg-blue-100/70 rounded px-3 py-1 border-l-4 border-blue-400"
                    >
                      <span className="font-semibold text-blue-500">
                        {r.replierId?.username || 'Ẩn danh'}:
                      </span>{' '}
                      {r.replyText}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Evaluate