import { useQuery } from "@tanstack/react-query"
import instanceClient from "../../../../configs/instance"
import { useParams } from "react-router-dom"

const Content = () => {
    const {id} = useParams()
    const {data:tour} = useQuery({
        queryKey:['tour'],
        queryFn: () => instanceClient.get(`tour/${id}`)
    })
    const tours = tour?.data?.tour
  return (
      <section className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                      </svg>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      📖 Giới thiệu tour
                  </h2>
              </div>
              <p className="text-gray-600 text-lg">Khám phá chi tiết về chuyến du lịch tuyệt vời này</p>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="prose prose-lg max-w-none">
                  <div
                      className="text-gray-700 leading-relaxed tour-description"
                      dangerouslySetInnerHTML={{
                          __html: tours?.descriptionTour || "<p class='text-gray-500 italic'>Đang cập nhật thông tin tour...</p>",
                      }}
                  />
              </div>
          </div>

          {/* Features Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="bg-green-100 text-green-600 rounded-full p-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800">Chất lượng đảm bảo</h3>
                      </div>
                  </div>
                  <p className="text-gray-600 text-sm">Tour được thiết kế bởi đội ngũ chuyên nghiệp với nhiều năm kinh nghiệm</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800">An toàn tuyệt đối</h3>
                      </div>
                  </div>
                  <p className="text-gray-600 text-sm">Được bảo hiểm toàn diện và tuân thủ các tiêu chuẩn an toàn quốc tế</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="bg-purple-100 text-purple-600 rounded-full p-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800">Hỗ trợ 24/7</h3>
                      </div>
                  </div>
                  <p className="text-gray-600 text-sm">Đội ngũ hỗ trợ khách hàng luôn sẵn sàng phục vụ mọi lúc, mọi nơi</p>
              </div>
          </div>

          {/* Custom styles for tour description */}
          <style jsx>{`
              .tour-description h1,
              .tour-description h2,
              .tour-description h3 {
                  color: #1f2937;
                  font-weight: bold;
                  margin-top: 1.5rem;
                  margin-bottom: 1rem;
              }
              
              .tour-description p {
                  margin-bottom: 1rem;
                  line-height: 1.7;
              }
              
              .tour-description ul,
              .tour-description ol {
                  margin-left: 1.5rem;
                  margin-bottom: 1rem;
              }
              
              .tour-description li {
                  margin-bottom: 0.5rem;
              }
              
              .tour-description strong {
                  color: #374151;
                  font-weight: 600;
              }
          `}</style>
      </section>
  )
}

export default Content
