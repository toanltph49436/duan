/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import instanceClient from "../../../../configs/instance";

type TourLike = Record<string, any>;
type Card = { title: string; image: string };

/* ---------- Helpers ---------- */

const isFeaturedValue = (v: any) =>
    v === true || v === 1 || v === "1" || v === "on" || String(v).toLowerCase() === "true";

const isFeaturedTour = (t: TourLike) =>
    isFeaturedValue(t?.isTopSelling) ||
    isFeaturedValue(t?.topSelling) ||
    isFeaturedValue(t?.isFeatured) ||
    isFeaturedValue(t?.featured) ||
    isFeaturedValue(t?.hot) ||
    isFeaturedValue(t?.isHot) ||
    isFeaturedValue(t?.sanPhamNoiBat) ||
    isFeaturedValue(t?.productFeatured) ||
    isFeaturedValue(t?.topselling) ||
    isFeaturedValue(t?.tourtopselling);

const normalizeToCard = (t: TourLike): Card => ({
    title: t?.nameTour || t?.name || t?.title || t?.tourName || "Tour",
    image:
        (Array.isArray(t?.imageTour) && t.imageTour[0]) ||
        t?.image ||
        t?.thumbnail ||
        t?.cover ||
        "https://via.placeholder.com/400x600?text=No+Image",
});

const extractArrayFromResponse = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.tourtopselling)) return payload.tourtopselling;
    if (Array.isArray(payload?.tours)) return payload.tours;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data?.docs)) return payload.data.docs;
    // fallback: if payload is object with numeric keys -> convert to array
    if (typeof payload === "object") {
        const values = Object.values(payload).filter((v) => Array.isArray(v));
        if (values.length) return values[0];
    }
    return [];
};

/* ---------- UI Card ---------- */

const FadeUpCard = ({ card, index }: { card: Card; index: number }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setIsVisible(true);
                });
            },
            { threshold: 0.3 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={cardRef}
            className={`w-64 sm:w-72 md:w-80 mx-2 sm:mx-3 md:mx-4 h-[28rem] sm:h-[30rem] relative group rounded-xl overflow-hidden shadow-lg transform transition-all duration-700 ease-in-out ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 120}ms` }}
        >
            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
            <div className="flex items-center justify-center px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-0 backdrop-blur-md left-0 w-full h-full bg-black/20">
                <p className="text-white text-base sm:text-lg md:text-xl font-semibold text-center">{card.title}</p>
            </div>
        </div>
    );
};

/* ---------- Component ---------- */

const FeaturedDestination = () => {
    const [pause, setPause] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["featuredTours"],
        queryFn: async () => {
            const endpoints = ["/tourtopselling", "/tour", "/tours"];
            for (const ep of endpoints) {
                try {
                    const res = await instanceClient.get(ep);
                    const items = extractArrayFromResponse(res?.data ?? res);
                    if (items && items.length) return { items, source: ep };
                    // if endpoint is explicit tourtopselling but returns empty, still return empty array (stop trying)
                    if (ep === "/tourtopselling") return { items: [], source: ep };
                } catch {
                    // try next endpoint
                }
            }
            // final fallback: return empty list
            return { items: [], source: "none" };
        },
        staleTime: 1000 * 60 * 5,
    });
    const candidateList: any[] = data?.items ?? [];

    const featuredItems = useMemo(() => candidateList.filter(isFeaturedTour), [candidateList]);

    const cards: Card[] = useMemo(() => featuredItems.map(normalizeToCard), [featuredItems]);

    if (isLoading) {
        return (
            <div className="min-h-full w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 flex flex-col items-center relative overflow-hidden py-12 sm:py-16">
                <p className="text-center text-gray-500">Đang tải tour nổi bật...</p>
            </div>
        );
    }

    return (
        <div className="min-h-full w-full flex flex-col items-center relative overflow-hidden py-12 sm:py-16">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                <style>{`
        .marquee-inner { animation: marqueeScroll linear infinite; }
        @keyframes marqueeScroll { 0%{ transform: translateX(0%); } 100%{ transform: translateX(-50%); } }
      `}</style>

                <div className="w-full flex flex-col md:flex-row justify-between items-start px-2 sm:px-4 md:px-6 lg:px-8 mb-10">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">Các địa điểm và phổ biến nhất</h2>
                        <div className="w-16 h-1 mt-2 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] rounded-full" />
                    </div>
                    <p className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed">
                        Tận hưởng sự xa hoa và đẳng cấp tối đa trên du thuyền mới nhất và phổ biến nhất. Khám phá một hành trình tuyệt
                        vời đưa bạn vào thế giới của sự sang trọng, tiện nghi và trải nghiệm không thể quên.
                    </p>
                </div>

                {cards.length === 0 ? (
                    <div className="w-full text-center text-gray-500 px-4">Chưa có tour nổi bật được chọn bởi admin.</div>
                ) : (
                    <div className="relative w-full overflow-hidden px-2 sm:px-4 md:px-6" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
                        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-[#F5F7FF] to-transparent" />
                        <div
                            className="marquee-inner flex w-fit"
                            style={{ animationPlayState: pause ? "paused" : "running", animationDuration: Math.max(cards.length, 1) * 3500 + "ms" }}
                        >
                            <div className="flex">
                                {[...cards, ...cards].map((card, idx) => (
                                    <FadeUpCard key={idx} card={card} index={idx % cards.length} />
                                ))}
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#F5F7FF] to-transparent" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturedDestination;
